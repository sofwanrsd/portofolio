"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Satu komponen kecil untuk semua animasi berbasis scroll di situs publik.
 *
 * - [data-reveal]  : elemen muncul halus saat masuk layar (kelas .is-in).
 * - [data-count]   : angka menghitung naik dari 0 saat terlihat.
 * - .spot          : kartu mendapat cahaya yang mengikuti kursor.
 *
 * Konten tetap terlihat tanpa JavaScript, karena status tersembunyi hanya
 * aktif saat <html> punya kelas "js". Preferensi gerak dikurangi dihormati.
 */
export function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const showAll = () =>
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => el.classList.add("is-in", "done"));

    const runCount = (el: HTMLElement) => {
      if (el.dataset.counted) return;
      el.dataset.counted = "1";
      const target = Number(el.dataset.count || 0);
      const suffix = el.dataset.suffix || "";
      if (reduce || !Number.isFinite(target)) {
        el.textContent = `${target}${suffix}`;
        return;
      }
      const start = performance.now();
      const duration = 1200;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${Math.round(target * eased)}${suffix}`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (reduce || !("IntersectionObserver" in window)) {
      showAll();
      document.querySelectorAll<HTMLElement>("[data-count]").forEach(runCount);
      return;
    }

    const show = (el: HTMLElement) => {
      if (el.hasAttribute("data-reveal") && !el.classList.contains("is-in")) {
        el.classList.add("is-in");
        const delay = Number(getComputedStyle(el).getPropertyValue("--i") || 0) * 80;
        window.setTimeout(() => el.classList.add("done"), 900 + delay);
      }
      if (el.hasAttribute("data-count")) runCount(el);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target as HTMLElement);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    // Pengaman untuk scroll sangat cepat atau lompatan lewat anchor (#pricing):
    // elemen yang sudah terlewat di atas layar tetap dimunculkan.
    let ticking = false;
    const catchUp = () => {
      ticking = false;
      const limit = window.innerHeight;
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in), [data-count]:not([data-counted])")
        .forEach((el) => {
          if (el.getBoundingClientRect().top < limit) {
            show(el);
            io.unobserve(el);
          }
        });
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(catchUp);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", onScroll);

    const scan = () => {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in), [data-count]:not([data-counted])")
        .forEach((el) => io.observe(el));
    };
    scan();

    // Halaman baru di App Router bisa masuk bertahap, jadi pantau perubahan DOM.
    const main = document.getElementById("main") ?? document.body;
    const mo = new MutationObserver(() => scan());
    mo.observe(main, { childList: true, subtree: true });

    // Pengaman: apa pun yang terjadi, konten di layar tampil setelah 2,5 detik.
    const failsafe = window.setTimeout(catchUp, 2500);
    if (window.location.hash) requestAnimationFrame(catchUp);

    // Cahaya mengikuti kursor, hanya untuk perangkat dengan mouse.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      const card = (e.target as HTMLElement | null)?.closest<HTMLElement>(".spot");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    };
    if (fine) document.addEventListener("pointermove", onMove, { passive: true });

    root.classList.add("motion-ready");

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", onScroll);
      window.clearTimeout(failsafe);
      if (fine) document.removeEventListener("pointermove", onMove);
    };
  }, [pathname]);

  return null;
}
