import { WADAH } from '@/components/layout/wadah';
import { PetaPadukuhan } from '@/components/ui/PetaPadukuhan';
import { paths } from '@/routes/paths';
import ikonProfil from '@/assets/icons/Profil-padukuhan-icon.png';
import ikonStatistik from '@/assets/icons/Stastistik-Kependudukan-icon.png';
import ikonKabar from '@/assets/icons/kabar&agenda-icon.png';
import { BeritaTerkini } from './components/BeritaTerkini';
import { HeroBeranda } from './components/HeroBeranda';
import { JudulBagian } from './components/JudulBagian';
import { KartuJelajah } from './components/KartuJelajah';
import { RingkasanPenduduk } from './components/RingkasanPenduduk';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroBeranda />

      <section className={`${WADAH} py-16`}>
        <JudulBagian judul="JELAJAHI PADUKUHAN" className="uppercase" />
        <div className="grid gap-6 md:grid-cols-3">
          <KartuJelajah
            ke={paths.profil}
            judul="Profil Padukuhan"
            deskripsi="Struktur kelembagaan dan informasi wilayah."
            ikon={
              <img
                src={ikonProfil}
                alt=""
                width={144}
                height={144}
                loading="lazy"
                decoding="async"
                className="h-12 w-12 object-contain"
              />
            }
          />
          <KartuJelajah
            ke={paths.infografis}
            judul="Statistik Kependudukan"
            deskripsi="Visualisasi data demografi dan sebaran warga."
            ikon={
              <img
                src={ikonStatistik}
                alt=""
                width={144}
                height={144}
                loading="lazy"
                decoding="async"
                className="h-12 w-12 object-contain"
              />
            }
          />
          <KartuJelajah
            ke={paths.berita}
            judul="Kabar & Agenda Warga"
            deskripsi="Informasi kegiatan terkini dan agenda masyarakat."
            ikon={
              <img
                src={ikonKabar}
                alt=""
                width={144}
                height={144}
                loading="lazy"
                decoding="async"
                className="h-12 w-12 object-contain"
              />
            }
          />
        </div>
      </section>

      <RingkasanPenduduk />

      <section className={`${WADAH} py-16`}>
        <JudulBagian judul="PETA PADUKUHAN" className="uppercase" />
        <PetaPadukuhan className="w-full aspect-[1600/514] min-h-[14rem]" />
      </section>

      <BeritaTerkini />
    </div>
  );
}
