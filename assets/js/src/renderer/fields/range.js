import { registerRenderer } from '../index';
import { renderExtraAttributes } from '../helpers/attrs';
import { renderCustomDesc } from '../helpers/desc';

registerRenderer('range', (field) => {
    const min = field.min || 0;
    const max = field.max || 100;
    const step = field.step || 1;
    const extra = renderExtraAttributes(field);
    const customDescHtml = renderCustomDesc(field);
    return `
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
        ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
      </div>
      <div class="col-md-8">
        <div class="d-flex align-items-center">
          <input type="range" class="form-range" id="${field.id}" name="${field.id}" min="${min}" max="${max}" step="${step}" x-model="settings.${field.id}" ${extra}>
          <span class="badge bg-secondary ms-3" x-text="settings.${field.id}"></span>
        </div>
        ${customDescHtml}
      </div>
    </div>
  `;
});
