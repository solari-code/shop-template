'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const bg = '#ffffff'
const text = '#111111'
const textMuted = '#888888'
const textLight = '#bbbbbb'
const border = '#e8e8e8'
const borderLight = '#f0f0f0'


const emailWrapper = (content) => `
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 16px;">
                <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%; background: ${bg};">
                    
                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding: 40px 40px 32px 40px; border-bottom: 1px solid ${border};">
                            <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 20px; letter-spacing: 0.35em; font-weight: 300; margin: 0; text-transform: uppercase; color: ${text};">SELVA STUDIO</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            ${content}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding: 24px 40px 32px 40px; border-top: 1px solid ${border};">
                            <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 300; color: ${textMuted}; letter-spacing: 0.08em; margin: 0 0 4px 0;">With love — Mara</p>
                            <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 300; color: ${textLight}; letter-spacing: 0.08em; margin: 0;">Selva Studio — Slow Fashion 🖤</p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
`

const sectionLabel = (label) => `
    <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; font-weight: 400; color: ${textMuted}; text-transform: uppercase; letter-spacing: 0.15em; margin: 0 0 10px 0;">${label}</p>
`

const divider = `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
        <tr><td style="border-top: 1px solid ${border};"></td></tr>
    </table>
`

const productRows = (items) => `
    <table width="100%" cellpadding="0" cellspacing="0">
        <!-- Header -->
        <tr>
            <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; font-weight: 400; color: ${textMuted}; text-transform: uppercase; letter-spacing: 0.12em; padding-bottom: 10px; border-bottom: 1px solid ${border};">
                Product
            </td>
            <td align="center" style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; font-weight: 400; color: ${textMuted}; text-transform: uppercase; letter-spacing: 0.12em; padding-bottom: 10px; border-bottom: 1px solid ${border}; white-space: nowrap; padding-left: 12px;">
                Qty
            </td>
            <td align="right" style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; font-weight: 400; color: ${textMuted}; text-transform: uppercase; letter-spacing: 0.12em; padding-bottom: 10px; border-bottom: 1px solid ${border}; white-space: nowrap; padding-left: 12px;">
                Total
            </td>
        </tr>

        <!-- Items -->
        ${items.map(i => `
            <tr>
                <td style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 14px 0; border-bottom: 1px solid ${borderLight};">
                    <p style="font-size: 13px; font-weight: 300; color: ${text}; margin: 0 0 3px 0;">${i.title}</p>
                    <p style="font-size: 11px; font-weight: 300; color: ${textMuted}; margin: 0; text-transform: uppercase; letter-spacing: 0.08em;">Size ${i.size}</p>
                </td>
                <td align="center" style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; font-weight: 300; color: ${text}; padding: 14px 0 14px 12px; border-bottom: 1px solid ${borderLight}; white-space: nowrap; vertical-align: top;">
                    ${i.quantity}
                </td>
                <td align="right" style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; font-weight: 300; color: ${text}; padding: 14px 0 14px 12px; border-bottom: 1px solid ${borderLight}; white-space: nowrap; vertical-align: top;">
                    $${((Number(i.price) || 0) * (Number(i.quantity) || 0)).toFixed(0)}
                </td>
            </tr>
        `).join('')}
    </table>
`

const totalRows = (total, shippingDisplayName, shippingCost) => `
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; font-weight: 300; color: ${text}; padding: 14px 0; border-bottom: 1px solid ${borderLight};">
                Shipping: ${shippingDisplayName}
            </td>
            <td style="border-bottom: 1px solid ${borderLight}; padding: 14px 0 14px 12px;"></td>
            <td align="right" style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; font-weight: 300; color: ${text}; padding: 14px 0 14px 12px; border-bottom: 1px solid ${borderLight}; white-space: nowrap;">
                $${shippingCost}
            </td>
        </tr>
        <tr>
            <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 400; color: ${text}; text-transform: uppercase; letter-spacing: 0.12em; padding: 14px 0 0 0;">
                Total
            </td>
            <td style="padding: 14px 0 0 12px;"></td>
            <td align="right" style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 16px; font-weight: 300; color: ${text}; padding: 14px 0 0 12px; white-space: nowrap;">
                $${total}
            </td>
        </tr>
    </table>
`

