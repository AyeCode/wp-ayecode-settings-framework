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

    // Search all items (fields, sections, and subsections)
    const filtered = ctx.allFields.filter(item => {
        if (item.type === 'field') {
            const f = item.field;
            const text = [f.label, f.description, item.sectionName, item.subsectionName, ...(f.searchable || [])].join(' ').toLowerCase();
            return text.includes(q);
        } else if (item.type === 'section' || item.type === 'subsection') {
            const text = [item.name, ...(item.searchable || [])].join(' ').toLowerCase();
            return text.includes(q);
        }
        return false;
    });

    const grouped = filtered.reduce((acc, r) => {
        if (r.type === 'field') {
            const key = r.subsectionName || r.sectionName;
            const title = r.subsectionName ? `${r.sectionName} &raquo; ${r.subsectionName}` : r.sectionName;
            if (!acc[key]) acc[key] = { groupTitle: title, sectionIcon: r.sectionIcon, results: [], sectionId: r.sectionId, subsectionId: r.subsectionId };
            acc[key].results.push(r);
        } else if (r.type === 'section') {
            const key = r.name;
            if (!acc[key]) acc[key] = { groupTitle: r.name, sectionIcon: r.icon, results: [], sectionId: r.id, subsectionId: null };
            acc[key].results.push(r);
        } else if (r.type === 'subsection') {
            const key = `${r.sectionName} &raquo; ${r.name}`;
            if (!acc[key]) acc[key] = { groupTitle: key, sectionIcon: r.icon, results: [], sectionId: r.sectionId, subsectionId: r.id };
            acc[key].results.push(r);
        }
        return acc;
    }, {});

    const links = (ctx.customSearchLinks || []).filter(l => {
        const text = [l.title, l.description, ...(l.searchable || [])].join(' ').toLowerCase();
        return text.includes(q);
    });
    if (links.length) {
        grouped['helpful_links'] = { groupTitle: 'Helpful Links', sectionIcon: 'fas fa-fw fa-external-link-alt', results: links, isCustomGroup: true };
    }
    return Object.values(grouped);
}

export function goToSearchResult(ctx, result) {
    ctx.changeView(() => {
        if (result.type === 'field') {
            // Navigate to field and highlight it
            ctx.currentSection = result.sectionId;
            ctx.currentSubsection = result.subsectionId || '';
            ctx.searchModal.hide();
            ctx.updateUrlHash(result.field.id);
            ctx.$nextTick(() => ctx.highlightField(result.field.id));
        } else if (result.type === 'section') {
            // Navigate to section
            ctx.currentSection = result.id;
            ctx.currentSubsection = '';
            ctx.searchModal.hide();
            ctx.updateUrlHash();
        } else if (result.type === 'subsection') {
            // Navigate to subsection
            ctx.currentSection = result.sectionId;
            ctx.currentSubsection = result.id;
            ctx.searchModal.hide();
            ctx.updateUrlHash();
        }
    });
}

export function goToCustomLink(ctx, link) {
    ctx.searchModal?.hide?.();
    if (link.external) window.open(link.url, '_blank'); else window.location.href = link.url;
}
