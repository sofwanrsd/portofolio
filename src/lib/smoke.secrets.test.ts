import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Smoke test pemindaian rahasia.
// Memastikan tidak ada pola kunci service-role/rahasia pada sumber yang
// dikomit (src/) maupun output build (dist/, jika ada). Berlaku untuk mode
// JSON saat ini dan tetap relevan saat backend MongoDB ditambahkan kelak.

// Pola rahasia dibangun dari potongan agar literalnya sendiri tidak memicu
// kecocokan saat berkas tes ini ikut terpindai.
const FORBIDDEN_PATTERNS: string[] = [
  ['service', 'role'].join('_'), // service_role
  ['SERVICE', 'ROLE', 'KEY'].join('_'), // SERVICE_ROLE_KEY
  ['SECRET', 'KEY'].join('_'), // SECRET_KEY
];

// Ekstensi berkas teks yang relevan untuk dipindai.
const TEXT_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.astro',
  '.json',
  '.html',
  '.css',
  '.mjs',
  '.cjs',
];

// Lewati berkas tes agar literal pola di dalam tes tidak menimbulkan positif palsu.
const isTestFile = (name: string) =>
  /\.(test|spec)\.[cm]?[jt]sx?$/.test(name);

const hasTextExtension = (name: string) =>
  TEXT_EXTENSIONS.some((ext) => name.endsWith(ext));

/** Kumpulkan path berkas teks secara rekursif di bawah `dir`. */
function collectTextFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectTextFiles(full));
    } else if (entry.isFile() && hasTextExtension(entry.name) && !isTestFile(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

/** Temukan kecocokan pola terlarang pada kumpulan berkas. */
function scanForSecrets(files: string[]): { file: string; pattern: string }[] {
  const hits: { file: string; pattern: string }[] = [];
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (content.includes(pattern)) {
        hits.push({ file, pattern });
      }
    }
  }
  return hits;
}

const root = process.cwd();
const srcDir = join(root, 'src');
const distDir = join(root, 'dist');

describe('pemindaian rahasia pada sumber (src/)', () => {
  it('tidak ada pola kunci service-role/rahasia di src/', () => {
    const files = collectTextFiles(srcDir);
    const hits = scanForSecrets(files);
    expect(hits).toEqual([]);
  });
});

describe('pemindaian rahasia pada output build (dist/)', () => {
  const distExists = existsSync(distDir) && statSync(distDir).isDirectory();

  it.skipIf(!distExists)('tidak ada pola kunci service-role/rahasia di dist/', () => {
    const files = collectTextFiles(distDir);
    const hits = scanForSecrets(files);
    expect(hits).toEqual([]);
  });
});
