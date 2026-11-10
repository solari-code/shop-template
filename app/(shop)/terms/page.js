import PageBanner from "@/components/PageBanner";
import TermsOfService from "@/components/Terms";
import { pageMetadata, pageBanner } from "@/lib/config/shop.mjs";

export const metadata = {
  ...pageMetadata("terms"),
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-brand-base-200">
      <PageBanner
        {...pageBanner("terms")}
        height="300px"
        marginTop="72px"
      />
      <div className="py-16 md:py-24">
        <TermsOfService />
      </div>
    </main>
  );
}
