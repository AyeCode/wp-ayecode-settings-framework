/**
 * AyeCode Settings Framework - Field Renderer
 *
 * Contains functions for rendering HTML for various field types.
 * This can be reused in different contexts, like settings pages or setup wizards.
 */
window.asfFieldRenderer = {
    /**
     * Render a field based on its type by calling individual render functions.
     * This is the main dispatcher function.
     */
    renderField(field) {
        if (!field.type) {
            return '<div class="alert alert-warning">Invalid field configuration</div>';
        }

        switch (field.type) {
            case 'text':
            case 'email':
            case 'url':
                return this.renderTextField(field);
            case 'password':
                return this.renderPasswordField(field);
            case 'number':
                return this.renderNumberField(field);
            case 'textarea':
                return this.renderTextareaField(field);
            case 'toggle':
                return this.renderToggleField(field);
            case 'select':
                return this.renderSelectField(field);
            case 'color':
                return this.renderColorField(field);
            case 'range':
                return this.renderRangeField(field);
            case 'checkbox':
                return this.renderCheckboxField(field);
            case 'radio':
                return this.renderRadioField(field);
            case 'multiselect':
                return this.renderMultiselectField(field);
            case 'checkbox_group':
                return this.renderCheckboxGroupField(field);
            case 'group':
                return this.renderGroupField(field);
            case 'image':
                return this.renderImageField(field);
            default:
                return `<div class="alert alert-info">Unsupported field type: ${field.type}</div>`;
        }
    },

    /**
     * Renders a group of fields within a card.
     */
    renderGroupField(field) {
        let innerFieldsHtml = '';

        if (field.fields) {
            field.fields.forEach((subField, index) => {
                const isLast = index === field.fields.length - 1;
                const wrapperClass = isLast ? '' : 'mb-4';
                // Note the change here: calling this.renderField to stay within the object
                innerFieldsHtml += `<div class="${wrapperClass}">${this.renderField(subField)}</div>`;
            });
        }

        return `
            <div class="card mb-4 w-100 mw-100 p-0">
                <div class="card-header bg-light-subtle">
                    <h6 class="fw-bold mb-0">${field.label}</h6>
                    ${field.description ? `<p class="text-muted small mb-0 mt-1">${field.description}</p>` : ''}
                </div>
                <div class="card-body">
                    ${innerFieldsHtml}
                </div>
            </div>
        `;
    },

    /**
     * The functions below create the full two-column row for each field type.
     * The generated HTML uses Alpine.js directives that will be interpreted
     * by the component that calls these functions (e.g., ayecodeSettingsApp).
     */
    renderTextField(field) {
        const customClass = field.class || '';
        return `
            <div class="row align-items-center">
                <div class="col-md-4">
                    <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    <input type="${field.type || 'text'}" class="form-control ${customClass}" id="${field.id}" x-model="settings.${field.id}" @input="markChanged()" placeholder="${field.placeholder || ''}">
                </div>
            </div>
        `;
    },

    renderPasswordField(field) {
        const customClass = field.class || '';
        return `
            <div class="row align-items-center">
                <div class="col-md-4">
                    <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    <input type="password" class="form-control ${customClass}" id="${field.id}" x-model="settings.${field.id}" @input="markChanged()" placeholder="${field.placeholder || ''}">
                </div>
            </div>
        `;
    },

    renderNumberField(field) {
        const min = field.min !== undefined ? `min="${field.min}"` : '';
        const max = field.max !== undefined ? `max="${field.max}"` : '';
        const step = field.step !== undefined ? `step="${field.step}"` : '';
        const customClass = field.class || '';
        return `
            <div class="row align-items-center">
                <div class="col-md-4">
                    <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    <input type="number" class="form-control ${customClass}" id="${field.id}" x-model="settings.${field.id}" @input="markChanged()" ${min} ${max} ${step} placeholder="${field.placeholder || ''}">
                </div>
            </div>
        `;
    },

    renderTextareaField(field) {
        const rows = field.rows || 5;
        const customClass = field.class || '';
        return `
            <div class="row">
                <div class="col-md-4">
                    <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    <textarea class="form-control ${customClass}" id="${field.id}" rows="${rows}" x-model="settings.${field.id}" @input="markChanged()" placeholder="${field.placeholder || ''}"></textarea>
                </div>
            </div>
        `;
    },

    renderToggleField(field) {
        return `
            <div class="row align-items-center">
                <div class="col-md-4">
                    <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" role="switch" id="${field.id}" x-model="settings.${field.id}" @change="markChanged()">
                    </div>
                </div>
            </div>
        `;
    },

    renderSelectField(field) {
        let optionsHtml = '';
        if (field.placeholder) {
            optionsHtml += `<option value=""></option>`;
        }
        if (field.options) {
            for (const [optValue, optLabel] of Object.entries(field.options)) {
                optionsHtml += `<option value="${optValue}">${optLabel}</option>`;
            }
        }

        const placeholderAttr = field.placeholder ? `data-placeholder="${field.placeholder}"` : '';
        const customClass = field.class || '';
        return `
            <div class="row align-items-center">
                <div class="col-md-4">
                    <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    <select class="form-select w-100 mw-100 ${customClass}" id="${field.id}" x-model="settings.${field.id}" @change="markChanged()" ${placeholderAttr}>
                        ${optionsHtml}
                    </select>
                </div>
            </div>
        `;
    },

    renderColorField(field) {
        return `
            <div class="row align-items-center">
                <div class="col-md-4">
                    <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                     <div class="d-flex align-items-center">
                        <input type="color" class="form-control form-control-color me-2" id="${field.id}-color" x-model="settings.${field.id}" @input="markChanged()">
                        <input type="text" class="form-control" id="${field.id}" x-model="settings.${field.id}" @input="markChanged()" style="max-width: 120px;" pattern="^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$">
                    </div>
                </div>
            </div>
        `;
    },

    renderRangeField(field) {
        const min = field.min || 0;
        const max = field.max || 100;
        const step = field.step || 1;
        return `
            <div class="row align-items-center">
                <div class="col-md-4">
                    <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    <div class="d-flex align-items-center">
                        <input type="range" class="form-range" id="${field.id}" min="${min}" max="${max}" step="${step}" x-model="settings.${field.id}" @input="markChanged()">
                        <span class="badge bg-secondary ms-3" x-text="settings.${field.id}"></span>
                    </div>
                </div>
            </div>
        `;
    },

    renderCheckboxField(field) {
        return `
            <div class="row">
                <div class="col-md-4">
                     <label class="form-label fw-bold mb-0">${field.label || field.id}</label>
                </div>
                <div class="col-md-8">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="${field.id}" x-model="settings.${field.id}" @change="markChanged()">
                        <label class="form-check-label" for="${field.id}">${field.description || ''}</label>
                    </div>
                </div>
            </div>
        `;
    },

    renderRadioField(field) {
        let optionsHtml = '';
        if (field.options) {
            for (const [optValue, optLabel] of Object.entries(field.options)) {
                optionsHtml += `
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="${field.id}" id="${field.id}_${optValue}" value="${optValue}" x-model="settings.${field.id}" @change="markChanged()">
                        <label class="form-check-label" for="${field.id}_${optValue}">${optLabel}</label>
                    </div>
                `;
            }
        }
        return `
            <div class="row">
                <div class="col-md-4">
                    <label class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    ${optionsHtml}
                </div>
            </div>
        `;
    },

    renderMultiselectField(field) {
        let optionsHtml = '';
        if (field.options) {
            for (const [optValue, optLabel] of Object.entries(field.options)) {
                optionsHtml += `<option value="${optValue}">${optLabel}</option>`;
            }
        }

        const placeholderAttr = field.placeholder ? `data-placeholder="${field.placeholder}"` : '';
        const customClass = field.class || '';
        return `
            <div class="row">
                <div class="col-md-4">
                    <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    <select class="form-select w-100 mw-100 ${customClass}" id="${field.id}" multiple x-model="settings.${field.id}" @change="markChanged()" ${placeholderAttr}>
                        ${optionsHtml}
                    </select>
                </div>
            </div>
        `;
    },

    renderCheckboxGroupField(field) {
        let optionsHtml = '';
        if (field.options) {
            for (const [optValue, optLabel] of Object.entries(field.options)) {
                optionsHtml += `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="${optValue}" id="${field.id}_${optValue}" x-model="settings.${field.id}" @change="markChanged()">
                        <label class="form-check-label" for="${field.id}_${optValue}">${optLabel}</label>
                    </div>
                `;
            }
        }
        return `
            <div class="row">
                <div class="col-md-4">
                    <label class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    ${optionsHtml}
                </div>
            </div>
        `;
    },

    renderImageField(field) {
        return `
            <div class="row">
                <div class="col-md-4">
                    <label class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    <div class="asf-image-uploader">
                        <div class="asf-image-preview mb-2 border rounded" style="width: 150px; height: 150px; background-color: #f8f9fa; display: flex; align-items: center; justify-content: center;" x-show="settings.${field.id}">
                            <img x-bind:src="imagePreviews[field.id]" style="max-width: 100%; max-height: 100%; object-fit: cover;" alt="Preview">
                        </div>
                        <div>
                            <button type="button" class="btn btn-sm btn-secondary" @click.prevent="selectImage('${field.id}')">
                                <i class="fa-solid fa-pen-to-square me-1"></i> Select Image
                            </button>
                            <button type="button" class="btn btn-sm btn-danger" @click.prevent="removeImage('${field.id}')" x-show="settings.${field.id}" x-cloak>
                                <i class="fa-solid fa-trash-can me-1"></i> Remove
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
};