import { registerRenderer } from '../index';
import { renderExtraAttributes } from '../helpers/attrs';

registerRenderer('hidden', (field) => {
    const extra = renderExtraAttributes(field);
    return `<input type="hidden" id="${field.id}" name="${field.id}" x-model="settings.${field.id}" ${extra}>`;
});
