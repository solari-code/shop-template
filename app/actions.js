"use server";

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const notificationEmail = process.env.NOTIFICATION_EMAIL || "example@example.com";

export async function sendContactEmail(formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    if (!name || !email || !message) {
        return { message: "Please fill in all fields.", error: true };
    }

    try {
        await resend.emails.send({
            from: "Selva Studio <hello@example.com>",
            to: notificationEmail,
            reply_to: [email],
            subject: `New contact message`,
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
                <h2 style="color: #000;">New contact message</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <pre style="font-family: Arial; white-space: pre-wrap; background: #f4f4f4; padding: 10px; border-radius: 5px;">${message}</pre>
            </div>
        `,
        });

        return { message: "Message sent! I'll get back to you soon." };
    } catch (error) {
        console.error("Error sending email:", error);
        return { message: "Something went wrong. Please try again.", error: true };
    }
}