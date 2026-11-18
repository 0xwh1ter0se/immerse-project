import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { Fine } from '../ui/Fine';
import { Tag } from '../ui/Tag';
import { Hl } from './Hl';
import { PlayerMock } from './PlayerMock';

export function Hero() {
  return (
    <section className="py-18">
      <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div>
          <div className="mb-5.5">
            <Tag>★ Konsep visual · belum memproses video</Tag>
          </div>
          <h1 className="mb-4.5 text-[clamp(36px,4.8vw,58px)] leading-[1.04] font-display font-bold tracking-[-.01em] uppercase">
            Film, podcast, video kuliah — <Hl>semua</Hl> jadi kelas bahasa.
          </h1>
          <p className="mb-6.5 max-w-[46ch] text-[18px]">
            Tempel link atau unggah video. Immerse bikin subtitle ganda, membedah grammar di tabel transkrip, dan{' '}
            <strong className="border-ink-2 bg-lime px-1">Mersi</strong> — asisten AI — siap menjelaskan setiap kata.
          </p>

          <div className="flex max-w-[540px] gap-3 max-xs:flex-col" id="coba">
            <label className="sr-only" htmlFor="url">
              Contoh link video — belum diproses
            </label>
            <input
              id="url"
              type="url"
              inputMode="url"
              placeholder="https://youtube.com/watch?v=…"
              aria-describedby="demo-note"
              className="min-w-0 flex-1 rounded-md border-ink-3 bg-surface px-4 py-[13px] text-base font-medium shadow-brutal-lg transition-colors duration-[140ms] focus:bg-yellow focus:outline-none"
            />
            <Button href="#demo">Lihat contoh →</Button>
          </div>
          <Fine id="demo-note">Nama Immerse + Mersi sementara · cek trademark sebelum rilis.</Fine>

          <div className="mt-5 flex flex-wrap gap-2" aria-label="Sumber yang didukung">
            <Chip>YouTube</Chip>
            <Chip>Netflix*</Chip>
            <Chip>Podcast</Chip>
            <Chip>File lokal</Chip>
          </div>
        </div>

        <PlayerMock />
      </div>
    </section>
  );
}
