import { registerRenderer } from '../index';
import { renderCustomDesc } from '../helpers/desc';

registerRenderer('action_button', (field) => {
    const customDescHtml = renderCustomDesc(field);
    const statePath = `actionStates['${field.id}']`;

    if (field.toggle_config) {
        const insertCfg = field.toggle_config.insert || {};
        const removeCfg = field.toggle_config.remove || {};
        return `
      <div class="row align-items-center rounded" x-ref="action_container_${field.id}">
        <div class="col-md-4">
          <label class="form-label fw-bold mb-0">${field.label || ''}</label>
          ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
        </div>
        <div class="col-md-8">
          <div class="d-flex align-items-center justify-content-end">
            <div class="me-3" x-show="${statePath}?.message" x-cloak>
              <span :class="${statePath}?.success ? 'text-success' : 'text-danger'" x-text="${statePath}?.message"></span>
            </div>
            <button type="button" 
                    id="${field.id}" 
                    class="btn"
                    :class="${statePath}?.has_dummy_data ? '${removeCfg.button_class || 'btn-danger'}' : '${insertCfg.button_class || 'btn-primary'}'"
                    @click="executeAction('${field.id}')" 
                    :disabled="${statePath}?.isLoading">
              <span x-show="${statePath}?.isLoading" class="spinner-border spinner-border-sm me-2" x-cloak></span>
              <span x-text="${statePath}?.isLoading ? strings.processing : (${statePath}?.has_dummy_data ? '${removeCfg.button_text}' : '${insertCfg.button_text}')"></span>
            </button>
          </div>
        </div>
        <div class="col-md-12">
          ${customDescHtml}
          <div class="progress mt-2" style="height: 5px;" x-show="${statePath}?.progress > 0 && ${statePath}?.progress < 100" x-cloak>
            <div class="progress-bar" role="progressbar" :style="{ width: ${statePath}?.progress + '%' }"></div>
          </div>
        </div>
      </div>
    `;
    }

    const buttonClass = field.button_class || 'btn-secondary';
    const confirmMsg = field.confirm_message ? field.confirm_message.replace(/'/g, "\\'") : '';
    const needsConfirm = field.confirm || false;
    const clickHandler = needsConfirm
        ? `handleActionClick('${field.id}', true, '${confirmMsg}')`
        : `executeAction('${field.id}')`;

    return `
    <div class="row align-items-center rounded" x-ref="action_container_${field.id}">
      <div class="col-md-4">
        <label class="form-label fw-bold mb-0">${field.label || field.id}</label>
        ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
      </div>
      <div class="col-md-8">
        <div class="d-flex align-items-center justify-content-end">
          <div class="me-3" x-show="${statePath}?.message" x-cloak>
            <span :class="${statePath}?.success ? 'text-success' : 'text-danger'" x-text="${statePath}?.message"></span>
          </div>
          <button type="button" id="${field.id}" class="btn ${buttonClass}" @click="${clickHandler}" :disabled="${statePath}?.isLoading">
            <span x-show="${statePath}?.isLoading" class="spinner-border spinner-border-sm me-2" x-cloak></span>
            <span x-text="${statePath}?.isLoading ? strings.processing : '${field.button_text || 'Run'}'"></span>
          </button>
        </div>
      </div>
      <div class="col-md-12">
        ${customDescHtml}
        <div class="progress mt-2" style="height: 5px;" x-show="${statePath}?.progress > 0 && ${statePath}?.progress < 100" x-cloak>
          <div class="progress-bar" role="progressbar" :style="{ width: ${statePath}?.progress + '%' }"></div>
        </div>
      </div>
    </div>
  `;
});
