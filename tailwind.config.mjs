/** @type {import('tailwindcss').Config} */
export default {
  // darkMode 'class': tema gelap dikontrol oleh kelas `dark` pada <html> (Req 17).
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      maxWidth: {
        // Lebar maksimum konten untuk layar lebar (Req 7.4).
        content: '1280px',
      },
      // Keluarga font neobrutalism: Space Grotesk untuk body, Archivo Black
      // (900) untuk heading. Di-load via <link> Google Fonts pada BaseLayout.astro.
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        display: ['"Archivo Black"', 'system-ui', 'sans-serif'],
      },
      // Bayangan keras tanpa blur (neobrutalism), offset solid warna `ink`.
      // Komponen juga dapat memakai utilitas shadow arbitrary bila diperlukan.
      boxShadow: {
        brutal: '4px 4px 0 0 #1A1A1A',
        'brutal-sm': '2px 2px 0 0 #1A1A1A',
        'brutal-lg': '6px 6px 0 0 #1A1A1A',
      },
      // Skala heading neobrutalism: H1 raksasa, H2/H3 tebal.
      fontSize: {
        h1: ['clamp(3rem, 8vw, 6rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        h2: ['clamp(2.25rem, 5vw, 3rem)', { lineHeight: '1', letterSpacing: '0.01em' }],
        h3: ['1.5rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
      },
      colors: {
        // Token neobrutalism (Req desain): aksen ORANYE + tinta gelap.
        accent: '#FF6A00',
        // `ink`: warna garis tepi tebal & offset shadow pada Mode_Tema terang.
        // Pada Mode_Tema gelap, peran ink digantikan oleh token teks gelap.
        ink: '#1A1A1A',
        // Token warna teks/latar untuk Mode_Tema terang dan gelap (Req 17.6).
        // Nilai dicerminkan dari `palette` di `src/lib/theme.ts` (sumber kebenaran
        // yang divalidasi rasio kontras >= 4.5:1 oleh Properti 13).
        light: {
          background: '#FFFFFF',
          surface: '#FFFFFF',
          text: '#000000',
          'text-muted': '#3A3A3A',
          primary: '#111111',
        },
        dark: {
          background: '#161616',
          surface: '#1F1F1F',
          text: '#F5F5F5',
          'text-muted': '#B5B5B5',
          primary: '#FAFAFA',
        },
      },
    },
  },
  plugins: [],
};
