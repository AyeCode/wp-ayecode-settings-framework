// assets/js/src/renderer/index.js
// Small renderer dispatcher with safe fallback. Exposes window.asfFieldRenderer.

const registry = new Map();

// capture any pre-existing global BEFORE we overwrite it
let legacyGlobal = (typeof window !== 'undefined') ? window.asfFieldRenderer : undefined;

export function registerRenderer(type, fn) { registry.set(type, fn); }

export function renderField(field) {
    if (!field || !field.type) {
        return '<div class="alert alert-warning">Invalid field configuration</div>';
    }
    const fn = registry.get(field.type);
    if (typeof fn === 'function') {
        try { return fn(field); }
        catch (e) { console.error(`Renderer for type "${field.type}" threw:`, e); return `<div class="alert alert-danger">Error rendering field type: ${field.type}</div>`; }
    }
    // fallback to legacy (captured) global, not to ourselves
    const legacy = window.__asfFieldRendererLegacy || legacyGlobal;
    if (legacy && typeof legacy.renderField === 'function') return legacy.renderField(field);
    return `<div class="alert alert-info">Unsupported field type: ${field.type}</div>`;
}

const legacyName = (type) => 'render' + type.charAt(0).toUpperCase() + type.slice(1) + 'Field';

function callNamed(type, field) {
    const fn = registry.get(type);
    if (typeof fn === 'function') {
        try { return fn(field); } catch (e) { console.error(`Renderer "${type}" error:`, e); }
    }
    const legacy = window.__asfFieldRendererLegacy || legacyGlobal;
    if (legacy && typeof legacy[legacyName(type)] === 'function') return legacy[legacyName(type)](field);
    if (legacy && typeof legacy.renderField === 'function') return legacy.renderField(field);
    return `<div class="alert alert-info">Unsupported field type: ${type}</div>`;
}

// named exports (unchanged API)
export const renderTextField = (f)=>callNamed('text', f);
export const renderEmailField = (f)=>callNamed('email', f);
export const renderUrlField = (f)=>callNamed('url', f);
export const renderAlertField = (f)=>callNamed('alert', f);
export const renderPasswordField = (f)=>callNamed('password', f);
export const renderGoogleApiKeyField = (f)=>callNamed('google_api_key', f);
export const renderNumberField = (f)=>callNamed('number', f);
export const renderTextareaField = (f)=>callNamed('textarea', f);
export const renderToggleField = (f)=>callNamed('toggle', f);
export const renderSelectField = (f)=>callNamed('select', f);
export const renderColorField = (f)=>callNamed('color', f);
export const renderRangeField = (f)=>callNamed('range', f);
export const renderCheckboxField = (f)=>callNamed('checkbox', f);
export const renderRadioField = (f)=>callNamed('radio', f);
export const renderMultiselectField = (f)=>callNamed('multiselect', f);
export const renderCheckboxGroupField = (f)=>callNamed('checkbox_group', f);
export const renderGroupField = (f)=>callNamed('group', f);
export const renderImageField = (f)=>callNamed('image', f);
export const renderHiddenField = (f)=>callNamed('hidden', f);
export const renderFileField = (f)=>callNamed('file', f);
export const renderIconField = (f)=>callNamed('font-awesome', f);
export const renderGdMapField = (f)=>callNamed('gd_map', f);
export const renderHelperTagsField = (f)=>callNamed('helper_tags', f);
export const renderActionButtonField = (f)=>callNamed('action_button', f);
export const renderLinkButtonField = (f)=>callNamed('link_button', f);
export const renderCustomField = (f)=>callNamed('custom_renderer', f);

// expose global, preserving legacy in __asfFieldRendererLegacy
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
