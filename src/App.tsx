import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import Hero from "./sections/Hero";
import Demo from "./sections/Demo";
import Features from "./sections/Features";
import HowItWorks from "./sections/HowItWorks";
import Download from "./sections/Download";

export default function App() {
  // Link diretto a una sezione (es. /desklock/#avviso-windows): il browser salta all'ancora prima che React
  // abbia disegnato la pagina, quindi ci si arriva dopo il primo render (e di nuovo quando i font sono pronti).
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const go = () => document.getElementById(id)?.scrollIntoView({ block: "start" });
    const raf = requestAnimationFrame(go);
    void document.fonts?.ready.then(go);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    // reducedMotion="user": every motion/react animation respects prefers-reduced-motion
    <MotionConfig reducedMotion="user">
      <AnimatedBackground />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 glass rounded-md px-3 py-2">
        Vai al contenuto
      </a>
      <Header />
      <main id="main" className="relative z-[1]">
        <Hero />
        <Demo />
        <Features />
        <HowItWorks />
        <Download />
      </main>
      <Footer />
    </MotionConfig>
  );
}
