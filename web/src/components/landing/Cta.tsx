import { Button } from '../ui/Button';
import { Fine } from '../ui/Fine';

export function Cta() {
  return (
    <section className="border-t-4 border-t-ink bg-lime py-22">
      <div className="wrap text-center">
        <h2 className="text-[clamp(26px,3.2vw,40px)] font-display font-bold tracking-[-.01em] uppercase">
          Video favoritmu adalah kelas bahasa terbaikmu.
        </h2>
        <Button size="lg" href="#coba" className="mt-2.5 bg-pink hover:bg-surface">
          Mulai gratis →
        </Button>
        <Fine className="mt-4 font-medium text-ink/70">Tanpa kartu kredit. 3 video pertama gratis.</Fine>
      </div>
    </section>
  );
}
