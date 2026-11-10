import Hero from "@/components/Hero";
import HomeImageSlider from "@/components/HomepageSlider";
import AboutSection from "@/components/About";
import ContactSection from "@/components/Contact";
import FadeInObserver from "@/components/FadeInObserver";
import { homepageSections } from "@/config/homepage.mjs";

// Section types in config/homepage.mjs and their components. Each component
// gets the section's settings as props.
const SECTIONS = {
  hero: Hero,
  slider: HomeImageSlider,
  about: AboutSection,
  contact: ContactSection,
};

export default function Home() {
  return (
    <>
      <main>
        {homepageSections.map(({ type, ...section }) => {
          const Section = SECTIONS[type];
          return <Section key={section.id} {...section} />;
        })}
      </main>
      <FadeInObserver />
    </>
  );
}
