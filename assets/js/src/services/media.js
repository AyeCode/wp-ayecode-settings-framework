export function selectImage(ctx, fieldId) {
    if (typeof window.wp === 'undefined' || typeof window.wp.media === 'undefined') { alert('WordPress media library not available.'); return; }
    const frame = window.wp.media({ title: 'Select or Upload an Image', button: { text: 'Use this image' }, multiple: false });
    frame.on('select', () => {
        const att = frame.state().get('selection').first().toJSON();
        ctx.settings[fieldId] = att.id;
        const preview = att.sizes?.thumbnail?.url || att.sizes?.medium?.url || att.url;
        ctx.imagePreviews[fieldId] = preview;
    });
    frame.open();
}
export function removeImage(ctx, fieldId) {
    ctx.settings[fieldId] = null;
    delete ctx.imagePreviews[fieldId];
}
