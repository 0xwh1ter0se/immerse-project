import { Button } from '../ui/Button';

export function Nav() {
  return (
    <header className="sticky top-0 z-10 border-b-3 border-b-ink bg-paper pt-[env(safe-area-inset-top)]">
      <div className="wrap flex h-[72px] items-center gap-6 max-sm:h-auto max-sm:min-h-[72px] max-sm:flex-wrap max-sm:py-2.5">
        <a className="flex items-center" href="/" aria-label="Immerse beranda">
          <img src="/assets/logo.svg" alt="" width={150} height={50} />
        </a>
        <nav
          aria-label="Utama"
          className="ml-auto flex gap-2.5 text-[14.5px] max-sm:order-3 max-sm:w-full max-sm:justify-between max-sm:gap-1 max-sm:pt-1"
        >
          <a
            href="#fitur"
            className="rounded-[10px] border-2 border-transparent px-3 py-1.5 font-bold transition-colors duration-[140ms] hover:border-ink hover:bg-cyan max-sm:min-h-[44px] max-sm:items-center max-sm:px-2 max-sm:text-[13px]"
          >
            Fitur
          </a>
          <a
            href="#cara"
            className="rounded-[10px] border-2 border-transparent px-3 py-1.5 font-bold transition-colors duration-[140ms] hover:border-ink hover:bg-cyan max-sm:min-h-[44px] max-sm:items-center max-sm:px-2 max-sm:text-[13px]"
          >
            Cara kerja
          </a>
          <a
            href="#mersi"
            className="rounded-[10px] border-2 border-transparent px-3 py-1.5 font-bold transition-colors duration-[140ms] hover:border-ink hover:bg-cyan max-sm:min-h-[44px] max-sm:items-center max-sm:px-2 max-sm:text-[13px]"
          >
            Mersi
          </a>
        </nav>
        <Button variant="ghost" href="#coba">
          Coba gratis
        </Button>
      </div>
    </header>
  );
}
