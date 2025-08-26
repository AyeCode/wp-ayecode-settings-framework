// Search modal + grouped results + navigation (unchanged)
export function setupSearchModal(ctx) {
    ctx.searchModalEl = document.getElementById('asf-search-modal');
    if (ctx.searchModalEl) {
        ctx.searchModal = new bootstrap.Modal(ctx.searchModalEl);
        ctx.searchModalEl.addEventListener('shown.bs.modal', () => document.getElementById('asf-search-input')?.focus());
        ctx.searchModalEl.addEventListener('hidden.bs.modal', () => ctx.searchQuery = '');
    }
}

export function groupedSearchResults(ctx) {
    if (!ctx.searchQuery.trim()) return [];
    const q = ctx.searchQuery.toLowerCase().trim();
    const fieldItems = ctx.allFields.filter(i => i.type === 'field');
    const filtered = fieldItems.filter(item => {
        const f = item.field;
        const text = [f.label, f.description, item.sectionName, item.subsectionName, ...(f.keywords || [])].join(' ').toLowerCase();
        return text.includes(q);
    });
    const grouped = filtered.reduce((acc, r) => {
        const key = r.subsectionName || r.sectionName;
        const title = r.subsectionName ? `${r.sectionName} &raquo; ${r.subsectionName}` : r.sectionName;
        if (!acc[key]) acc[key] = { groupTitle: title, sectionIcon: r.sectionIcon, results: [], sectionId: r.sectionId, subsectionId: r.subsectionId };
        acc[key].results.push(r);
        return acc;
    }, {});
    const links = (ctx.customSearchLinks || []).filter(l => {
        const text = [l.title, l.description, ...(l.keywords || [])].join(' ').toLowerCase();
        return text.includes(q);
    });
    if (links.length) {
        grouped['helpful_links'] = { groupTitle: 'Helpful Links', sectionIcon: 'fas fa-fw fa-external-link-alt', results: links, isCustomGroup: true };
    }
    return Object.values(grouped);
}

export function goToSearchResult(ctx, result) {
    ctx.changeView(() => {
        ctx.currentSection = result.sectionId;
        ctx.currentSubsection = result.subsectionId || '';
        ctx.searchModal.hide();
        ctx.updateUrlHash(result.field.id);
        ctx.$nextTick(() => ctx.highlightField(result.field.id));
    });
}

export function goToCustomLink(ctx, link) {
    ctx.searchModal?.hide?.();
    if (link.external) window.open(link.url, '_blank'); else window.location.href = link.url;
}
