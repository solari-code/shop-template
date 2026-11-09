import 'server-only'
import fs from 'node:fs/promises'
import path from 'node:path'

// Small JSON file store for local mode: .local-data/store.json
//
// Holds everything that changes while testing locally: sold quantities,
// processed orders and test checkouts. The example products
// themselves stay in data/products.js. Delete .local-data to reset.
//
// If the folder can't be written (e.g. a read-only deployment), the store
// falls back to memory and logs a warning; data then resets on restart.

export const LOCAL_DATA_DIR = path.join(process.cwd(), '.local-data')
const STORE_FILE = path.join(LOCAL_DATA_DIR, 'store.json')

function emptyStore() {
    return {
        version: 1,
        // { [productId]: { [variantId]: quantity sold } }
        sold: {},
        // Processed orders, to skip duplicates: { [orderId]: { orderNumber, status, ... } }
        orders: {},
        // Test checkouts (local payment provider): { [checkoutId]: { status, items, ... } }
        checkouts: {},
    }
}

// Shared across module instances within one process (Next.js can load
// this file in several bundles), so all updates go through one queue.
const state = globalThis.__shopLocalStore ??= {
    queue: Promise.resolve(),
    memory: null,
}

async function readFromDisk() {
    let raw
    try {
        raw = await fs.readFile(STORE_FILE, 'utf8')
    } catch (error) {
        if (error.code === 'ENOENT') return emptyStore()
        throw error
    }
    try {
        return { ...emptyStore(), ...JSON.parse(raw) }
    } catch {
        throw new Error(`Local data file ${STORE_FILE} is not valid JSON. Fix it or delete the .local-data folder to reset.`)
    }
}

async function writeToDisk(data) {
    await fs.mkdir(LOCAL_DATA_DIR, { recursive: true })
    // Write to a temp file first so a crash never leaves a half-written store.
    const tempFile = `${STORE_FILE}.${process.pid}.tmp`
    await fs.writeFile(tempFile, JSON.stringify(data, null, 2) + '\n')
    await fs.rename(tempFile, STORE_FILE)
}

export async function readLocalData() {
    if (state.memory) return structuredClone(state.memory)
    return readFromDisk()
}

// Runs `mutator(data)` on the current data and saves the result.
// Updates are serialised, so concurrent calls don't overwrite each other.
export function updateLocalData(mutator) {
    const run = state.queue.then(async () => {
        const data = await readLocalData()
        const result = await mutator(data)

        if (state.memory) {
            state.memory = data
            return result
        }

        try {
            await writeToDisk(data)
        } catch (error) {
            state.memory = data
            console.warn(`[shop] Could not write ${STORE_FILE} (${error.code ?? error.message}). Keeping local data in memory; it resets on restart.`)
        }
        return result
    })
    // Keep the queue going even if this update failed.
    state.queue = run.catch(() => {})
    return run
}
