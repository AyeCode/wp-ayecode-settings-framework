// Renders custom_desc (raw HTML allowed, same as original; ensure backend sanitizes)
export function renderCustomDesc(field) {
    if (!field?.custom_desc) return '';
    return `<div class="form-text mt-2">${field.custom_desc}</div>`;
}
