"use client";

import { useState } from "react";
import { sendContactEmail } from "@/actions/resend";
import { siteConfig } from "@/config/site.mjs";
import { shopText } from "@/lib/config/shop.mjs";
import MultilineText from "./MultilineText";

// WhatsApp message for the link: strict URL encoding (also ' ( ) ! *)
const encodeMessage = (text) =>
  encodeURIComponent(text).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

// Homepage section "contact" (config/homepage.mjs): contact form, and a
// WhatsApp button if siteConfig.contact.whatsapp is set.
const ContactSection = ({
  id,
  eyebrow,
  heading,
  text,
  messagePlaceholder = "Your message...",
  whatsappLabel = "Contact via WhatsApp",
  whatsappMessage,
}) => {
  // Optional: without a number, the WhatsApp button is hidden
  const whatsapp = siteConfig.contact.whatsapp;

  const [status, setStatus] = useState({ loading: false, message: null, isError: false });

  const handleFormSubmit = async (e) => {

    e.preventDefault();

    setStatus({ loading: true, message: null, isError: false });

    const formData = new FormData(e.target);

    // Honeypot: a hidden field that only bots fill in
    if (formData.get('website')) {
      console.log('Honeypot field filled, blocking spam submission.');
      return;
    }

    try {
      const result = await sendContactEmail(formData);

      setStatus({ loading: false, message: result.message, isError: !!result.error });
      if (!result.error) e.target.reset();

      setTimeout(() => {
        setStatus((s) => ({ ...s, message: null }));
      }, 5000);

    } catch (error) {
      console.error("Contact form submission failed:", error);
      setStatus({
        loading: false,
        message: "An error occurred. Please try again later.",
        isError: true,
      });
    }
  };

  return (
    <section
      id={id}
      className="bg-brand-base-100 py-20 md:py-28 px-6"
      aria-labelledby="contact-heading"
    >
      <div className="max-w-2xl mx-auto">
        {eyebrow && (
          <p className="fade-in text-center text-[0.8rem] tracking-[0.28em] uppercase text-brand-content-muted font-light mb-3">
            {shopText(eyebrow)}
          </p>
        )}
        <div className="fade-in">
          <h2
            id="contact-heading"
            className="font-heading font-light text-2xl md:text-3xl text-brand-content mb-4 text-center"
          >
            {shopText(heading)}
          </h2>
          {text && (
            <p className="font-sans font-light text-sm md:text-base text-brand-content-muted mb-10 max-w-lg mx-auto text-center leading-relaxed">
              <MultilineText text={shopText(text)} />
            </p>
          )}
        </div>

        <form
          className="text-left space-y-5" onSubmit={handleFormSubmit}>

          <div style={{ overflow: 'hidden', position: 'absolute', width: '0', height: '0' }}>
            <label htmlFor="website">Website</label>
            <input type="text" id="website" name="website" tabIndex="-1" autoComplete="off" />
          </div>

          <div>
            <label
              htmlFor="contact-name"
              className="block text-xs tracking-wider uppercase text-brand-content-muted mb-2 font-light"
            >
              Name
            </label>
            <input
              id="contact-name"
              required
              type="text"
              name="name"
              placeholder="Your name"
              className="w-full px-4 py-3 border border-brand-base-300 bg-brand-base-200 text-brand-content placeholder-brand-content-subtle focus:outline-none transition-colors font-light text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="contact-email"
              className="block text-xs tracking-wider uppercase text-brand-content-muted mb-2 font-light"
            >
              Email
            </label>
            <input
              id="contact-email"
              required
              type="email"
              name="email"
              placeholder="you@email.com"
              className="w-full px-4 py-3 border border-brand-base-300 bg-brand-base-200 text-brand-content placeholder-brand-content-subtle focus:outline-none transition-colors font-light text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="contact-message"
              className="block text-xs tracking-wider uppercase text-brand-content-muted mb-2 font-light"
            >
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              placeholder={shopText(messagePlaceholder)}
              rows={4}
              className="w-full px-4 py-3 border border-brand-base-300 bg-brand-base-200 text-brand-content placeholder-brand-content-subtle focus:outline-none transition-colors font-light text-sm resize-y min-h-[120px]"
            />
          </div>

          <button
            disabled={status.loading}
            type="submit"
            className="w-full px-6 py-3 bg-brand-content text-brand-content-inverse font-sans text-sm tracking-widest uppercase hover:bg-brand-primary transition-colors"
          >
            {status.loading ? 'Sending...' : 'Send message'}
          </button>
        </form>

        {status.message && (
          <div
            role="status"
            aria-live="polite"
            className={`mt-6 p-4 md:p-5 rounded-md border font-sans text-sm md:text-base leading-relaxed flex items-center justify-center gap-3 text-center ${status.isError
              ? "bg-red-50 border-red-200 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
              : "bg-green-50 border-green-200 text-green-800 dark:border-green-900 dark:bg-green-950/50 dark:text-green-200"
              }`}
          >
            {status.isError ? (
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span>{status.message}</span>
          </div>
        )}

        {whatsapp && (
          <>
            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-brand-base-300" />
              <span className="text-[0.8rem] tracking-[0.2em] uppercase text-brand-content-subtle font-light">or</span>
              <div className="flex-1 h-px bg-brand-base-300" />
            </div>

            <a
              href={`https://wa.me/${whatsapp}${whatsappMessage ? `?text=${encodeMessage(shopText(whatsappMessage))}` : ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full px-6 flex gap-3 justify-center py-3 bg-brand-primary text-brand-content-inverse font-sans  text-sm tracking-widest uppercase hover:bg-brand-content transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4 shrink-0" />
              {shopText(whatsappLabel)}
            </a>
          </>
        )}
      </div>
    </section >
  );
};

function WhatsAppIcon({ className }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default ContactSection;