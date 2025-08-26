import { registerRenderer } from '../index';

registerRenderer('custom_renderer', (field) => {
    if (!field.renderer_function || typeof field.renderer_function !== 'string') {
        return `<div class="alert alert-danger">Error: 'custom_renderer' field type requires a 'renderer_function' property specifying the function name.</div>`;
    }
    if (typeof window[field.renderer_function] !== 'function') {
        return `<div class="alert alert-danger">Error: The specified renderer function '${field.renderer_function}' was not found or is not a function.</div>`;
    }
    return window[field.renderer_function](field);
});
