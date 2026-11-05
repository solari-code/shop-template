"use client"

import Hero from "@/components/Hero";
import HomeImageSlider from "@/components/HomepageSlider";
import AboutPreview from "@/components/About";
import ContactSection from "@/components/Contact";
import Footer from "@/components/Footer";
import useScrollFadeIn from "@/hooks/useFadeOnScroll";

export default function Home() {
  useScrollFadeIn();

  return (
    <>
      <main>
        <Hero />
        <HomeImageSlider />
        <AboutPreview />
        <ContactSection />
      </main>
    </>
  );
}