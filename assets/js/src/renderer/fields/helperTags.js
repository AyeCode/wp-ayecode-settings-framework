import { registerRenderer } from '../index';

registerRenderer('helper_tags', (field) => {
    if (!field.options || typeof field.options !== 'object') {
        return '<div class="alert alert-warning">Helper tags field requires an "options" object.</div>';
    }

    let tags = '';
    for (const [key, value] of Object.entries(field.options)) {
        const escapedValue = String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        const escapedKey = String(key).replace(/'/g, "\\'");
        tags += `
      <div class="d-inline-flex align-items-center border rounded-pill px-2 py-1 me-2 mb-2 bg-light-subtle text-body fs-xs">
        <span 
          class="c-pointer" 
          @click="navigator.clipboard.writeText('${escapedKey}'); aui_toast('aui-settings-tag-copied','success','Copied to Clipboard');"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Click to copy"
        >${key}</span>
        <i 
          class="fa-solid fa-circle-question ms-2 text-muted c-pointer" 
          data-bs-toggle="tooltip" 
          data-bs-placement="top"
          title="${escapedValue}"
        ></i>
      </div>
    `;
    }

    const customDescHtml = field.custom_desc ? `<div class="form-text mt-2">${field.custom_desc}</div>` : '';

    return `
    <div class="row">
      <div class="col-12">
        <label class="form-label fw-bold mb-2">${field.label || field.id}</label>
        ${field.description ? `<p class="form-text text-muted mt-0 mb-2">${field.description}</p>` : ''}
        <div class="d-flex flex-wrap align-items-center">
          ${tags}
        </div>
        ${customDescHtml}
      </div>
    </div>
  `;
});
