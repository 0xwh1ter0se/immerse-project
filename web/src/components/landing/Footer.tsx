import { Fine } from '../ui/Fine';

export function Footer() {
  return (
    <footer className="border-t-4 border-t-ink bg-paper pt-7 pb-[calc(28px+env(safe-area-inset-bottom,0px))] text-[13.5px] font-medium">
      <div className="wrap flex flex-wrap items-center gap-4.5">
        <img src="/assets/logo.svg" alt="Immerse" width={110} height={37} />
        <p>© 2026 Immerse · immerse.app</p>
        <Fine className="ml-auto mt-0">Mockup konsep · nama sementara · cek trademark sebelum produksi.</Fine>
      </div>
    </footer>
  );
}
