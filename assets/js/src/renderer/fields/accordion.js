import { registerRenderer } from '../index';

/**
 * Renders a Bootstrap 5 accordion with Alpine.js state management.
 * This approach prevents unwanted closing when interacting with complex fields like Choices.js.
 *
 * How to use in PHP config:
 * [
 * 'id'    => 'my_accordion_group',
 * 'type'  => 'accordion',
 * 'default_open' => 'advanced_settings', // Use the 'id' of the panel you want open.
 * 'fields' => [
 * [
 * 'id' => 'general_settings', // Panel's unique ID.
 * 'label' => 'General Settings',
 * 'fields' => [
 * [ 'id' => 'setting_a', 'type' => 'text', 'label' => 'Setting A' ],
 * ]
 * ],
 * [
 * 'id' => 'advanced_settings', // Panel's unique ID.
 * 'label' => 'Advanced Settings',
 * 'fields' => [
 * [ 'id' => 'setting_c', 'type' => 'text', 'label' => 'Setting C' ],
 * ]
 * ]
 * ]
 * ]
 */
registerRenderer('accordion', (field) => {
    if (!field.fields || !Array.isArray(field.fields)) {
        return '<div class="alert alert-warning">Accordion field requires a "fields" array.</div>';
    }

    const parentId = `accordion-${field.id}`;
    // This Alpine component manages which panel is open and prevents closing when Choices.js is active.
    let accordionHtml = `<div class="accordion" id="${parentId}" x-data="{ isChoicesOpen: false }">`;

    field.fields.forEach((panel) => {
        if (!panel.id || !panel.fields || !Array.isArray(panel.fields)) return;

        const panelId = panel.id;
        const headingId = `heading-${panelId}`;
        const collapseId = `collapse-${panelId}`;
        const isInitiallyOpen = (field.default_open === panelId);

        accordionHtml += `
        <div class="accordion-item">
            <h2 class="accordion-header" id="${headingId}">
                <button
                    class="accordion-button ${!isInitiallyOpen ? 'collapsed' : ''}"
                    type="button"
                    :data-bs-toggle="isChoicesOpen ? '' : 'collapse'"
                    data-bs-target="#${collapseId}"
                    aria-expanded="${isInitiallyOpen}"
                    aria-controls="${collapseId}"
                >
                    ${panel.label || `Panel`}
                </button>
            </h2>
            <div
                id="${collapseId}"
                class="accordion-collapse collapse ${isInitiallyOpen ? 'show' : ''}"
                aria-labelledby="${headingId}"
                data-bs-parent="#${parentId}"
            >
                <div class="accordion-body" @mousedown.stop @click.stop @keydown.stop>
        `;

        panel.fields.forEach(f => {
            const safeJson = JSON.stringify(f).replace(/"/g, '&quot;');
            accordionHtml += `
                <div class="py-4" x-show="shouldShowField(${safeJson})" x-transition x-cloak>
                    ${window.asfFieldRenderer.renderField(f)}
                </div>
            `;
        });

        accordionHtml += `
                </div>
            </div>
        </div>`;
    });

    accordionHtml += '</div>';
    return accordionHtml;
});
