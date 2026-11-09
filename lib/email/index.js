import 'server-only'
import { sendEmail } from './send'
import { FROM_ADDRESS, SHOP_EMAIL } from './config'
import { contactEmail, orderConfirmationEmail, orderNotificationEmail } from './templates'

// The shop's emails. Server-only on purpose: these must not be exported
// from a 'use server' file, or anyone could call them and send emails.
// All functions throw if the email could not be sent.

export async function sendContactMessage({ name, email, message }) {
    return sendEmail({
        from: FROM_ADDRESS,
        to: process.env.NOTIFICATION_EMAIL,
        replyTo: email,
        ...contactEmail({ name, email, message }),
    })
}

export async function sendOrderNotificationToOwner(order) {
    return sendEmail({
        from: FROM_ADDRESS,
        to: process.env.NOTIFICATION_EMAIL,
        ...orderNotificationEmail(order),
    })
}

export async function sendOrderConfirmationToCustomer(order) {
    if (!order.customerEmail) return null
    return sendEmail({
        from: FROM_ADDRESS,
        to: order.customerEmail,
        replyTo: SHOP_EMAIL,
        ...orderConfirmationEmail(order),
    })
}
