// The fields of the contact form (components/Contact.jsx), checked on the
// server: the browser's `required` check is easy to get around (e.g. with
// spaces only, or a request without the form). Plain function, safe in Node
// (tests).

// Returns { name, email, message } with the spaces around them removed, or
// null if a field is missing or empty.
export function readContactForm(formData) {
    const fields = {}
    for (const key of ['name', 'email', 'message']) {
        const value = formData.get(key)
        // Text only (a field can also be a file in a crafted request)
        if (typeof value !== 'string' || value.trim() === '') return null
        fields[key] = value.trim()
    }
    return fields
}
