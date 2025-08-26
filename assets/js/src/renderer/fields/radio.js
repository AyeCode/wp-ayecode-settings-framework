import { registerRenderer } from '../index';
import { renderExtraAttributes } from '../helpers/attrs';
import { renderCustomDesc } from '../helpers/desc';

registerRenderer('radio', (field) => {
    let optionsHtml = '';
    const extra = renderExtraAttributes(field);
    if (field.options) {
        for (const [val, label] of Object.entries(field.options)) {
            optionsHtml += `
        <div class="form-check">
          <input class="form-check-input" type="radio" name="${field.id}" id="${field.id}_${val}" value="${val}" x-model="settings.${field.id}" ${extra}>
          <label class="form-check-label" for="${field.id}_${val}">${label}</label>
        </div>
      `;
        }
    }
    const customDescHtml = renderCustomDesc(field);
    return `
    <div class="row">
      <div class="col-md-4">
        <label class="form-label fw-bold mb-0">${field.label || field.id}</label>
        ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
      </div>
      <div class="col-md-8">
        ${optionsHtml}
        ${customDescHtml}
      </div>
    </div>
  `;
});
