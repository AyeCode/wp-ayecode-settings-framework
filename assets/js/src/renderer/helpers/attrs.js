import { escapeAttr } from './html';

// Renders field.extra_attributes into HTML attributes (unchanged behaviour).
export function renderExtraAttributes(field) {
    if (!field?.extra_attributes || typeof field.extra_attributes !== 'object') return '';
    const attrs = [];
    for (const [key, value] of Object.entries(field.extra_attributes)) {
        const saneKey = key.replace(/[^a-zA-Z0-9-]/g, '');
        if (!saneKey) continue;
        if (value === true) {
            attrs.push(saneKey);
        } else {
            attrs.push(`${saneKey}="${escapeAttr(value)}"`);
        }
    }
    return attrs.join(' ');
}
