/**
 * System Status Utilities
 *
 * Contains functions related to the System Status page, like copying the report.
 */

/**
 * Generates the plain text report from the status data object.
 * @param {object} sections - The parsed statusSections object from embedded JSON.
 * @returns {string} - The formatted plain text report.
 */
function generateReportText(sections) {
    let report = '';
    for (const sectionKey in sections) {
        if (!sections.hasOwnProperty(sectionKey)) continue;
        const section = sections[sectionKey];
        report += `### ${section.title} ###\n\n`;

        // Prioritize debug_data if it exists and is an object/array
        const dataToUse = (typeof section.debug_data === 'object' && section.debug_data !== null) || Array.isArray(section.debug_data)
            ? section.debug_data
            : section.data; // Fallback to display data if debug_data is missing/invalid

        // Special handling for known array/object types in debug_data for better text formatting
        if (sectionKey === 'active_plugins' && Array.isArray(dataToUse)) {
            let pluginLines = dataToUse.map(item => {
                if (typeof item === 'object' && item !== null && item.plugin) {
                    let line = `${item.name || 'N/A'} (Version: ${item.version || 'N/A'}`;
                    if (item.author_name) line += `, Author: ${item.author_name}`;
                    if (item.network_activated) line += `, Network Activated`;
                    line += ')';
                    return line;
                } return String(item);
            }).join('\n\t');
            report += `Plugins: ${pluginLines ? `\n\t${pluginLines}` : 'None'}\n`;

        } else if (sectionKey === 'theme' && typeof dataToUse === 'object' && dataToUse !== null) {
            // Add theme details individually
            for (const key in dataToUse) {
                if (key !== 'overrides' && dataToUse.hasOwnProperty(key)) { // Exclude overrides initially
                    let value = dataToUse[key];
                    if (typeof value === 'boolean') value = value ? 'Yes' : 'No';
                    // Skip raw URLs if a formatted name exists for text report
                    if (key === 'author_url' && dataToUse.author_name) continue;
                    if (key === 'parent_author_url' && dataToUse.parent_author_name) continue;
                    report += `${formatKeyForReport(key)}: ${String(value).replace(/<[^>]+>/g, '').trim()}\n`;
                }
            }
            // Format overrides separately if they exist
            if (Array.isArray(dataToUse.overrides)) {
                const overrides = dataToUse.overrides.map(item => {
                    if (typeof item === 'object' && item !== null && item.file) {
                        return `${item.file} (Theme Version: ${item.version || '-'}, Core Version: ${item.core_version || '-'})`;
                    } return String(item);
                }).join('\n\t');
                report += `Template Overrides: ${overrides ? `\n\t${overrides}` : 'None'}\n`;
            }

        } else if (sectionKey === 'database' && typeof dataToUse === 'object' && dataToUse !== null) {
            // Add other database details individually
            for (const key in dataToUse) {
                if (key !== 'database_tables' && dataToUse.hasOwnProperty(key)) { // Exclude raw tables object
                    let value = dataToUse[key];
                    if (key === 'database_size' && typeof value === 'object' && value !== null) {
                        value = `Data: ${value.data || 0}MB, Index: ${value.index || 0}MB`;
                    }
                    report += `${formatKeyForReport(key)}: ${String(value).replace(/<[^>]+>/g, '').trim()}\n`;
                }
            }
            // Format database tables separately if they exist
            if (typeof dataToUse.database_tables === 'object' && dataToUse.database_tables !== null) {
                const processTables = (label, tables) => {
                    let text = '';
                    if (tables && Object.keys(tables).length > 0) {
                        text += `\n\t${label}:\n`;
                        for(const tName in tables) {
                            const tData = tables[tName];
                            text += `\t\t${tName}: ${ (typeof tData === 'object' && tData !== null) ? `Data: ${tData.data || 0}MB, Index: ${tData.index || 0}MB` : 'Missing/Error' }\n`;
                        }
                    }
                    return text;
                }
                let tablesText = processTables('Framework Tables', dataToUse.database_tables.framework);
                tablesText += processTables('Other Tables', dataToUse.database_tables.other);
                if (tablesText) report += `Database Tables: ${tablesText}\n`;
            }

        } else if (sectionKey === 'post_types' && Array.isArray(dataToUse)) {
            let counts = dataToUse.map(item => `${item.type}: ${item.count}`).join('\n\t');
            report += `Counts: ${counts ? `\n\t${counts}` : 'None'}\n`;

        } else if (typeof dataToUse === 'object' && dataToUse !== null) {
            // Generic object/array handling for sections added via filters
            for (const key in dataToUse) {
                if (!dataToUse.hasOwnProperty(key) || key.startsWith('---')) continue;
                let value = dataToUse[key];
                if (typeof value === 'boolean') value = value ? 'Yes' : 'No';
                else if (Array.isArray(value)) value = value.join(', ');
                else if (typeof value === 'object' && value !== null) value = JSON.stringify(value); // Basic stringify

                report += `${formatKeyForReport(key)}: ${String(value).replace(/<[^>]+>/g, '').trim()}\n`;
            }
        } else {
            // Handle cases where dataToUse might be a simple string or number
            report += `Data: ${String(dataToUse).replace(/<[^>]+>/g, '').trim()}\n`;
        }
        report += '\n'; // Add space between sections
    }
    // Add User Agent at the end
    report += "### User Agent ###\n\n";
    report += `User Agent: ${navigator.userAgent}\n`;

    return report.trim();
}

