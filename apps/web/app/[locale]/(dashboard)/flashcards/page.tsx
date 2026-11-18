import { Suspense } from "react";
import { FlashcardsView } from "../../../components/study/FlashcardsView";

export default function FlashcardsPage() {
  return (
    <main>
      <Suspense
        fallback={
          <div className="py-12 text-center text-sm text-text-muted">Memuat kartu latihan…</div>
        }
      >
        <FlashcardsView />
      </Suspense>
    </main>
  );
}
