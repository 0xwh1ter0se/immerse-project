import { Cta } from '../components/landing/Cta';
import { Features } from '../components/landing/Features';
import { Footer } from '../components/landing/Footer';
import { Hero } from '../components/landing/Hero';
import { MersiSection } from '../components/landing/MersiSection';
import { Nav } from '../components/landing/Nav';
import { Steps } from '../components/landing/Steps';

export function Landing() {
  return (
    <>
      <a className="skip" href="#main">
        Lompat ke konten
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Features />
        <Steps />
        <MersiSection />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
