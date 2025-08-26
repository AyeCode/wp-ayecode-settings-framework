export async function loadCustomPageContent(ctx, sectionId) {
    if (ctx.loadedContentCache[sectionId]) return;
    const section = ctx.sections.find(s => s.id === sectionId);
    if (!section?.ajax_content) return;

    ctx.isContentLoading = true;
    try {
        const res = await fetch(window.ayecodeSettingsFramework.ajax_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: window.ayecodeSettingsFramework.content_pane_ajax_action,
                nonce: window.ayecodeSettingsFramework.tool_nonce,
                content_action: section.ajax_content
            })
        });
        const data = await res.json();
        ctx.loadedContentCache[sectionId] = data.success ? data.data.html : `<div class="alert alert-danger">Error: ${data.data?.message || 'Could not load content.'}</div>`;
    } catch (e) {
        ctx.loadedContentCache[sectionId] = `<div class="alert alert-danger">Request failed while loading content.</div>`;
    } finally {
        ctx.isContentLoading = false;
    }
}
