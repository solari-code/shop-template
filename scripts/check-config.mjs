// Checks the shop config (config/*.mjs) and the example products.
// Usage: npm run check-config
//
// Exits with code 1 if there are errors. Also lists the example values of
// the template that are still set, which should be replaced before going live.

import { localProducts } from '../data/products.js'
import { checkShopConfig } from '../lib/config/check.mjs'
import { formatIssues } from '../lib/config/validate.mjs'

const { errors, warnings, placeholders } = checkShopConfig({ localProducts })

if (errors.length) {
    console.error(`✗ ${errors.length} error${errors.length === 1 ? '' : 's'} (the shop won't build until they are fixed):\n${formatIssues(errors)}\n`)
}
if (warnings.length) {
    console.warn(`! ${warnings.length} warning${warnings.length === 1 ? '' : 's'}:\n${formatIssues(warnings)}\n`)
}
if (placeholders.length) {
    console.log(`… ${placeholders.length} example value${placeholders.length === 1 ? '' : 's'} still set (replace before going live):\n${formatIssues(placeholders)}\n`)
}
if (!errors.length) {
    console.log(`✓ The config is valid${warnings.length ? ', but see the warnings above' : ''}.`)
}
process.exit(errors.length ? 1 : 0)
