/**
 * Uji integrasi/validasi Pipeline_CICD (Task 17.2)
 * Memvalidasi: Requirements 10.1, 10.3, 10.5, 10.6, 10.7, 4.6
 *
 * KONTEKS:
 * Sebuah eksekusi GitHub Actions yang sesungguhnya pada branch percobaan TIDAK
 * dapat dijalankan di lingkungan ini (membutuhkan VPS, Secrets SSH, dan runner
 * GitHub). Karena itu uji ini bersifat STRUKTURAL/STATIK: membaca berkas workflow
 * `.github/workflows/deploy.yml` dan memastikan pipeline meng-encode perilaku
 * yang diwajibkan requirements:
 *   - Trigger push ke main/master (Req 10.1)
 *   - Gate test (npm test) + build (astro build / npm run build) sebelum deploy;
 *     kegagalan build menghentikan deploy karena build mendahului langkah deploy (Req 10.5)
 *   - Verifikasi jumlah berkas + total ukuran antara sumber & tujuan sebelum swap,
 *     dengan abort saat tidak cocok (Req 10.3, 10.6)
 *   - Atomic swap via symlink (mv -T) dan pertahankan versi lama saat gagal (Req 10.6)
 *   - timeout-minutes <= 5 (Req 10.7)
 *   - Hanya env PUBLIC_* yang diinjeksi (tanpa service_role / kunci rahasia) (Req 4.6)
 *
 * Assertion dibuat TOLERAN terhadap format (regex/substring/contains) agar tidak
 * rapuh terhadap perubahan tata letak YAML yang tidak mengubah perilaku.
 *
 * -----------------------------------------------------------------------------
 * CARA MENJALANKAN PIPELINE SUNGGUHAN PADA BRANCH PERCOBAAN (manual, di luar CI ini):
 *
 *   1. Konfigurasikan GitHub Secrets pada repo (Settings -> Secrets and variables
 *      -> Actions): VPS_HOST, VPS_USER, SSH_PRIVATE_KEY, VPS_TARGET_DIR
 *      (opsional: VPS_PORT, VPS_KNOWN_HOSTS).
 *   2. Buat branch sementara, mis: `git checkout -b trial/deploy-smoke`.
 *   3. Sementara tambahkan branch tersebut ke trigger `on.push.branches` di
 *      deploy.yml (atau arahkan VPS_TARGET_DIR ke DocumentRoot staging khusus uji),
 *      lalu `git push -u origin trial/deploy-smoke`.
 *   4. Amati run di tab Actions:
 *        - Build sukses  -> rsync ke release baru, verifikasi cocok, symlink ditukar
 *          atomik, situs menyajikan versi terbaru.
 *        - Build gagal   -> job berhenti sebelum deploy; symlink lama tidak berubah
 *          sehingga versi sebelumnya tetap tersaji (Req 10.5).
 *        - Verifikasi tidak cocok -> deploy di-abort, release gagal dibersihkan,
 *          versi lama dipertahankan (Req 10.6).
 *   5. Setelah selesai, kembalikan perubahan trigger dan hapus branch percobaan.
 * -----------------------------------------------------------------------------
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Pipeline_CICD workflow (deploy.yml) — validasi struktural', () => {
  const root = process.cwd();
  const workflowPath = resolve(root, '.github/workflows/deploy.yml');
  const wf = readFileSync(workflowPath, 'utf8');
  // Versi tanpa baris komentar (#...) agar assertion menilai perilaku NYATA,
  // bukan sekadar teks dokumentasi di komentar.
  const wfActive = wf
    .split(/\r?\n/)
    .filter((line: string) => !line.trim().startsWith('#'))
    .join('\n');

  it('berkas workflow ada dan tidak kosong', () => {
    expect(wf.length).toBeGreaterThan(0);
  });

  it('trigger pada push ke branch main/master (Req 10.1)', () => {
    // Harus ada blok `on:` dengan push, dan mencantumkan main serta master.
    expect(wfActive).toMatch(/on:/);
    expect(wfActive).toMatch(/push:/);
    expect(wfActive).toMatch(/branches:/);
    expect(wfActive).toMatch(/-\s*main\b/);
    expect(wfActive).toMatch(/-\s*master\b/);
  });

  it('menjalankan test gate (npm test) sebelum deploy (Req 10.5)', () => {
    expect(wfActive).toMatch(/npm\s+test/);
  });

  it('menjalankan build (astro build / npm run build) sebagai gate (Req 10.5)', () => {
    expect(wfActive).toMatch(/npm\s+run\s+build|astro\s+build/);
  });

  it('build mendahului langkah deploy sehingga kegagalan build menghentikan deploy (Req 10.5)', () => {
    // Posisi langkah test & build harus sebelum langkah deploy (rsync/atomic swap).
    const idxTest = wfActive.search(/npm\s+test/);
    const idxBuild = wfActive.search(/npm\s+run\s+build|astro\s+build/);
    const idxRsync = wfActive.search(/rsync\b/);
    const idxSwap = wfActive.search(/atomic swap|mv\s+-T/i);

    expect(idxTest).toBeGreaterThanOrEqual(0);
    expect(idxBuild).toBeGreaterThanOrEqual(0);
    expect(idxRsync).toBeGreaterThanOrEqual(0);

    // Test dan build harus muncul sebelum rsync (deploy).
    expect(idxTest).toBeLessThan(idxRsync);
    expect(idxBuild).toBeLessThan(idxRsync);
    // Build mendahului swap atomik bila langkah swap teridentifikasi.
    if (idxSwap >= 0) {
      expect(idxBuild).toBeLessThan(idxSwap);
    }
  });

  it('memverifikasi jumlah berkas sumber vs tujuan (SRC_COUNT/DST_COUNT) (Req 10.3)', () => {
    expect(wfActive).toMatch(/SRC_COUNT/);
    expect(wfActive).toMatch(/DST_COUNT/);
  });

  it('memverifikasi total ukuran byte sumber vs tujuan (SRC_BYTES/DST_BYTES) (Req 10.3)', () => {
    expect(wfActive).toMatch(/SRC_BYTES/);
    expect(wfActive).toMatch(/DST_BYTES/);
  });

  it('membandingkan metrik sumber vs tujuan dan abort (exit) saat tidak cocok (Req 10.3, 10.6)', () => {
    // Harus ada perbandingan ketidaksamaan antara metrik sumber dan tujuan...
    const comparesCount = /SRC_COUNT[\s"${}]*!=[\s"${}]*DST_COUNT|DST_COUNT[\s"${}]*!=[\s"${}]*SRC_COUNT/.test(
      wfActive,
    );
    const comparesBytes = /SRC_BYTES[\s"${}]*!=[\s"${}]*DST_BYTES|DST_BYTES[\s"${}]*!=[\s"${}]*SRC_BYTES/.test(
      wfActive,
    );
    expect(comparesCount || comparesBytes).toBe(true);
    // ...dan saat tidak cocok pipeline keluar dengan kode error (abort).
    expect(wfActive).toMatch(/exit\s+1/);
  });

  it('melakukan atomic swap via symlink (mv -T) ke DocumentRoot (Req 10.4, 10.6)', () => {
    // Pembuatan symlink dan penimpaan atomik dengan mv -T.
    expect(wfActive).toMatch(/ln\s+-s/);
    expect(wfActive).toMatch(/mv\s+-T/);
  });

  it('mempertahankan versi lama saat gagal: swap hanya setelah verifikasi cocok (Req 10.6)', () => {
    // Langkah verifikasi (perbandingan + exit) harus mendahului atomic swap (mv -T symlink),
    // sehingga ketika verifikasi gagal, symlink lama tidak pernah ditimpa.
    const idxCompare = wfActive.search(/SRC_COUNT[\s"}]*!=|SRC_BYTES[\s"}]*!=/);
    const idxSwap = wfActive.search(/mv\s+-T\s+"?\$\{?TMP_LINK|ln\s+-s/);
    expect(idxCompare).toBeGreaterThanOrEqual(0);
    expect(idxSwap).toBeGreaterThanOrEqual(0);
    expect(idxCompare).toBeLessThan(idxSwap);
  });

  it('menetapkan timeout-minutes <= 5 (Req 10.7)', () => {
    const match = wfActive.match(/timeout-minutes:\s*(\d+)/);
    expect(match).not.toBeNull();
    const minutes = Number(match![1]);
    expect(minutes).toBeGreaterThan(0);
    expect(minutes).toBeLessThanOrEqual(5);
  });

  it('TIDAK menginjeksi env Supabase apa pun ke proses build (mode JSON)', () => {
    // Sumber data kini JSON (di-bundle) + GitHub (runtime); tidak ada env
    // Supabase yang perlu diinjeksi. Pastikan tidak ada jejak Supabase.
    expect(wfActive).not.toMatch(/SUPABASE/i);
  });

  it('TIDAK mereferensikan service-role atau kunci rahasia (Req 4.6)', () => {
    // Tidak boleh ada jejak kunci rahasia / service-role pada konfigurasi AKTIF.
    expect(wfActive).not.toMatch(/service[_-]?role/i);
    expect(wfActive).not.toMatch(/SERVICE_ROLE_KEY/i);
    expect(wfActive).not.toMatch(/SECRET_KEY/i);
  });
});
