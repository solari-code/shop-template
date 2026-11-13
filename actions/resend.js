'use server'

import { sendContactMessage } from '@/lib/email'
import { textsConfig } from '@/config/texts.mjs'
import { shopText } from '@/lib/config/shop.mjs'
import { readContactForm } from '@/lib/email/contactForm.mjs'

// Contact form (components/Contact.jsx). In live mode the message is sent
// via Resend; in local mode it is printed to the console and saved in
// .local-data/emails/. The email templates are in lib/email.
export async function sendContactEmail(formData) {
    // Checked here too, the browser's check can be skipped
    const fields = readContactForm(formData)
    if (!fields) {
        return { message: shopText(textsConfig.contactForm.missingFields), error: true }
    }

    try {
        await sendContactMessage(fields)
        return { message: shopText(textsConfig.contactForm.sent) }
    } catch (error) {
        console.error("Error sending email:", error)
        return { message: shopText(textsConfig.contactForm.failed), error: true }
    }
}
