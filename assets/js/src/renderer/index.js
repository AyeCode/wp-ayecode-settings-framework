// assets/js/src/renderer/index.js
// Small renderer dispatcher with safe fallback. Exposes window.asfFieldRenderer.

const registry = new Map();

// capture any pre-existing global BEFORE we overwrite it
let legacyGlobal = (typeof window !== 'undefined') ? window.asfFieldRenderer : undefined;

export function registerRenderer(type, fn) { registry.set(type, fn); }

export function renderField(field, modelPrefix = 'settings') {
    if (!field || !field.type) {
        return '<div class="alert alert-warning">Invalid field configuration</div>';
    }
    const fn = registry.get(field.type);
    if (typeof fn === 'function') {
        try { return fn(field, modelPrefix); }
        catch (e) { console.error(`Renderer for type "${field.type}" threw:`, e); return `<div class="alert alert-danger">Error rendering field type: ${field.type}</div>`; }
    }
    // fallback to legacy (captured) global, not to ourselves
    const legacy = window.__asfFieldRendererLegacy || legacyGlobal;
    if (legacy && typeof legacy.renderField === 'function') return legacy.renderField(field, modelPrefix);
    return `<div class="alert alert-info">Unsupported field type: ${field.type}</div>`;
}

const legacyName = (type) => 'render' + type.charAt(0).toUpperCase() + type.slice(1) + 'Field';

function callNamed(type, field, modelPrefix = 'settings') {
    const fn = registry.get(type);
    if (typeof fn === 'function') {
        try { return fn(field, modelPrefix); } catch (e) { console.error(`Renderer "${type}" error:`, e); }
    }
    const legacy = window.__asfFieldRendererLegacy || legacyGlobal;
    if (legacy && typeof legacy[legacyName(type)] === 'function') return legacy[legacyName(type)](field, modelPrefix);
    if (legacy && typeof legacy.renderField === 'function') return legacy.renderField(field, modelPrefix);
    return `<div class="alert alert-info">Unsupported field type: ${type}</div>`;
}

// named exports (unchanged API)
export const renderTextField = (f, m)=>callNamed('text', f, m);
export const renderEmailField = (f, m)=>callNamed('email', f, m);
export const renderUrlField = (f, m)=>callNamed('url', f, m);
export const renderAlertField = (f, m)=>callNamed('alert', f, m);
export const renderPasswordField = (f, m)=>callNamed('password', f, m);
export const renderGoogleApiKeyField = (f, m)=>callNamed('google_api_key', f, m);
export const renderNumberField = (f, m)=>callNamed('number', f, m);
export const renderTextareaField = (f, m)=>callNamed('textarea', f, m);
export const renderToggleField = (f, m)=>callNamed('toggle', f, m);
export const renderSelectField = (f, m)=>callNamed('select', f, m);
export const renderColorField = (f, m)=>callNamed('color', f, m);
export const renderRangeField = (f, m)=>callNamed('range', f, m);
export const renderCheckboxField = (f, m)=>callNamed('checkbox', f, m);
export const renderRadioField = (f, m)=>callNamed('radio', f, m);
export const renderMultiselectField = (f, m)=>callNamed('multiselect', f, m);
export const renderCheckboxGroupField = (f, m)=>callNamed('checkbox_group', f, m);
export const renderGroupField = (f, m)=>callNamed('group', f, m);
export const renderImageField = (f, m)=>callNamed('image', f, m);
export const renderHiddenField = (f, m)=>callNamed('hidden', f, m);
export const renderFileField = (f, m)=>callNamed('file', f, m);
export const renderIconField = (f, m)=>callNamed('font-awesome', f, m);
export const renderGdMapField = (f, m)=>callNamed('gd_map', f, m);
export const renderHelperTagsField = (f, m)=>callNamed('helper_tags', f, m);
export const renderActionButtonField = (f, m)=>callNamed('action_button', f, m);
export const renderLinkButtonField = (f, m)=>callNamed('link_button', f, m);
export const renderCustomField = (f, m)=>callNamed('custom_renderer', f, m);

// expose global
(function exposeGlobal() {
    if (typeof window === 'undefined') return;
    if (legacyGlobal) window.__asfFieldRendererLegacy = legacyGlobal;
    window.asfFieldRenderer = {
        renderField,
        renderTextField,
        renderEmailField,
        renderUrlField,
        renderAlertField,
        renderPasswordField,
        renderGoogleApiKeyField,
        renderNumberField,
        renderTextareaField,
        renderToggleField,
        renderSelectField,
        renderColorField,
        renderRangeField,
        renderCheckboxField,
        renderRadioField,
        renderMultiselectField,
        renderCheckboxGroupField,
        renderGroupField,
        renderImageField,
        renderHiddenField,
        renderFileField,
        renderIconField,
        renderGdMapField,
        renderHelperTagsField,
        renderActionButtonField,
        renderLinkButtonField,
        renderCustomField,
        __registerRenderer: registerRenderer,
    };
})();
