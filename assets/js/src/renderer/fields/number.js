import { registerRenderer } from '../index';
import { renderExtraAttributes } from '../helpers/attrs';
import { renderCustomDesc } from '../helpers/desc';

registerRenderer('number', (field) => {
    const min  = field.min !== undefined ? `min="${field.min}"` : '';
    const max  = field.max !== undefined ? `max="${field.max}"` : '';
    const step = field.step !== undefined ? `step="${field.step}"` : '';
    const customClass = field.class || '';
    const extra = renderExtraAttributes(field);
    const customDescHtml = renderCustomDesc(field);

    const input = `<input type="number" class="form-control ${customClass}" id="${field.id}" name="${field.id}" x-model.number="settings.${field.id}" ${min} ${max} ${step} placeholder="${field.placeholder || ''}" ${extra}>`;
    const finalInput = field.input_group_right ? `<div class="input-group">${input}${field.input_group_right}</div>` : input;

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
});
