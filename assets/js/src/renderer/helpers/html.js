// Small HTML escaping helpers, matching original behaviour where needed.

export function escapeAttr(val) {
    return String(val)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function escapeText(val) {
    // For plain text nodes; keep simple.
    return String(val)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Utility used where original code only escaped double quotes in placeholders etc.
export function escapeDoubleQuotes(val) {
    return String(val).replace(/"/g, '&quot;');
}
