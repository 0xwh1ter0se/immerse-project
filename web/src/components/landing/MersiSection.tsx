import { Hl } from './Hl';

export function MersiSection() {
  return (
    <section id="mersi" className="py-21">
      <div className="wrap grid grid-cols-1 gap-11 md:grid-cols-[220px_1fr] md:items-start">
        <img src="/assets/mascot.svg" alt="Maskot Mersi" width={220} height={165} className="-rotate-2" />
        <div>
          <h2 className="mb-9 text-[clamp(26px,3.2vw,40px)] font-display font-bold tracking-[-.01em] uppercase">
            Kenalkan, <Hl>Mersi</Hl>.
          </h2>
          <p className="max-w-[60ch] font-medium">
            Teman belajarmu yang tinggal di dalam video. Mersi menjelaskan grammar dengan konteks adegan, memberi contoh
            kalimat baru, dan mengoreksi latihanmu — dalam bahasa yang kamu pilih.
          </p>
          <div className="mt-5 rounded-lg border-ink-4 bg-surface px-5 py-4.5 shadow-brutal-lg">
            <p className="font-bold">
              <span className="mr-0.5 inline-block border-2 border-ink bg-cyan px-1 text-[12px] font-bold">Kamu ·</span>
              Mersi, kenapa pakai "would have" di sini?
            </p>
            <p className="mt-3">
              <span className="mr-0.5 inline-block border-2 border-ink bg-lime px-1 text-[12px] font-bold">Mersi ·</span>
              Itu pola <em>third conditional</em>: menyesali hal yang tidak terjadi. Bandingkan: "I would call you" =
              masih mungkin. "I would have called" = sudah lewat.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
