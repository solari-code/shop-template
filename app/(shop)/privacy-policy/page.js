import PrivacyPolicy from "@/components/Privacy";
import PageBanner from "@/components/PageBanner";

export const metadata = {
  title: "Privacy Policy — Selva Studio",
  description: "Privacy policy of Selva Studio.",
  robots: { index: false, follow: false },
};


export default function PrivacyPolicyPage() {
  return (
    <>
      <PageBanner image="/images/hero_6.jpeg" height="300px" title="Privacy Policy" marginTop="72px" overlayOpacity={35} />
      <main className="bg-brand-base-200 pt-12 pb-12">
        <PrivacyPolicy />
      </main>
    </>
  );
}
