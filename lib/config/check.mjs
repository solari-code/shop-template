// Runs the config check in Node, with image files checked in /public.
// Used by next.config.mjs (so errors stop `next dev`, `next build` and
// `next start`) and by `npm run check-config`. Not for app code: it reads
// the file system.

import fs from 'node:fs'
import path from 'node:path'
import { shopConfig } from '../../config/index.mjs'
import { validateConfig, formatIssues } from './validate.mjs'

export function checkShopConfig({ root = process.cwd(), config = shopConfig, localProducts } = {}) {
    const publicDir = path.join(root, 'public')
    // Without a public folder (e.g. some deployments at runtime) the image
    // paths can't be checked; the build has checked them already.
    const fileExists = fs.existsSync(publicDir)
        ? (publicPath) => fs.existsSync(path.join(publicDir, decodeURI(publicPath)))
        : undefined
    return validateConfig(config, { fileExists, localProducts })
}

export class ShopConfigError extends Error {
    constructor(errors) {
        super(`The shop config has ${errors.length} error${errors.length === 1 ? '' : 's'}:\n${formatIssues(errors)}\nFix them in config/ (run \`npm run check-config\` to check again).`)
        this.name = 'ShopConfigError'
        // Not enumerable, so Node doesn't print it again below the message
        Object.defineProperty(this, 'errors', { value: errors, enumerable: false })
    }
}

// For next.config.mjs: throws on errors, prints warnings. Placeholders are
// reported by the shop itself in live mode (lib/shopMode.js).
export function assertShopConfig(options) {
    // next.config.mjs is loaded by several processes during a build; check
    // and print only once.
    if (process.env.__SHOP_CONFIG_CHECKED) return
    const { errors, warnings } = checkShopConfig(options)
    if (errors.length) throw new ShopConfigError(errors)
    if (warnings.length) {
        console.warn(`[shop] Config warnings:\n${formatIssues(warnings)}`)
    }
    process.env.__SHOP_CONFIG_CHECKED = '1'
}
