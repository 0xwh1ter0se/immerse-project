/**
 * Mock pemutar — statis, aria-label menjelaskan perannya sebagai contoh
 * antarmuka. Subtitle dan tabel adalah konten demo; jangan diubah
 * tanpa perintah.
 */
export function PlayerMock() {
  return (
    <div
      id="demo"
      aria-label="Contoh antarmuka pemutar Immerse"
      className="grid grid-cols-1 rotate-[0.6deg] overflow-hidden rounded-xl border-ink-4 bg-surface shadow-brutal-xl"
    >
      <div className="bg-dots-sm relative flex min-h-[320px] items-center justify-center border-b-4 border-b-ink bg-yellow">
        <img className="w-52.5" src="/assets/mascot.svg" alt="" />
        <div className="absolute left-[8%] right-[8%] mx-auto max-w-[84%] rounded-[10px] bg-surface px-3.5 py-[7px] text-center text-[15.5px] font-bold shadow-brutal-sm bottom-16 border-ink-3">
          I <span className="inline-block rounded-[6px] border-2 border-ink bg-cyan px-1">would have called</span> you
          earlier
        </div>
        <div className="absolute left-[8%] right-[8%] mx-auto max-w-[84%] rounded-[10px] bg-lime px-3.5 py-[7px] text-center text-[15.5px] font-bold shadow-brutal-sm bottom-4 border-ink-3">
          Aku <span className="inline-block rounded-[6px] border-2 border-ink bg-cyan px-1">seharusnya menelepon</span>mu
          lebih awal
        </div>
      </div>
      <aside className="flex flex-col gap-3 bg-surface p-4.5 text-[13.5px]">
        <div className="font-display text-[12px] tracking-[.08em] uppercase">⚡ Transkrip · grammar</div>
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="border-b-2.5 border-dashed border-ink/35 px-1.5 py-2 align-top">
                <strong className="border-[1.5px] border-ink bg-pink px-1">would have</strong>
              </td>
              <td className="border-b-2.5 border-dashed border-ink/35 px-1.5 py-2 align-top">modal perfect — penyesalan</td>
            </tr>
            <tr>
              <td className="border-b-2.5 border-dashed border-ink/35 px-1.5 py-2 align-top">
                <strong className="border-[1.5px] border-ink bg-pink px-1">called</strong>
              </td>
              <td className="border-b-2.5 border-dashed border-ink/35 px-1.5 py-2 align-top">V3 (past participle)</td>
            </tr>
            <tr>
              <td className="border-b-2.5 border-dashed border-ink/35 px-1.5 py-2 align-top">
                <strong className="border-[1.5px] border-ink bg-pink px-1">earlier</strong>
              </td>
              <td className="border-b-2.5 border-dashed border-ink/35 px-1.5 py-2 align-top">komparatif waktu</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-auto rounded-md border-ink-3 bg-cyan px-3 py-2.5 text-[13px] font-bold shadow-brutal-md">
          💬 Tanya <strong className="border-[1.5px] border-ink bg-lime px-1">Mersi</strong>: kenapa bukan "would call"?
        </div>
      </aside>
    </div>
  );
}
