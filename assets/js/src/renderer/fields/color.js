import { registerRenderer } from '../index';
import { renderExtraAttributes } from '../helpers/attrs';
import { renderCustomDesc } from '../helpers/desc';

registerRenderer('color', (field) => {
    const extra = renderExtraAttributes(field);
    const customDescHtml = renderCustomDesc(field);

    const resetBtn = field.default ? `
    <button 
      type="button" 
      class="btn btn-outline-secondary ms-2" 
      title="Reset to default"
      x-cloak
      x-show="settings.${field.id} && settings.${field.id}.toLowerCase() !== '${field.default}'.toLowerCase()"
      @click="settings.${field.id} = '${field.default}'"
      data-bs-toggle="tooltip"
    >
      <i class="fa-solid fa-rotate-left"></i>
    </button>
  ` : '';

    return `
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
        ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
      </div>
      <div class="col-md-8">
        <div class="d-flex align-items-center">
          <input type="color" class="form-control form-control-color me-2" id="${field.id}-color" x-model="settings.${field.id}">
          <input 
            type="text" 
            class="form-control" 
            id="${field.id}" 
            name="${field.id}"
            x-model="settings.${field.id}" 
            style="max-width: 120px;" 
            pattern="^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$" 
            ${extra}
          >
          ${resetBtn}
        </div>
        ${customDescHtml}
      </div>
    </div>
  `;
});
