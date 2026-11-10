import { siteConfig } from '@/config/site.mjs'
import { emailFrom } from '@/lib/config/shop.mjs'

// Sender details for all shop emails, from config/site.mjs.

// Public contact address: reply-to of order confirmations, shown in emails
export const SHOP_EMAIL = siteConfig.contact.email

// "Selva Studio <hello@example.com>"
export const FROM_ADDRESS = emailFrom(siteConfig.emailSender)
