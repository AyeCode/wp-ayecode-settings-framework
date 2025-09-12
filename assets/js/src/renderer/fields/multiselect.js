import { registerRenderer } from '../index';
import { renderExtraAttributes } from '../helpers/attrs';
import { renderCustomDesc } from '../helpers/desc';

registerRenderer('multiselect', (field) => {
    const placeholderAttr = field.placeholder ? `data-placeholder="${field.placeholder}"` : '';
    const customClass = field.class || '';
    const extra = renderExtraAttributes(field);
    const customDescHtml = renderCustomDesc(field);
    let optionsHtml = '';

    // New logic to build options with optgroup support
    if (field.options) {
        for (const [key, value] of Object.entries(field.options)) {
            // Check if the value is an object (but not null), indicating an optgroup
            if (typeof value === 'object' && value !== null) {
                optionsHtml += `<optgroup label="${key}">`;
                for (const [optVal, optLabel] of Object.entries(value)) {
                    optionsHtml += `<option value="${optVal}">${optLabel}</option>`;
                }
                optionsHtml += `</optgroup>`;
            } else {
                // Otherwise, it's a regular option
                optionsHtml += `<option value="${key}">${value}</option>`;
            }
        }
    }

    return `
    <div class="row">
      <div class="col-md-4">
        <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
        ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
      </div>
      <div class="col-md-8">
        <select 
          class="form-select w-100 mw-100 ${customClass}" 
          id="${field.id}" 
          name="${field.id}"
          multiple 
          x-ref="${field.id}"
          x-init="initChoices('${field.id}')"
          ${placeholderAttr}
          ${extra}
        >${optionsHtml}</select>
        ${customDescHtml}
      </div>
    </div>
  `;
});