/**
 * Formats object keys for the plain text report.
 * @param {string} key
 * @returns {string}
 */
function formatKeyForReport(key) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Simple snake_case to Title Case
}


/**
 * Fallback copy method using execCommand.
 * @param {HTMLElement} buttonElement - The button clicked.
 * @param {HTMLTextAreaElement} reportTextArea - The textarea with the report text.
 */
function fallbackCopy(buttonElement, reportTextArea) {
    // Temporarily make textarea visible and selectable for execCommand
    reportTextArea.classList.remove('visually-hidden');
    reportTextArea.style.position = 'fixed';
    reportTextArea.style.opacity = '0';
    reportTextArea.style.pointerEvents = 'none';
    reportTextArea.select();
    reportTextArea.setSelectionRange(0, 99999); // For mobile

    let success = false;
    try {
        success = document.execCommand('copy');
    } catch (err) {
        console.error('ASF Status Report: fallback execCommand copy failed', err);
    }

    // Restore textarea state and deselect
    reportTextArea.classList.add('visually-hidden');
    reportTextArea.style.position = '';
    reportTextArea.style.opacity = '';
    reportTextArea.style.pointerEvents = '';
    if (window.getSelection) { // Modern browsers
        window.getSelection().removeAllRanges();
    } else if (document.selection) { // IE <= 8
        document.selection.empty();
    }


    // --- Provide Feedback ---
    const originalText = buttonElement.innerHTML;
    const originalClasses = buttonElement.className;
    if (success) {
        buttonElement.innerHTML = '<i class="fa-solid fa-check me-2"></i> Copied!';
        buttonElement.className = 'btn btn-success btn-sm';
    } else {
        buttonElement.innerHTML = '<i class="fa-solid fa-xmark me-2"></i> Failed!';
        buttonElement.className = 'btn btn-danger btn-sm';
        // Optionally, alert the user for manual copy
        alert('Automatic copy failed. Please manually select and copy the text from the status report area.');
    }
    // Reset button after delay
    setTimeout(() => {
        buttonElement.innerHTML = originalText;
        buttonElement.className = originalClasses;
    }, 2500);
}

/**
 * Main function to handle copying the System Status report.
 * Exposed globally as window.asfCopyStatusReport.
 * @param {HTMLElement} buttonElement - The button element that was clicked.
 */
export function copySystemStatusReport(buttonElement) {
    const dataElement = document.getElementById('asf-status-report-data');
    const reportTextArea = document.getElementById('asf-status-report-textarea');

    if (!dataElement || !reportTextArea) {
        console.error("ASF Status Report: Missing data or textarea element.");
        alert("Copy failed: Could not find necessary elements.");
        return;
    }

    let statusSections;
    try {
        statusSections = JSON.parse(dataElement.textContent || '{}');
    } catch (e) {
        console.error("ASF Status Report: Failed to parse status data.", e);
        alert("Copy failed: Could not read status data.");
        return;
    }

    const reportText = generateReportText(statusSections);
    reportTextArea.value = reportText;

    // Use Clipboard API if available
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(reportText).then(() => {
            // Success feedback
            const originalText = buttonElement.innerHTML;
            const originalClasses = buttonElement.className;
            buttonElement.innerHTML = '<i class="fa-solid fa-check me-2"></i> Copied!';
            buttonElement.className = 'btn btn-success btn-sm';
            setTimeout(() => {
                buttonElement.innerHTML = originalText;
                buttonElement.className = originalClasses;
            }, 2500);
        }).catch(err => {
            console.warn('ASF Status Report: Clipboard API copy failed, attempting fallback.', err);
            fallbackCopy(buttonElement, reportTextArea); // Use fallback on API error
        });
    } else {
        // Fallback for older browsers or insecure contexts
        console.warn('ASF Status Report: Using fallback copy method.');
        fallbackCopy(buttonElement, reportTextArea);
    }
}