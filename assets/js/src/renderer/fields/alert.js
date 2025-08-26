import { registerRenderer } from '../index';

registerRenderer('alert', (field) => {
    const type = field.alert_type || 'info';
    return `
    <div class="alert alert-${type} mb-0">
      ${field.label ? `<h6 class="alert-heading">${field.label}</h6>` : ''}
      ${field.description || ''}
    </div>
  `;
});
