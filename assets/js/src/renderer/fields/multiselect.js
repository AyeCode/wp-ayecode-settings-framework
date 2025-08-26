import { registerRenderer } from '../index';
import { renderExtraAttributes } from '../helpers/attrs';
import { renderCustomDesc } from '../helpers/desc';

registerRenderer('multiselect', (field) => {
    const placeholderAttr = field.placeholder ? `data-placeholder="${field.placeholder}"` : '';
    const customClass = field.class || '';
    const extra = renderExtraAttributes(field);
    const customDescHtml = renderCustomDesc(field);
    let optionsHtml = '';
    if (field.options) {
        for (const [val, label] of Object.entries(field.options)) {
            optionsHtml += `<option value="${val}">${label}</option>`;
        }
    }

    return `
    <div class="row">
      <div class="col-md-4">
        <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
        ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
      </div>
      <div class="col-md-8">
        <select 
          class="form-select w-100 mw-100 ${customClass}" 
          id="${field.id}" 
          name="${field.id}"
          multiple 
          x-ref="${field.id}"
          x-init="initChoices('${field.id}')"
          ${placeholderAttr}
          ${extra}
        >${optionsHtml}</select>
        ${customDescHtml}
      </div>
    </div>
  `;
});
