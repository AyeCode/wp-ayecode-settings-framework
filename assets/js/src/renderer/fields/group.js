import { registerRenderer } from '../index';

registerRenderer('group', (field) => {
    let inner = '';
    if (field.fields) {
        field.fields.forEach((sub) => {
            const safeJson = JSON.stringify(sub).replace(/"/g, '&quot;');
            inner += `
        <div class="py-4" 
             x-show="shouldShowField(${safeJson})" 
             x-transition 
             x-cloak>
          ${window.asfFieldRenderer.renderField(sub)}
        </div>
      `;
        });
    }
    return `
    <div class="card mb-4 w-100 mw-100 p-0">
      <div class="card-header bg-light-subtle">
        <h6 class="fw-bold mb-0">${field.label || ''}</h6>
        ${field.description ? `<p class="text-muted small mb-0 mt-1">${field.description}</p>` : ''}
      </div>
      <div class="card-body">
        ${inner}
      </div>
    </div>
  `;
});
