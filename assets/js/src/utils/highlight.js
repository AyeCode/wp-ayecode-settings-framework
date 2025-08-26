export function highlightField(ctx, fieldId) {
    ctx.$nextTick(() => {
        const el = document.getElementById(fieldId);
        if (!el) return;
        const container = el.closest('.row, .py-4, .border-bottom');
        if (!container) return;
        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
        container.classList.add('highlight-setting');
        setTimeout(() => container.classList.remove('highlight-setting'), 3500);
    });
}
