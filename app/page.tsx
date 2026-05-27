import Cursor from "@/app/components/ui/Cursor";
import Navbar from "@/app/components/ui/Navbar";
import LoadingScreen from "@/app/components/ui/LoadingScreen";
import LenisProvider from "@/app/components/ui/LenisProvider";
import HeroSequence from "@/app/components/sections/HeroSequence";
import AboutSection from "@/app/components/sections/AboutSection";
import PictureSection from "@/app/components/sections/PictureSection";
import GallerySection from "@/app/components/sections/GallerySection";
import Footer from "@/app/components/ui/Footer";

export default function Home() {
  return (
    <LenisProvider>
      <LoadingScreen />
      <Cursor />
      <Navbar />
      <main>
        <HeroSequence />
        <AboutSection />
        <PictureSection />
        <GallerySection />
      </main>
      <Footer />
    </LenisProvider>
  );
}
