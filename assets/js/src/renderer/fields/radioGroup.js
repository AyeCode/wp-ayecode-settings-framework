import { registerRenderer } from '../index';
import { renderExtraAttributes } from '../helpers/attrs';
import { renderCustomDesc } from '../helpers/desc';

registerRenderer('radio_group', (field, modelPrefix = 'settings') => {
    let optionsHtml = '';
    const extra = renderExtraAttributes(field);
    const buttonStyle = field.button_style || 'outline-primary';
    const buttonSize = field.button_size || ''; // '' for normal, 'btn-group-sm' or 'btn-group-lg'

    if (field.options) {
        for (const [val, label] of Object.entries(field.options)) {
            optionsHtml += `
                <input type="radio" class="btn-check" name="${field.id}" id="${field.id}_${val}" value="${val}" x-model="${modelPrefix}['${field.id}']" ${extra} autocomplete="off">
                <label class="btn btn-${buttonStyle}" :class="{'active': ${modelPrefix}['${field.id}'] === '${val}'}" for="${field.id}_${val}">${label}</label>
            `;
        }
    }

    const customDescHtml = renderCustomDesc(field);
    return `
    <div class="row align-items-center">
      <div class="col-md-4">
        <label class="form-label fw-bold mb-0">${field.label || field.id}</label>
        ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
      </div>
      <div class="col-md-8">
        <div class="btn-group ${buttonSize}" role="group" aria-label="${field.label || field.id}">
          ${optionsHtml}
        </div>
        ${customDescHtml}
      </div>
    </div>
  `;
});
