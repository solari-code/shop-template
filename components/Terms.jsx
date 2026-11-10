import { siteConfig } from "@/config/site.mjs";

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 md:px-6 max-w-3xl">
      <div className="bg-brand-base-100 p-6 md:p-10">
        <p className="font-sans font-light text-base md:text-lg text-brand-content-soft leading-relaxed mb-8">
          By using <strong className="text-brand-content font-medium">{siteConfig.name}</strong>, you agree to our terms and conditions.
        </p>

        <section className="mb-8">
          <h2 className="font-heading font-light text-lg md:text-xl text-brand-content mt-6 mb-3">
            1. Use of the site
          </h2>
          <p className="font-sans font-light text-brand-content-soft leading-relaxed">
            Using the site for illegal or unauthorized purposes is prohibited. We reserve the right to refuse service at any time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-heading font-light text-lg md:text-xl text-brand-content mt-6 mb-3">
            2. Orders and payments
          </h2>
          <p className="font-sans font-light text-brand-content-soft leading-relaxed">
            All orders are subject to availability. We reserve the right to refuse any purchase or cancel an order if we believe it violates our policies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-heading font-light text-lg md:text-xl text-brand-content mt-6 mb-3">
            3. Changes to these terms
          </h2>
          <p className="font-sans font-light text-brand-content-soft leading-relaxed">
            We reserve the right to change these terms at any time. Changes take effect as soon as they are published on our website.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-light text-lg md:text-xl text-brand-content mt-6 mb-3">
            4. Contact
          </h2>
          <p className="font-sans font-light text-brand-content-soft leading-relaxed">
            If you have questions, write to us at{" "}
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