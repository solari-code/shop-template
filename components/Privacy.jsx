import { siteConfig } from "@/config/site.mjs";

export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <div className="bg-brand-base-100 p-6 md:p-10">
                <p className="font-sans font-light text-base md:text-lg text-brand-content-soft leading-relaxed mb-8">
                    At <strong className="text-brand-content font-medium">{siteConfig.name}</strong>, we value your privacy and are committed to protecting your personal data.
                </p>

                <section className="mb-8">
                    <h2 className="font-heading font-light text-lg md:text-xl text-brand-content mt-6 mb-3">
                        1. Information we collect
                    </h2>
                    <p className="font-sans font-light text-brand-content-soft leading-relaxed">
                        We collect personal data such as your name, email address and postal address when you place an order or contact us.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="font-heading font-light text-lg md:text-xl text-brand-content mt-6 mb-3">
                        2. How we use the information
                    </h2>
                    <p className="font-sans font-light text-brand-content-soft leading-relaxed">
                        We use your data to process orders, improve the shopping experience and, with your consent, send you exclusive offers.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="font-heading font-light text-lg md:text-xl text-brand-content mt-6 mb-3">
                        3. Data protection
                    </h2>
                    <p className="font-sans font-light text-brand-content-soft leading-relaxed">
                        We take security measures to protect your information and we do not sell your personal data to third parties.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading font-light text-lg md:text-xl text-brand-content mt-6 mb-3">
                        4. Contact
                    </h2>
                    <p className="font-sans font-light text-brand-content-soft leading-relaxed">
                        If you have questions about this policy, write to us at{" "}
                        <a
                            href={`mailto:${siteConfig.contact.email}`}
                            className="text-brand-content font-medium hover:underline"
                        >
                            {siteConfig.contact.email}
                        </a>
                    </p>
                </section>
            </div>
        </div>
    );
}