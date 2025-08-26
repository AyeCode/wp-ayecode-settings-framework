export function findPageConfigById(pageId, sections) {
    for (const section of sections) {
        if (section.id === pageId) return section;
        if (section.subsections) {
            const found = findPageConfigById(pageId, section.subsections);
            if (found) return found;
        }
    }
    return null;
}
