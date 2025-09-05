// assets/js/src/renderer/fields/toggle.js

import { registerRenderer } from '../index';
import { renderExtraAttributes } from '../helpers/attrs';
import { renderCustomDesc } from '../helpers/desc';

registerRenderer('toggle', (field, modelPrefix = 'settings') => {
    const extra = renderExtraAttributes(field);
    const customDescHtml = renderCustomDesc(field);
    const model = `${modelPrefix}.${field.id}`;
    const changeHandler = `${model} = $event.target.checked ? 1 : 0;`;

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
            :checked="${model} == 1 || ${model} === true"
            @change="${changeHandler}"
            ${extra}
          >
        </div>
        ${customDescHtml}
      </div>
    </div>
  `;
});