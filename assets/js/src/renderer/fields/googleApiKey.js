import { registerRenderer } from '../index';
import { renderExtraAttributes } from '../helpers/attrs';
import { renderCustomDesc } from '../helpers/desc';

registerRenderer('google_api_key', (field) => {
    const customClass = field.class || '';
    const extra = renderExtraAttributes(field);
    const customDescHtml = renderCustomDesc(field);
    const input = `<input type="password" autocomplete="new-password" class="form-control ${customClass}" id="${field.id}" name="${field.id}" x-model="settings.${field.id}" @focus="$event.target.type = 'text'" @blur="$event.target.type = 'password'" placeholder="${field.placeholder || '••••••••••••••••••••••••••••'}" ${extra}>`;
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
