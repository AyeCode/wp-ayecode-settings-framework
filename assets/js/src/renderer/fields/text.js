import { registerRenderer } from '../index';
import { renderExtraAttributes } from '../helpers/attrs';
import { escapeDoubleQuotes } from '../helpers/html';
import { renderCustomDesc } from '../helpers/desc';

registerRenderer('text', renderTextLike);
registerRenderer('email', renderTextLike);
registerRenderer('url', renderTextLike);
registerRenderer('slug', renderTextLike);

function renderTextLike(field, modelPrefix = 'settings') {
    const customClass = field.class || '';
    const extra = renderExtraAttributes(field);
    const escapedPlaceholder = escapeDoubleQuotes(field.placeholder || '');
    let activePlaceholderAttrs = '';
    if (field.active_placeholder && field.placeholder) {
        const placeholderJson = JSON.stringify(field.placeholder);
        activePlaceholderAttrs = `
      @focus='if (!${modelPrefix}.${field.id}) { ${modelPrefix}.${field.id} = ${placeholderJson}; }'
      @blur='if (${modelPrefix}.${field.id} === ${placeholderJson}) { ${modelPrefix}.${field.id} = ""; }'
    `;
    }

    // Add auto-sanitization for slug type
    let inputHandler = '';
    if (field.type === 'slug') {
        inputHandler = `@input="${modelPrefix}['${field.id}'] = $event.target.value.toLowerCase().replace(/[^-a-z0-9]/g, '-').replace(/-+/g, '-')"`;
    }

    const type = (field.type === 'slug') ? 'text' : (field.type || 'text');
    const input = `<input type="${type}" class="form-control ${customClass}" id="${field.id}" name="${field.id}" x-model="${modelPrefix}['${field.id}']" placeholder="${escapedPlaceholder}" ${extra} ${activePlaceholderAttrs} ${inputHandler} @focus="handleFocusSync('${field.id}')">`;
    const finalInput = field.input_group_right ? `<div class="input-group">${input}${field.input_group_right}</div>` : input;
    const customDescHtml = renderCustomDesc(field);

    return `
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
        ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
      </div>
      <div class="col-md-8">
        ${finalInput}
        ${customDescHtml}
      </div>
    </div>
  `;
}