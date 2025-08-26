// Hash routing + current page getters (unchanged)
export function currentSectionData(ctx) {
    return ctx.sections.find(s => s.id === ctx.currentSection);
}
export function currentSubsectionData(ctx) {
    const sec = currentSectionData(ctx);
    if (!sec?.subsections) return null;
    return sec.subsections.find(ss => ss.id === ctx.currentSubsection);
}
export function activePageConfig(ctx) {
    return currentSubsectionData(ctx) || currentSectionData(ctx) || null;
}
export function setInitialSection(ctx) {
    if (ctx.sections.length > 0) {
        ctx.currentSection = ctx.sections[0].id;
        const sec = currentSectionData(ctx);
        if (sec?.subsections?.length > 0) ctx.currentSubsection = sec.subsections[0].id;
        if (sec?.type === 'custom_page' && sec.ajax_content) ctx.loadCustomPageContent(ctx.currentSection);
    }
    updateUrlHash(ctx);
}
export function handleUrlHash(ctx) {
    const hash = window.location.hash.substring(1);
    if (!hash) { setInitialSection(ctx); return; }
    const params = new URLSearchParams(hash);
    const sectionId = params.get('section');
    const subsectionId = params.get('subsection');
    const fieldId = params.get('field');

    const sec = ctx.sections.find(s => s.id === sectionId);
    if (sec) {
        ctx.currentSection = sectionId;
        if (sec?.type === 'custom_page' && sec.ajax_content) ctx.loadCustomPageContent(sectionId);
        if (subsectionId && sec.subsections?.some(ss => ss.id === subsectionId)) {
            ctx.currentSubsection = subsectionId;
        } else {
            ctx.currentSubsection = sec.subsections?.length ? sec.subsections[0].id : '';
        }
    } else {
        setInitialSection(ctx);
    }
    if (fieldId) ctx.highlightField(fieldId);
}
export function updateUrlHash(ctx, fieldId = null) {
    const p = new URLSearchParams();
    if (ctx.currentSection) p.set('section', ctx.currentSection);
    if (ctx.currentSubsection) p.set('subsection', ctx.currentSubsection);
    if (fieldId) p.set('field', fieldId);
    const h = p.toString();
    history.replaceState(null, '', h ? `#${h}` : window.location.pathname + window.location.search);
}
export function goToSection(ctx, sectionId, subsectionId = '') {
    ctx.changeView(() => {
        ctx.currentSection = sectionId;
        const sec = ctx.sections.find(s => s.id === sectionId);
        ctx.currentSubsection = subsectionId || (sec?.subsections?.length ? sec.subsections[0].id : '');
        ctx.searchModal?.hide?.();
        updateUrlHash(ctx);
        if (sec?.type === 'custom_page' && sec.ajax_content) ctx.loadCustomPageContent(sectionId);
    });
}
export function switchSection(ctx, sectionId) {
    ctx.changeView(() => {
        ctx.currentSection = sectionId;
        ctx.sidebarOpen = false;
        const sec = ctx.sections.find(s => s.id === sectionId);
        ctx.currentSubsection = sec?.subsections?.length ? sec.subsections[0].id : '';
        updateUrlHash(ctx);
        if (sec?.type === 'custom_page' && sec.ajax_content) ctx.loadCustomPageContent(sectionId);
    });
}
export function switchSubsection(ctx, subsectionId) {
    if (ctx.currentSubsection === subsectionId) return;
    ctx.changeView(() => {
        ctx.currentSubsection = subsectionId;
        updateUrlHash(ctx);
    });
}
