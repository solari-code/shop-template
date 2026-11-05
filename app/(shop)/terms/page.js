import PageBanner from "@/components/PageBanner";
import TermsOfService from "@/components/Terms";

export const metadata = {
  title: "Terms of Service — Selva Studio",
  description: "Terms of service of Selva Studio.",
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-brand-base-200">
      <PageBanner
        image="/images/hero_6.jpeg"
        height="300px"
        title="Terms of Service"
        marginTop="72px"
        overlayOpacity={35}
      />
      <div className="py-16 md:py-24">
        <TermsOfService />
      </div>
    </main>
  );
}
