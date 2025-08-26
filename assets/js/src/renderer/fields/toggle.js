import { registerRenderer } from '../index';
import { renderExtraAttributes } from '../helpers/attrs';
import { renderCustomDesc } from '../helpers/desc';

registerRenderer('toggle', (field) => {
    const extra = renderExtraAttributes(field);
    const customDescHtml = renderCustomDesc(field);
    return `
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
        ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
      </div>
      <div class="col-md-8">
        <div class="form-check form-switch">
          <input 
            class="form-check-input" 
            type="checkbox" 
            role="switch" 
            id="${field.id}" 
            name="${field.id}"
            :checked="settings.${field.id} == '1' || settings.${field.id} === true"
            @click="settings.${field.id} = (settings.${field.id} == 1 ? 0 : 1)"
            ${extra}
          >
        </div>
        ${customDescHtml}
      </div>
    </div>
  `;
});
