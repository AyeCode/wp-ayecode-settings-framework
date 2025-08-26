// Load sections + flatten fields (unchanged)
export function loadConfiguration(ctx) {
    if (ctx.config?.sections) ctx.sections = ctx.config.sections.map(s => ({ ...s }));
}
export function flattenAllFields(ctx) {
    ctx.allFields = [];
    const process = (fields, section, subsection = null) => {
        if (!Array.isArray(fields)) return;
        fields.forEach(field => {
            if (!field) return;
            if (field.type === 'group' && field.fields) {
                process(field.fields, section, subsection);
            } else if (field.id && field.searchable !== false) {
                ctx.allFields.push({
                    type: 'field',
                    field,
                    sectionId: section.id,
                    sectionName: section.name,
                    subsectionId: subsection ? subsection.id : null,
                    subsectionName: subsection ? subsection.name : null,
                    icon: section.icon
                });
            }
        });
    };
    ctx.sections.forEach(section => {
        ctx.allFields.push({ type: 'section', id: section.id, name: section.name, icon: section.icon, keywords: section.keywords || [] });
        process(section.fields, section);
        section.subsections?.forEach(sub => {
            ctx.allFields.push({ type: 'subsection', id: sub.id, name: sub.name, icon: section.icon, sectionId: section.id, sectionName: section.name, keywords: sub.keywords || [] });
            process(sub.fields, section, sub);
        });
    });
}
