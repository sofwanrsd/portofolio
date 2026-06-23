// Unit test untuk ThemeToggle (Kontrol_Tema).
//
// Memverifikasi efek toggle terhadap DOM dan persistensi preferensi:
//   - Mengklik tombol mengalihkan kelas `dark` pada document.documentElement
//     (<html>) (Req 17.1, 17.3)
//   - Preferensi baru disimpan ke localStorage di bawah kunci tema (Req 17.4)
//
// Memakai prop `initialTheme` agar state awal deterministik tanpa bergantung
// pada preferensi sistem.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ThemeToggle from './ThemeToggle';
import { THEME_STORAGE_KEY } from '../../lib/theme';

beforeEach(() => {
  // Bersihkan state DOM dan penyimpanan antar tes.
  document.documentElement.classList.remove('dark');
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('ThemeToggle', () => {
  it('mengalihkan kelas `dark` pada <html> dari terang ke gelap saat diklik (Req 17.1, 17.3)', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle initialTheme="light" />);

    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Tombol bergaya neobrutalism tetap aksesibel: aria-pressed mencerminkan state.
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');

    await user.click(button);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('menghapus kelas `dark` saat dialihkan dari gelap ke terang (Req 17.3)', async () => {
    document.documentElement.classList.add('dark');
    const user = userEvent.setup();
    render(<ThemeToggle initialTheme="dark" />);

    await user.click(screen.getByRole('button'));

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('menyimpan preferensi tema baru ke localStorage (Req 17.4)', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const user = userEvent.setup();
    render(<ThemeToggle initialTheme="light" />);

    await user.click(screen.getByRole('button'));

    expect(setItemSpy).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('mempertahankan preferensi melalui dua kali toggle (round-trip ke localStorage) (Req 17.3, 17.4)', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle initialTheme="light" />);

    const button = screen.getByRole('button');
    await user.click(button); // light -> dark
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    await user.click(button); // dark -> light
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
