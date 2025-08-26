import { registerRenderer } from '../index';
import { renderExtraAttributes } from '../helpers/attrs';
import { renderCustomDesc } from '../helpers/desc';

registerRenderer('font-awesome', (field) => {
    const customClass = field.class || '';
    const extra = renderExtraAttributes(field);
    const customDescHtml = renderCustomDesc(field);
    const addon = field.input_group_right || '';

    return `
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
        ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
      </div>
      <div class="col-md-8">
        <div class="input-group">
          <input data-aui-init="iconpicker" type="text" class="form-control ${customClass}" id="${field.id}" name="${field.id}" x-model="settings.${field.id}" placeholder="${field.placeholder || ''}" ${extra}>
          ${addon}
          <span class="input-group-addon input-group-text top-0 end-0 c-pointer"><i class="fas fa-icons"></i></span>
        </div>
        ${customDescHtml}
      </div>
    </div>
  `;
});
