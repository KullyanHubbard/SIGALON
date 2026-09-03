/**
 * Self-check logika murni berita. Jalankan dari `frontend/`:
 *
 *   node --experimental-strip-types src/features/berita/utils.check.ts
 *
 * Tanpa test runner — proyek ini tidak punya satu pun (CLAUDE.md §9), dan
 * memasangnya cuma untuk berkas ini bukan pertukaran yang sepadan.
 */
import assert from 'node:assert/strict';
import { formatTanggal, keRingkasan } from './utils.ts';

// keRingkasan: tag jadi spasi, entitas dipulihkan, spasi berlebih dirapikan.
assert.equal(keRingkasan('<p>Satu.</p><p>Dua.</p>'), 'Satu. Dua.');
assert.equal(
  keRingkasan('<p>Kerja bakti <strong>RW 01</strong></p>'),
  'Kerja bakti RW 01',
);
assert.equal(
  keRingkasan('<p>Ronda &amp; kerja bakti</p>'),
  'Ronda & kerja bakti',
);
assert.equal(keRingkasan('   <p>  Rapi.  </p>  '), 'Rapi.');
// Foto sisipan tidak menyumbang satu huruf pun ke kutipan pembuka.
assert.equal(
  keRingkasan('<p><img src="data:image/png;base64,AAAA" alt="x"></p>'),
  '',
);
assert.equal(keRingkasan(''), '');

// formatTanggal: ISO sah diterjemahkan, yang tidak sah dikembalikan apa adanya.
assert.equal(formatTanggal('2026-08-31'), '31 Agustus 2026');
assert.equal(formatTanggal('bukan-tanggal'), 'bukan-tanggal');

console.log('berita/utils: OK');
