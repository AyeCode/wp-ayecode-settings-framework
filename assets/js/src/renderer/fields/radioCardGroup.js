import { registerRenderer } from '../index';
import { renderExtraAttributes } from '../helpers/attrs';
import { renderCustomDesc } from '../helpers/desc';

registerRenderer('radio_card_group', (field, modelPrefix = 'settings') => {
    const extra = renderExtraAttributes(field);
    let cardsHtml = '';

    if (field.options) {
        for (const [val, option] of Object.entries(field.options)) {
            // Handle both simple string options and complex object options
            const isObject = typeof option === 'object' && option !== null;
            const label = isObject ? option.label : option;
            const icon = isObject ? option.icon : null;
            const iconColor = isObject ? option.icon_color : null;
            const image = isObject ? option.image : null;
            const html = isObject ? option.html : null;
            const description = isObject ? option.description : null;

            // Generate visual content (priority: html > image > icon > none)
            let visualHtml = '';
            if (html) {
                visualHtml = `<div class="card-img-top d-flex align-items-center justify-content-center p-3">${html}</div>`;
            } else if (image) {
                visualHtml = `<img src="${image}" class="card-img-top" alt="${label}" style="height: 120px; object-fit: cover;">`;
            } else if (icon) {
                const iconStyle = iconColor ? `style="color: ${iconColor};"` : '';
                visualHtml = `<div class="card-img-top d-flex align-items-center justify-content-center pt-3 pb-0 fs-3"><i class="${icon}" ${iconStyle}></i></div>`;
            }

            cardsHtml += `
                <div class="col">
                    <input
                        type="radio"
                        class="btn-check d-none"
                        id="${field.id}_${val}"
                        name="${field.id}"
                        value="${val}"
                        x-model="${modelPrefix}['${field.id}']"
                        ${extra}
                        autocomplete="off">
                    <label
                        class="card px-0 pb-3 mt-0 h-100 cursor-pointer border-2 asf-radio-card cursor-pointer hover-shadow"
                        for="${field.id}_${val}"
                        style="transition: all 0.2s ease;">
                        ${visualHtml}
                        <div class="card-body p-1 text-center">
                            <h6 class="card-title fw-bold mb-1">${label}</h6>
                            ${description ? `<p class="card-text text-muted small mb-0">${description}</p>` : ''}
                        </div>

                    </label>
                </div>
            `;
        }
    }

    const customDescHtml = renderCustomDesc(field);

    return `
    <div class="row mb-4">
      <div class="col-12">
        <label class="form-label fw-bold mb-2">${field.label || field.id}</label>
        ${field.description ? `<p class="form-text text-muted mt-1 mb-3">${field.description}</p>` : ''}
      </div>
      <div class="col-12">
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4x g-3">
          ${cardsHtml}
        </div>
        ${customDescHtml}
      </div>
    </div>
    <style>
      .asf-radio-card {
        transition: all 0.2s ease;
      }
      .btn-check:checked + .asf-radio-card {
        border-color: var(--bs-primary) !important;
        background-color: var(--bs-primary-bg-subtle);
      }
    </style>
  `;
});
