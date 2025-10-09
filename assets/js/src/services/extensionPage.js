export async function loadExtensions(ctx, section) {
    if (!section || !section.api_config) return;

    ctx.isFetchingExtensions = true;
    ctx.extensions = [];
    try {
        const response = await fetch(window.ayecodeSettingsFramework.ajax_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: window.ayecodeSettingsFramework.tool_ajax_action,
                nonce: window.ayecodeSettingsFramework.tool_nonce,
                tool_action: 'get_extension_data',
                data: JSON.stringify(section.api_config)
            })
        });
        const data = await response.json();
        if (data.success) {
            ctx.extensions = data.data.items;
        } else {
            ctx.showNotification(data.data.message || 'Failed to fetch extensions.', 'error');
        }
    } catch (error) {
        ctx.showNotification('An error occurred while fetching extensions.', 'error');
    } finally {
        ctx.isFetchingExtensions = false;
    }
}