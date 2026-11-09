import 'server-only'
import fs from 'node:fs/promises'
import path from 'node:path'
import { Resend } from 'resend'
import { isConfigured } from '@/lib/env'
import { isLocalMode } from '@/lib/shopMode'
import { LOCAL_DATA_DIR } from '@/lib/local/store'
import { escapeHtml } from './templates'

// Sends an email: { from, to, replyTo, subject, html, text }.
// - live mode: via Resend. Throws if the email could not be sent.
// - local mode: printed to the console and saved as an HTML file in
//   .local-data/emails/ (open it in a browser to check the layout).

export const LOCAL_EMAIL_DIR = path.join(LOCAL_DATA_DIR, 'emails')

export async function sendEmail(email) {
    if (isLocalMode()) return saveLocalEmail(email)
    return sendWithResend(email)
}

// ─── Live: Resend ─────────────────────────────────────────

let resend

async function sendWithResend(email) {
    if (!isConfigured(process.env.RESEND_API_KEY)) {
        // Log the content so nothing is lost (e.g. an order notification).
        printEmail(email, 'NOT SENT: RESEND_API_KEY is not set')
        throw new Error(`Email "${email.subject}" was not sent: RESEND_API_KEY is not set.`)
    }
    if (!email.to || (Array.isArray(email.to) && email.to.length === 0)) {
        printEmail(email, 'NOT SENT: no recipient')
        throw new Error(`Email "${email.subject}" was not sent: no recipient (is NOTIFICATION_EMAIL set?).`)
    }

    resend ??= new Resend(process.env.RESEND_API_KEY)

    // Resend returns errors instead of throwing them.
    const { data, error } = await resend.emails.send({
        from: email.from,
        to: email.to,
        replyTo: email.replyTo,
        subject: email.subject,
        html: email.html,
    })
    if (error) {
        throw new Error(`Resend could not send "${email.subject}" to ${email.to}: ${error.message ?? JSON.stringify(error)}`)
    }
    return { id: data?.id }
}

// ─── Local: console + HTML file ───────────────────────────

function formatList(value) {
    return Array.isArray(value) ? value.join(', ') : value
}

function printEmail(email, status, file) {
    const lines = [
        `[email] ${status}`,
        `  From:     ${email.from}`,
        `  To:       ${formatList(email.to) || '(no recipient: NOTIFICATION_EMAIL is not set)'}`,
        email.replyTo ? `  Reply-To: ${formatList(email.replyTo)}` : null,
        `  Subject:  ${email.subject}`,
        file ? `  File:     ${path.relative(process.cwd(), file)}` : null,
        '  ' + '─'.repeat(56),
        ...(email.text ?? '').split('\n').map(line => `  ${line}`),
        '  ' + '─'.repeat(56),
    ]
    console.log(lines.filter(line => line !== null).join('\n'))
}

function fileNameFor(subject) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const slug = String(subject ?? 'email')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50) || 'email'
    const suffix = Math.random().toString(16).slice(2, 6)
    return `${timestamp}-${slug}-${suffix}.html`
}

// A full HTML page: a header with the email details, then the email itself.
function previewPage(email) {
    const row = (label, value) => value
        ? `<tr><td style="padding: 2px 12px 2px 0; color: #888;">${label}</td><td>${escapeHtml(formatList(value))}</td></tr>`
        : ''
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(email.subject)}</title>
</head>
<body style="margin: 0; font-family: 'Helvetica Neue', Arial, sans-serif;">
<div style="padding: 16px 24px; background: #fffbe6; border-bottom: 1px solid #e8d98a; font-size: 13px;">
    <p style="margin: 0 0 8px 0; font-weight: 600;">Local mode: this email was not sent.</p>
    <table cellpadding="0" cellspacing="0" style="font-size: 13px;">
        ${row('From', email.from)}
        ${row('To', email.to || '(no recipient: NOTIFICATION_EMAIL is not set)')}
        ${row('Reply-To', email.replyTo)}
        ${row('Subject', email.subject)}
    </table>
</div>
${email.html}
</body>
</html>
`
}

async function saveLocalEmail(email) {
    let file = null
    try {
        await fs.mkdir(LOCAL_EMAIL_DIR, { recursive: true })
        file = path.join(LOCAL_EMAIL_DIR, fileNameFor(email.subject))
        await fs.writeFile(file, previewPage(email))
    } catch (error) {
        file = null
        console.warn(`[email] Could not save email to ${LOCAL_EMAIL_DIR} (${error.code ?? error.message}).`)
    }
    printEmail(email, 'Local mode, not sent', file)
    return { id: file ? path.basename(file) : null, file }
}
