import { registerRenderer } from '../index';
import { renderExtraAttributes } from '../helpers/attrs';
import { escapeDoubleQuotes } from '../helpers/html';
import { renderCustomDesc } from '../helpers/desc';

registerRenderer('textarea', (field) => {
    const rows = field.rows || 5;
    const customClass = field.class || '';
    const extra = renderExtraAttributes(field);
    const escapedPlaceholder = escapeDoubleQuotes(field.placeholder || '');
    const customDescHtml = renderCustomDesc(field);
    let activePlaceholderAttrs = '';
    if (field.active_placeholder && field.placeholder) {
        const placeholderJson = JSON.stringify(field.placeholder);
        activePlaceholderAttrs = `
      @focus='if (!settings.${field.id}) { settings.${field.id} = ${placeholderJson}; }'
      @blur='if (settings.${field.id} === ${placeholderJson}) { settings.${field.id} = ""; }'
    `;
    }

    return `
    <div class="row">
      <div class="col-md-4">
        <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
        ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
      </div>
      <div class="col-md-8">
        <textarea class="form-control ${customClass}" id="${field.id}" name="${field.id}" rows="${rows}" x-model="settings.${field.id}" placeholder="${escapedPlaceholder}" ${extra} ${activePlaceholderAttrs}></textarea>
        ${customDescHtml}
      </div>
    </div>
  `;
});
