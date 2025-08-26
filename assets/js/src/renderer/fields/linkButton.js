import { registerRenderer } from '../index';
import { renderCustomDesc } from '../helpers/desc';

registerRenderer('link_button', (field) => {
    const url = field.url || '#';
    const buttonText = field.button_text || 'Click Here';
    const buttonClass = field.button_class || 'btn-secondary';
    const target = field.target ? `target="${field.target}"` : '';
    const rel = field.target === '_blank' ? 'rel="noopener noreferrer"' : '';
    const btn = `<a href="${url}" class="btn ${buttonClass}" ${target} ${rel}>${buttonText}</a>`;
    const customDescHtml = renderCustomDesc(field);

    return `
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label class="form-label fw-bold mb-0">${field.label || field.id}</label>
        ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
      </div>
      <div class="col-md-8 d-flex align-items-center justify-content-end">
        ${btn}
        ${customDescHtml}
      </div>
    </div>
  `;
});
