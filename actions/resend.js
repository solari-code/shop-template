'use server'

import { sendContactMessage } from '@/lib/email'

// Contact form (components/Contact.jsx). In live mode the message is sent
// via Resend; in local mode it is printed to the console and saved in
// .local-data/emails/. The email templates are in lib/email.
export async function sendContactEmail(formData) {
    const name = formData.get('name')
    const email = formData.get('email')
    const message = formData.get('message')

    if (!name || !email || !message) {
        return { message: "Please fill in all fields.", error: true }
    }

    try {
        await sendContactMessage({ name, email, message })
        return { message: "Message sent! I'll get back to you soon." }
    } catch (error) {
        console.error("Error sending email:", error)
        return { message: "Something went wrong. Please try again.", error: true }
    }
}
