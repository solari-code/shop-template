// Resets local mode: deletes .local-data (sold stock, processed orders,
// test checkouts and saved emails). The example products in
// data/products.js are not touched. Usage: npm run reset-local
import fs from 'node:fs'
import path from 'node:path'

const dir = path.join(process.cwd(), '.local-data')

if (!fs.existsSync(dir)) {
    console.log('Nothing to reset: .local-data does not exist.')
    process.exit(0)
}

const emailDir = path.join(dir, 'emails')
const emails = fs.existsSync(emailDir) ? fs.readdirSync(emailDir).length : 0

fs.rmSync(dir, { recursive: true, force: true })
console.log(`Removed .local-data (stock changes, orders, test checkouts and ${emails} saved email${emails === 1 ? '' : 's'}).`)
console.log('Stock is back to the values in data/products.js. A running dev server picks this up on the next request.')
