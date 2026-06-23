// Pemilihan repository konten aktif (seam sumber data).
//
// Untuk pindah ke MongoDB nanti: buat mongoRepository.ts yang implement
// ContentRepository, lalu ganti satu baris ini (impor + assignment di bawah).
// Tidak ada island atau fasad (dataAccess.ts) yang perlu diubah karena semua
// hanya bergantung pada kontrak `ContentRepository`.
//
// Contoh saat beralih ke MongoDB:
//   import { mongoRepository } from './mongoRepository';
//   export const repository: ContentRepository = mongoRepository;

import type { ContentRepository } from './repository';
import { jsonRepository } from './jsonRepository';

/** Repository konten aktif. Sumber tunggal kebenaran saat ini: seed.json. */
export const repository: ContentRepository = jsonRepository;

export type { ContentRepository } from './repository';
