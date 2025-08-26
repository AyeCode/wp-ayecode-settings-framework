export function showNotification(ctx, message, type = 'info') {
    if (window.wp?.data?.dispatch('core/notices')) {
        window.wp.data.dispatch('core/notices').createNotice(type === 'error' ? 'error' : 'success', message, { type: 'snackbar', isDismissible: true });
    } else {
        window.aui_toast?.('asf-settings-framework-' + type, type, message);
    }
}
