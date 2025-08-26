import { registerRenderer } from '../index';
import { renderExtraAttributes } from '../helpers/attrs';
import { renderCustomDesc } from '../helpers/desc';

registerRenderer('checkbox', (field) => {
    const extra = renderExtraAttributes(field);
    const customDescHtml = renderCustomDesc(field);
    return `
    <div class="row">
      <div class="col-md-4">
        <label class="form-label fw-bold mb-0">${field.label || field.id}</label>
      </div>
      <div class="col-md-8">
        <div class="form-check">
          <input 
            class="form-check-input" 
            type="checkbox" id="${field.id}" 
            name="${field.id}"
            x-model="settings.${field.id}" 
            :checked="settings.${field.id} == '1' || settings.${field.id} === true"
            ${extra}
          >
          <label class="form-check-label" for="${field.id}">${field.description || ''}</label>
        </div>
        ${customDescHtml}
      </div>
    </div>
  `;
});
