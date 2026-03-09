export function showNotification(ctx, message, type = 'info') {
    // Try aui_toast first (preferred method for notifications)
    if (typeof window.aui_toast === 'function') {
        window.aui_toast('asf-settings-framework-' + type, type, message);
    }
    // Fallback to aui_modal for critical errors
    else if (typeof window.aui_modal === 'function') {
        const title = type === 'error' ? 'Error' : (type === 'success' ? 'Success' : 'Notice');
        window.aui_modal(title, message, '', true, 'text-center', '', '');
    }
    // Last resort: native alert
    else {
        alert(message);
    }
}
