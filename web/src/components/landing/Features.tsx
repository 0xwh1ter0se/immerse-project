import { Card, type CardTone } from '../ui/Card';

const cards: Array<{ tone: CardTone; num: string; title: string; body: string }> = [
  {
    tone: 'yellow',
    num: '01',
    title: 'Subtitle ganda',
    body: 'Baris atas bahasa target, baris bawah bahasa ibu. Sinkron audio, klik per kata.',
  },
  {
    tone: 'pink',
    num: '02',
    title: 'Tabel transkrip',
    body: 'Setiap kalimat dibedah: pola grammar, bentuk kata, level CEFR. Bukan sekadar terjemahan.',
  },
  {
    tone: 'cyan',
    num: '03',
    title: 'Kontenmu sendiri',
    body: 'Film, podcast, kuliah, vlog. Tempel link atau unggah file — kamu pilih bahan belajarmu.',
  },
  {
    tone: 'lime',
    num: '04',
    title: 'Mersi, asisten AI',
    body: 'Tanya kenapa kalimat begini, minta contoh lain, latihan ulang — tanpa pindah tab.',
  },
];

export function Features() {
  return (
    <section id="fitur" className="py-21">
      <div className="wrap">
        <h2 className="mb-9 text-[clamp(26px,3.2vw,40px)] font-display font-bold tracking-[-.01em] uppercase">
          Empat alat, satu layar.
        </h2>
        <div className="grid grid-cols-1 gap-5.5 xs:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <Card key={c.num} tone={c.tone}>
              <div className="mb-3.5 inline-block rounded-sm border-ink-2 bg-surface px-2 py-0.5 font-display text-[14px] shadow-brutal-sm">
                {c.num}
              </div>
              <h3 className="mb-2 font-display text-[17px] font-bold uppercase">{c.title}</h3>
              <p className="text-[14.5px] font-medium">{c.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
