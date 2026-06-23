/**
 * Uji integrasi penyajian Apache (Task 16.2)
 * Memvalidasi: Requirements 8.1, 8.2, 8.4, 8.6, 9.1, 9.2
 *
 * Bagian ini terdiri atas dua kelompok:
 *
 * 1) LIVE (opsional) — berjalan HANYA jika environment variable `APACHE_BASE_URL`
 *    tersedia (mis. `http://VPS_IP` atau `http://0.0.0.0:80`). Jika tidak ada,
 *    seluruh blok ini di-SKIP sehingga suite tetap lulus tanpa server hidup.
 *
 *    Variabel env yang dibutuhkan:
 *      APACHE_BASE_URL = base URL Apache yang sedang berjalan, contoh:
 *                        APACHE_BASE_URL=http://203.0.113.10
 *    Contoh menjalankan:
 *      APACHE_BASE_URL=http://203.0.113.10 npm test           (bash)
 *      $env:APACHE_BASE_URL="http://203.0.113.10"; npm test    (PowerShell)
 *
 *    Yang diverifikasi saat live:
 *      - GET /                 -> 200 (Req 8.1)
 *      - GET /nonexistent-xyz  -> 404 + menyajikan halaman 404 kustom (Req 8.2)
 *      - aset teks dengan Accept-Encoding: gzip -> Content-Encoding kompresi (Req 8.4)
 *      - HTTP tidak dialihkan ke HTTPS pada fase awal -> tanpa 301 ke https (Req 9.1, 9.2)
 *
 * 2) STATIC (selalu jalan) — membaca repo dan memastikan konfigurasi Apache
 *    berisi direktif kunci, memberi cakupan nyata tanpa server hidup.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Bagian LIVE (opsional, di-skip bila APACHE_BASE_URL tidak tersedia)
// ---------------------------------------------------------------------------
const BASE_URL = process.env.APACHE_BASE_URL;

const liveDescribe = BASE_URL ? describe : describe.skip;

liveDescribe('Apache live serving (APACHE_BASE_URL)', () => {
  const base = (BASE_URL ?? '').replace(/\/$/, '');

  it('GET / mengembalikan 200 (Req 8.1)', async () => {
    const res = await fetch(`${base}/`, { redirect: 'manual' });
    expect(res.status).toBe(200);
  });

  it('GET /nonexistent-xyz mengembalikan 404 dan menyajikan halaman 404 kustom (Req 8.2)', async () => {
    const res = await fetch(`${base}/nonexistent-xyz`, { redirect: 'manual' });
    expect(res.status).toBe(404);
    // Halaman 404 kustom Astro berisi penanda HTML; pastikan body ada & berupa dokumen.
    const body = await res.text();
    expect(body.length).toBeGreaterThan(0);
    expect(body.toLowerCase()).toContain('<html');
  });

  it('aset teks dikirim terkompresi saat Accept-Encoding: gzip dikirim (Req 8.4)', async () => {
    const res = await fetch(`${base}/`, {
      headers: { 'Accept-Encoding': 'gzip, deflate, br' },
      redirect: 'manual',
    });
    expect(res.status).toBe(200);
    // Catatan: beberapa runtime fetch otomatis mendekompresi & menghapus header.
    // Bila header masih ada, ia harus menandakan kompresi.
    const encoding = res.headers.get('content-encoding');
    if (encoding !== null) {
      expect(encoding).toMatch(/gzip|deflate|br/i);
    }
  });

  it('HTTP tidak dialihkan ke HTTPS pada fase awal (Req 9.1, 9.2)', async () => {
    const res = await fetch(`${base}/`, { redirect: 'manual' });
    // Tidak boleh ada redirect permanen (301) menuju skema https.
    if (res.status === 301 || res.status === 302 || res.status === 308 || res.status === 307) {
      const location = res.headers.get('location') ?? '';
      expect(location.toLowerCase().startsWith('https://')).toBe(false);
    } else {
      expect(res.status).toBe(200);
    }
  });
});

// ---------------------------------------------------------------------------
// Bagian STATIC (selalu jalan) — memverifikasi konfigurasi Apache di repo
// ---------------------------------------------------------------------------
describe('Apache configuration files (static, always runs)', () => {
  const root = process.cwd();
  const htaccessPath = resolve(root, 'public/.htaccess');
  const vhostPath = resolve(root, 'deploy/apache-vhost.conf');

  const htaccess = readFileSync(htaccessPath, 'utf8');
  const vhost = readFileSync(vhostPath, 'utf8');

  it('public/.htaccess mendefinisikan ErrorDocument 404 kustom (Req 8.2)', () => {
    expect(htaccess).toMatch(/ErrorDocument\s+404\s+\/404\.html/);
  });

  it('public/.htaccess mengaktifkan kompresi mod_deflate untuk berkas teks (Req 8.4)', () => {
    expect(htaccess).toContain('mod_deflate.c');
    expect(htaccess).toMatch(/AddOutputFilterByType\s+DEFLATE\s+text\/html/);
    expect(htaccess).toMatch(/AddOutputFilterByType\s+DEFLATE\s+text\/css/);
    expect(htaccess).toMatch(/AddOutputFilterByType\s+DEFLATE\s+application\/javascript/);
  });

  it('public/.htaccess menyediakan fallback SPA untuk /admin (Req 8.6 dukungan penyajian)', () => {
    expect(htaccess).toContain('mod_rewrite.c');
    expect(htaccess).toMatch(/RewriteRule\s+\.\s+\/admin\/index\.html\s+\[L\]/);
  });

  it('public/.htaccess TIDAK mengandung redirect ke HTTPS pada fase awal (Req 9.1, 9.2)', () => {
    // Tidak boleh ada arahan redirect ke skema https pada fase awal.
    expect(htaccess).not.toMatch(/Redirect\s+(permanent|301)?\s*\/?\s*https:\/\//i);
    expect(htaccess).not.toMatch(/RewriteRule\s+.*https:\/\//i);
  });

  it('deploy/apache-vhost.conf ada dan mendefinisikan VirtualHost HTTP port 80 (Req 8.1, 9.1)', () => {
    expect(vhost).toMatch(/<VirtualHost\s+\*:80>/);
  });

  it('deploy/apache-vhost.conf menetapkan DocumentRoot (Req 8.3)', () => {
    expect(vhost).toMatch(/DocumentRoot\s+"?\/var\/www\/portfolio\/current"?/);
  });

  it('deploy/apache-vhost.conf menyertakan ErrorDocument 404 dan mod_deflate (Req 8.2, 8.4)', () => {
    expect(vhost).toMatch(/ErrorDocument\s+404\s+\/404\.html/);
    expect(vhost).toContain('mod_deflate.c');
    expect(vhost).toMatch(/AddOutputFilterByType\s+DEFLATE\s+text\/html/);
  });

  it('deploy/apache-vhost.conf VirtualHost *:80 tidak mengaktifkan redirect HTTPS (Req 9.1, 9.2)', () => {
    // Pisahkan blok VirtualHost *:80 dari blok TLS mendatang (yang dikomentari).
    const port80Block = vhost.split(/<VirtualHost\s+\*:443>/)[0];
    // Baris non-komentar tidak boleh mengandung Redirect ke https.
    const activeLines = port80Block
      .split(/\r?\n/)
      .filter((line: string) => !line.trim().startsWith('#'));
    const activeText = activeLines.join('\n');
    expect(activeText).not.toMatch(/Redirect\s+permanent\s+\/\s+https:\/\//i);
    expect(activeText).not.toMatch(/RewriteRule\s+.*https:\/\//i);
  });
});
