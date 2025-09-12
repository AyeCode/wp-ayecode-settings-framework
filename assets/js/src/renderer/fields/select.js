import { registerRenderer } from '../index';
import { renderExtraAttributes } from '../helpers/attrs';
import { renderCustomDesc } from '../helpers/desc';

registerRenderer('select', (field) => {
    let optionsHtml = '';

    // Add a placeholder if one is defined
    if (field.placeholder) {
        optionsHtml += `<option value=""></option>`;
    }

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

    const placeholderAttr = field.placeholder ? `data-placeholder="${field.placeholder}"` : '';
    const customClass = field.class || '';
    const extra = renderExtraAttributes(field);
    const customDescHtml = renderCustomDesc(field);

    const modelOrInit = (field.class && field.class.includes('aui-select2'))
        ? `x-ref="${field.id}" x-init="initChoice('${field.id}')"`
        : `x-model="settings.${field.id}"`;

    return `
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
        ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
      </div>
      <div class="col-md-8">
        <select 
          class="form-select w-100 mw-100 ${customClass}" 
          id="${field.id}" 
          name="${field.id}"
          ${modelOrInit}
          ${placeholderAttr}
          ${extra}
        >${optionsHtml}</select>
        ${customDescHtml}
      </div>
    </div>
  `;
});