// ─── Contact Email ─────────────────────────────────────────
export async function sendContactEmail(formData) {
    const name = formData.get('name')
    const email = formData.get('email')
    const message = formData.get('message')

    if (!name || !email || !message) {
        return { message: "Please fill in all fields.", error: true }
    }

    try {
        await resend.emails.send({
            from: 'Selva Studio <hello@example.com>',
            to: process.env.NOTIFICATION_EMAIL,
            reply_to: [email],
            subject: `New message — ${name}`,
            html: emailWrapper(`
                <h1 style="font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 300; font-size: 18px; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 32px 0; color: ${text};">
                    New contact message
                </h1>

                ${sectionLabel('From')}
                <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: 300; color: ${text}; margin: 0 0 4px 0;">${name}</p>
                <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: 300; color: ${textMuted}; margin: 0 0 28px 0;">
                    <a href="mailto:${email}" style="color: ${textMuted}; text-decoration: none;">${email}</a>
                </p>

                ${divider}

                ${sectionLabel('Message')}
                <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: 300; color: ${text}; line-height: 1.8; margin: 0; white-space: pre-wrap;">${message}</p>
            `)
        })

        return { message: "Message sent! I'll get back to you soon." }
    } catch (error) {
        console.error("Error sending email:", error)
        return { message: "Something went wrong. Please try again.", error: true }
    }
}


// ─── Order Notification to the shop owner ─────────────────
export async function sendOrderNotificationToOwner({ customerName, customerEmail, items, total, paymentIntent, shippingName, shippingAddress, shippingDisplayName, shippingCost, orderNumber }) {
    await resend.emails.send({
        from: 'Selva Studio <hello@example.com>',
        to: process.env.NOTIFICATION_EMAIL,
        subject: `🛍️ New order — ${customerName}`,
        html: emailWrapper(`
            <h1 style="font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 300; font-size: 18px; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 5px 0; color: ${text};">
                New order received
            </h1>
            <h3 style="font-family:'Helvetica Neue',Arial,sans-serif;font-weight:300;font-size:15px;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 32px 0;color: ${text}">${orderNumber}</h3>

            ${sectionLabel('Customer')}
            <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: 300; color: ${text}; margin: 0 0 4px 0;">${customerName}</p>
            <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: 300; color: ${textMuted}; margin: 0;">
                <a href="mailto:${customerEmail}" style="color: ${textMuted}; text-decoration: none;">${customerEmail}</a>
            </p>

            ${divider}

            ${sectionLabel('Shipping address')}
            <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: 300; color: ${text}; margin: 0 0 4px 0;">Ship to: ${shippingName}</p>
            <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: 300; color: ${text}; line-height: 1.8; margin: 0;">
                ${shippingAddress?.line1}${shippingAddress?.line2 ? `, ${shippingAddress.line2}` : ''}<br/>
                ${shippingAddress?.city}, ${shippingAddress?.state} ${shippingAddress?.postal_code}<br/>
                ${shippingAddress?.country}
            </p>

            ${divider}

            ${productRows(items)}
            ${totalRows(total, shippingDisplayName, shippingCost)}

            ${divider}

            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td align="center">
                        <a href="https://dashboard.stripe.com/payments/${paymentIntent}"
                           style="font-family: 'Helvetica Neue', Arial, sans-serif; display: inline-block; font-size: 11px; font-weight: 300; letter-spacing: 0.15em; text-transform: uppercase; color: ${text}; border: 1px solid ${text}; padding: 12px 32px; text-decoration: none;">
                            View in Stripe
                        </a>
                    </td>
                </tr>
            </table>
        `)
    })
}


// ─── Order Confirmation to Customer ───────────────────────
export async function sendOrderConfirmationToCustomer({ customerName, customerEmail, items, total, shippingAddress, shippingDisplayName, shippingCost, orderNumber }) {
    if (!customerEmail) return
    await resend.emails.send({
        from: 'Selva Studio <hello@example.com>',
        to: customerEmail,
        reply_to: ['hello@example.com'],
        subject: 'Thank you for your order at Selva Studio! 🖤',
        html: emailWrapper(`
            <h1 style="font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 300; font-size: 18px; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 8px 0; color: ${text};">
                Thank you for your order!
            </h1>
            <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: 300; color: ${text}; margin: 0 0 32px 0;">
                Hi ${customerName}, I've received your order.
            </p>

            ${divider}

            <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 16px; font-weight: 300; color: ${text}; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 20px 0;">Your order: ${orderNumber}</p>

            ${productRows(items)}
            ${totalRows(total, shippingDisplayName, shippingCost)}

            ${divider}

            ${sectionLabel('Shipping address')}
            <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: 300; color: ${text}; line-height: 1.8; margin: 0 0 28px 0;">
                ${shippingAddress?.line1}${shippingAddress?.line2 ? `, ${shippingAddress.line2}` : ''}<br/>
                ${shippingAddress?.city}, ${shippingAddress?.state} ${shippingAddress?.postal_code}
            </p>

            ${divider}

            <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: 300; line-height: 1.8; color: ${text}; margin: 0;">
                I'm preparing it with lots of care and will write to you soon with the shipping details.
                If you have any questions, reply to this email or write to me at
                <a href="mailto:hello@example.com" style="color: ${textMuted};">hello@example.com</a>
            </p>
        `)
    })
}