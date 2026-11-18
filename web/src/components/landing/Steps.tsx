import { Step } from '../ui/Step';

const steps = [
  { n: 1, tone: 'yellow' as const, title: 'Tempel link', body: 'YouTube, podcast, atau file video dari perangkatmu.' },
  { n: 2, tone: 'pink' as const, title: 'Pilih bahasa', body: 'Bahasa target di atas, bahasa ibumu di bawah.' },
  { n: 3, tone: 'cyan' as const, title: 'Belajar sambil nonton', body: 'Klik kata, baca grammar, tanya Mersi, simpan flashcard.' },
];

export function Steps() {
  return (
    <section id="cara" className="border-y-4 border-y-ink bg-pink py-21">
      <div className="wrap">
        <h2 className="mb-9 text-[clamp(26px,3.2vw,40px)] font-display font-bold tracking-[-.01em] uppercase">Tiga langkah.</h2>
        <ol className="grid grid-cols-1 gap-5.5 md:grid-cols-3">
          {steps.map((s) => (
            <Step key={s.n} n={s.n} tone={s.tone} title={s.title}>
              {s.body}
            </Step>
          ))}
        </ol>
      </div>
    </section>
  );
}
