import { registerRenderer } from '../index';
import { renderExtraAttributes } from '../helpers/attrs';
import { renderCustomDesc } from '../helpers/desc';

registerRenderer('file', (field) => {
    const extra = renderExtraAttributes(field);
    const accept = field.accept || '';
    const customDescHtml = renderCustomDesc(field);
    return `
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
        ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
      </div>
      <div class="col-md-8">
        <input type="file" class="form-control p-2" id="${field.id}" name="${field.id}" accept="${accept}" ${extra}>
        ${customDescHtml}
      </div>
    </div>
  `;
});
