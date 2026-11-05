"use client";

import { useState } from "react";
import { sendContactEmail } from "@/actions/resend";

const ContactSection = () => {

  const [status, setStatus] = useState({ loading: false, message: null, isError: false });

  const handleFormSubmit = async (e) => {

    e.preventDefault();

    setStatus({ loading: true, message: null, isError: false });

    const formData = new FormData(e.target);

    // Honeypot checks

    // if ((Date.now() - timestampOpened) < 4000) {
    //     console.log('Honeypot - Less than 4s, blocking spam submission.');
    //     onClose();
    //     return;
    // }

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
      id="contact"
      className="bg-brand-base-100 py-20 md:py-28 px-6"
      aria-labelledby="contact-heading"
    >
      <div className="max-w-2xl mx-auto">
        <p className="fade-in text-center text-[0.8rem] tracking-[0.28em] uppercase text-gray-500 font-light mb-3">
          Contact
        </p>
        <div className="fade-in">
          <h2
            id="contact-heading"
            className="font-sans font-light text-2xl md:text-3xl text-brand-content mb-4 text-center"
          >
            Need a special size or a costume?
          </h2>
          <p className="font-sans font-light text-sm md:text-base text-gray-500 mb-10 max-w-lg mx-auto text-center leading-relaxed">
            Get in touch to ask about custom sizes or to request a special piece
            made just for you.
          </p>
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
              className="block text-xs tracking-wider uppercase text-gray-500 mb-2 font-light"
            >
              Name
            </label>
            <input
              id="contact-name"
              required
              type="text"
              name="name"
              placeholder="Your name"
              className="w-full px-4 py-3 border border-brand-base-300 bg-brand-base-200 text-brand-content placeholder-gray-400 focus:outline-none focus:border-brand-content/40 transition-colors font-light text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="contact-email"
              className="block text-xs tracking-wider uppercase text-gray-500 mb-2 font-light"
            >
              Email
            </label>
            <input
              id="contact-email"
              required
              type="email"
              name="email"
              placeholder="you@email.com"
              className="w-full px-4 py-3 border border-brand-base-300 bg-brand-base-200 text-brand-content placeholder-gray-400 focus:outline-none focus:border-brand-content/40 transition-colors font-light text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="contact-message"
              className="block text-xs tracking-wider uppercase text-gray-500 mb-2 font-light"
            >
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              placeholder="Tell me what you need..."
              rows={4}
              className="w-full px-4 py-3 border border-brand-base-300 bg-brand-base-200 text-brand-content placeholder-gray-400 focus:outline-none focus:border-brand-content/40 transition-colors font-light text-sm resize-y min-h-[120px]"
            />
          </div>

          <button
            disabled={status.loading}
            type="submit"
            className="w-full px-6 py-3 bg-brand-content text-white font-sans text-sm tracking-widest uppercase hover:bg-brand-purple transition-colors"
          >
            {status.loading ? 'Sending...' : 'Send message'}
          </button>
        </form>

        {status.message && (
          <div
            role="status"
            aria-live="polite"
            className={`mt-6 p-4 md:p-5 rounded-md border font-sans text-sm md:text-base leading-relaxed flex items-center justify-center gap-3 text-center ${status.isError
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-green-50 border-green-200 text-green-800"
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

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-brand-base-300" />
          <span className="text-[0.8rem] tracking-[0.2em] uppercase text-gray-400 font-light">or</span>
          <div className="flex-1 h-px bg-brand-base-300" />
        </div>

        <a
          href="https://wa.me/10000000000?text=Hi%2C%20I%27m%20interested%20in%20a%20special%20size%20or%20a%20one-of-a-kind%20piece."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full px-6 flex gap-3 justify-center py-3 bg-brand-purple text-white font-sans  text-sm tracking-widest uppercase hover:bg-brand-content transition-colors"
        >
          <WhatsAppIcon className="w-4 h-4 shrink-0" />
          Contact via WhatsApp
        </a>
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