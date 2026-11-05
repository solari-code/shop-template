export function generateOrderNumber() {
    const now = new Date()

    const date = now.toISOString().slice(0, 10).replace(/-/g, '') // 20260306
    const time = now.toTimeString().slice(0, 8).replace(/:/g, '')  // 142315

    return `#${date}-${time}`
}