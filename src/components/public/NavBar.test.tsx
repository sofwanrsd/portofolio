// Unit test untuk NavBar — island Menu_Navigasi (gaya neobrutalism).
//
// Memverifikasi struktur dan perilaku interaktif dasar NavBar:
//   - Merender tepat lima tautan navigasi (Req 5.1).
//   - Kondisi awal hamburger tertutup: menu mobile belum terlihat hingga
//     kontrol buka/tutup ditekan (Req 7.5).
//   - Mengetuk kontrol membuka menu mobile (Req 7.7).
//   - Penandaan tautan aktif: tepat satu tautan ditandai aktif sesuai bagian
//     yang dipilih (Req 5.4) — dihitung oleh resolveActiveNav.
//
// Catatan: NavBar kini default merender tautan sosial dari siteConfig di sisi
// kanan. Karena tautan sosial juga berupa elemen <a>, tes struktur tautan
// dirender dengan `socialLinks={[]}` agar hitungan tautan hanya mencakup lima
// tautan navigasi (Req 5.1).
//
// IntersectionObserver tidak tersedia di jsdom; di-stub sebagai kelas mock
// agar komponen ter-mount bersih (efek scroll-spy tidak memicu apa pun).
// window.scrollTo juga di-stub karena smooth-scroll dipanggil saat klik.

import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import NavBar from './NavBar';

// Stub IntersectionObserver: kelas mock no-op agar mount bersih di jsdom.
class MockIntersectionObserver {
  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit,
  ) {}
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
  root = null;
  rootMargin = '';
  thresholds = [];
}

beforeAll(() => {
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  // Smooth-scroll dipanggil pada klik tautan; jsdom tidak mengimplementasikannya.
  vi.stubGlobal('scrollTo', vi.fn());
});

/**
 * Menyiapkan elemen <section> untuk setiap id tautan navigasi sehingga
 * handleNavigate menemukan target dan menandai tautan sebagai aktif.
 */
function mountSections() {
  for (const id of ['about', 'skills', 'projects', 'history', 'certifications', 'contact']) {
    const section = document.createElement('section');
    section.id = id;
    document.body.appendChild(section);
  }
}

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

describe('NavBar — struktur tautan (Req 5.1)', () => {
  it('merender tepat enam tautan navigasi', () => {
    render(<NavBar socialLinks={[]} />);
    expect(screen.getAllByRole('link')).toHaveLength(6);
  });

  it('merender label keenam bagian', () => {
    render(<NavBar socialLinks={[]} />);
    for (const label of [
      'Tentang',
      'Keahlian',
      'Proyek',
      'Riwayat',
      'Sertifikat',
      'Kontak',
    ]) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });
});

describe('NavBar — kontrol hamburger (Req 7.5, 7.7)', () => {
  it('kondisi awal hamburger tertutup: menu mobile belum dirender', () => {
    render(<NavBar socialLinks={[]} />);

    // Panel menu mobile hanya dirender saat terbuka.
    expect(document.getElementById('navbar-mobile-menu')).toBeNull();

    // Tombol toggle menandai kondisi tertutup.
    const toggle = screen.getByRole('button', { name: 'Buka menu navigasi' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('mengetuk kontrol membuka menu mobile', async () => {
    const user = userEvent.setup();
    render(<NavBar socialLinks={[]} />);

    const toggle = screen.getByRole('button', { name: 'Buka menu navigasi' });
    await user.click(toggle);

    // Panel menu mobile kini terlihat dan tombol menandai kondisi terbuka.
    expect(document.getElementById('navbar-mobile-menu')).not.toBeNull();
    expect(
      screen.getByRole('button', { name: 'Tutup menu navigasi' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('NavBar — penandaan tautan aktif (Req 5.4)', () => {
  it('menandai tepat satu tautan aktif saat tautan dipilih', async () => {
    mountSections();
    const user = userEvent.setup();
    render(<NavBar socialLinks={[]} />);

    await user.click(screen.getByRole('link', { name: 'Proyek' }));

    // Tepat satu tautan ditandai aktif, yaitu tautan yang dipilih.
    const active = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('aria-current') === 'true');
    expect(active).toHaveLength(1);
    expect(active[0]).toHaveTextContent('Proyek');
  });

  it('tidak menandai tautan aktif sebelum ada interaksi/bagian terlihat', () => {
    render(<NavBar socialLinks={[]} />);
    const active = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('aria-current') === 'true');
    expect(active).toHaveLength(0);
  });
});
