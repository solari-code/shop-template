import PrivacyPolicy from "@/components/Privacy";
import PageBanner from "@/components/PageBanner";
import { pageMetadata, pageBanner } from "@/lib/config/shop.mjs";

export const metadata = {
  ...pageMetadata("privacy"),
  robots: { index: false, follow: false },
};


export default function PrivacyPolicyPage() {
  return (
    <>
      <PageBanner {...pageBanner("privacy")} height="300px" marginTop="72px" />
      <main className="bg-brand-base-200 pt-12 pb-12">
        <PrivacyPolicy />
      </main>
    </>
  );
}
