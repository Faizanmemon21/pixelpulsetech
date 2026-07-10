import { lazy, Suspense, useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import IntroOverlay from "@/components/IntroOverlay";
import Hero3D from "@/components/Hero3D";
import BuildVideo from "@/components/BuildVideo";
import SiteFooter from "@/components/SiteFooter";
// The hero shell ships in the main bundle so its headline (the LCP element)
// paints immediately — only the canvas inside it is a lazy chunk
import GlbShowcase from "@/components/GlbShowcase";

// Heavy sections load as separate chunks
const SpecJourney = lazy(() => import("@/components/SpecJourney"));
const BuildsPage = lazy(() => import("@/components/BuildsPage"));

export default function App() {
  // Tiny hash router: "#/builds" opens the rigs & components page
  const [route, setRoute] = useState(() => window.location.hash);

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (route.startsWith("#/builds")) {
    return (
      <Suspense fallback={null}>
        <BuildsPage />
      </Suspense>
    );
  }

  return (
    <div id="top" className="bg-black text-white">
      <IntroOverlay />
      <Navbar />
      <main>
        {/* HERO — the GLB battlestation, front and center */}
        <GlbShowcase />
        <BuildVideo />
        <Suspense fallback={null}>
          <SpecJourney />
        </Suspense>
        {/* the 3D rig section now closes the page */}
        <Hero3D />
      </main>
      <SiteFooter />
    </div>
  );
}
