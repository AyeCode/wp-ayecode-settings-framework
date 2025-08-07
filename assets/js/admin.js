/**
 * AyeCode Settings Framework - Admin JavaScript
 *
 * Alpine.js application for the settings framework
 */

/**
 * Main Alpine.js Settings App
 */
function ayecodeSettingsApp() {
    return {
        // Configuration from PHP
        config: window.ayecodeSettingsFramework?.config || {},
        originalSettings: {},
        settings: {},
        strings: window.ayecodeSettingsFramework?.strings || {},
        imagePreviews: {},
        originalImagePreviews: {},

        // UI State
        currentSection: '',
        currentSubsection: '',
        searchQuery: '',
        isLoading: false,
        sidebarOpen: false,
        theme: 'light',
        isChangingView: false,

        // Search
        searchModalEl: null,
        searchModal: null,
        allFields: [],

        // Sections (processed from config)
        sections: [],

        // State for tools
        actionStates: {},
        isContentLoading: false,
        loadedContentCache: {},

        /**
         * Initialize the application
         */
        init() {
            console.log('AyeCode Settings Framework initialized');

            // --- Theme Initialization ---
            this.initTheme();

            // Load configuration and settings
            this.loadConfiguration();
            this.loadSettings();
            this.flattenAllFields();

            // pre-initialize action states
            this.allFields.forEach(item => {
                if (item.field.type === 'action_button') {
                    // Ensure every action button has a defined initial state.
                    this.actionStates[item.field.id] = { isLoading: false, message: '', progress: 0, success: null };
                }
            });

            // Set initial section based on URL or default
            this.handleUrlHash();

            // Setup event listeners and modal
            this.setupSearchModal();
            this.setupEventListeners();

            // Initial plugin load
            this.reinitializePlugins();
        },

        /**
         * Determines if a field should be visible based on its 'show_if' rule.
         * @param {object} field - The field configuration object.
         * @returns {boolean} True if the field should be shown, false otherwise.
         */
        shouldShowField(field) {
            if (!field.show_if) {
                return true; // Always show if no rule is defined.
            }
            try {
                return this.evaluateCondition(field.show_if);
            } catch (e) {
                console.error(`Error evaluating show_if condition for field "${field.id}":`, e);
                return true; // Default to showing the field if the rule is broken.
            }
        },

        /**
         * Safely evaluates a condition string without using eval().
         * @param {string} rule - The condition string, e.g., "[%uploads_enabled%] && [%max_uploads%] > 10".
         * @returns {boolean} The result of the evaluation.
         */
        evaluateCondition(rule) {
            // Replace [%field_id%] placeholders with their actual values.
            const populatedRule = rule.replace(/\[%(\w+)%\]/g, (match, fieldId) => {
                const value = this.settings[fieldId];
                if (typeof value === 'string') {
                    // Escape single quotes within the string and wrap the whole thing in single quotes.
                    return `'${value.replace(/'/g, "\\'")}'`;
                }
                if (typeof value === 'boolean' || typeof value === 'number') {
                    return value;
                }
                return 'null'; // Default for undefined or other types.
            });

            // Split the rule by || (OR) operators first.
            const orGroups = populatedRule.split('||');
            for (const orGroup of orGroups) {
                // Within each OR group, split by && (AND) operators.
                const andConditions = orGroup.split('&&');
                let isAndGroupTrue = true;
                for (const condition of andConditions) {
                    if (!this.evaluateSimpleComparison(condition.trim())) {
                        isAndGroupTrue = false;
                        break;
                    }
                }
                // If any OR group is true, the whole rule is true.
                if (isAndGroupTrue) {
                    return true;
                }
            }
            // If no OR groups were true, the whole rule is false.
            return false;
        },

        /**
         * Evaluates a simple comparison like "10 > 5" or "'a' == 'a'".
         * @param {string} expression - The simple expression string.
         * @returns {boolean} The result of the comparison.
         */
        evaluateSimpleComparison(expression) {
            // Handle simple truthy/falsy checks for single values (e.g., a toggle).
            if (!['==', '!=', '>', '<', '>=', '<='].some(op => expression.includes(op))) {
                // Attempt to parse the value.
                let value;
                try {
                    // This will handle 'true', 'false', numbers, and quoted strings.
                    value = JSON.parse(expression.toLowerCase());
                } catch (e) {
                    // If it fails, it's a non-quoted string, which is truthy if not empty.
                    value = expression.trim() !== '';
                }
                return !!value;
            }

            const match = expression.match(/^(.*?)\s*(==|!=|>|<|>=|<=)\s*(.*)$/);
            if (!match) {
                throw new Error(`Invalid comparison format: "${expression}"`);
            }

            let [, left, op, right] = match;

            // A simple function to parse values from the string.
            const parseValue = (val) => {
                val = val.trim();
                // Handle quoted strings
                if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
                    return val.slice(1, -1);
                }
                // Handle numbers
                if (!isNaN(val) && val !== '') {
                    return parseFloat(val);
                }
                // Handle booleans and null
                if (val === 'true') return true;
                if (val === 'false') return false;
                if (val === 'null') return null;
                return val; // Should not happen if substitution is correct, but as a fallback.
            };

            const leftVal = parseValue(left);
            const rightVal = parseValue(right);

            switch (op) {
                case '==': return leftVal == rightVal;
                case '!=': return leftVal != rightVal;
                case '>':  return leftVal > rightVal;
                case '<':  return leftVal < rightVal;
                case '>=': return leftVal >= rightVal;
                case '<=': return leftVal <= rightVal;
                default:   throw new Error(`Unsupported operator: "${op}"`);
            }
        },


        /**
         * Initializes a GeoDirectory map for a settings field.
         * Called via x-init from the field renderer.
         */
        initGdMap(fieldId, latField, lngField) {
            // Robustness check: ensure GD scripts are loaded before trying to use them.
            if (typeof window.GeoDirectoryMapManager === 'undefined' || typeof window.geodirMapData === 'undefined') {
                console.error(`Cannot initialize GD Map for '${fieldId}': GeoDirectory map scripts are not loaded on this page.`);
                const container = this.$refs[fieldId + '_map_canvas'];
                if (container) {
                    container.innerHTML = '<div class="alert alert-danger m-3">Error: GeoDirectory map scripts are not available.</div>';
                }
                return;
            }

            this.$nextTick(() => {
                const container = this.$refs[fieldId + '_map_canvas'];
                if (!container) {
                    console.error(`Map container not found for field '${fieldId}'.`);
                    return;
                }

                // Create a unique copy of the global map data for this specific instance
                const mapData = JSON.parse(JSON.stringify(window.geodirMapData));

                // Override lat/lng with values from our settings object
                mapData.lat = this.settings[latField] || mapData.default_lat;
                mapData.lng = this.settings[lngField] || mapData.default_lng;
                mapData.lat_lng_blank = !this.settings[latField] && !this.settings[lngField];

                // Give the map a unique prefix to avoid conflicts with other maps
                mapData.prefix = `${fieldId}_`;

                // Define the callback to update Alpine's state when the marker moves
                const callbacks = {
                    onMarkerUpdate: (coords) => {
                        // Using toFixed to avoid long decimal strings
                        this.settings[latField] = parseFloat(coords.lat).toFixed(6);
                        this.settings[lngField] = parseFloat(coords.lng).toFixed(6);
                    }
                };

                // Tell the manager to build the map!
                window.GeoDirectoryMapManager.initMap(container.id, mapData, callbacks);
            });
        },

        /**
         * Initializes and syncs a Choices.js instance for a SINGLE select field, if required.
         */
        initChoice(fieldId) {
            const el = this.$refs[fieldId];
            if (!el) {
                console.error(`Choices.js init failed: element with x-ref="${fieldId}" not found.`);
                return;
            }

            // ONLY proceed if the element has the required class.
            if (!el.classList.contains('aui-select2')) {
                return; // Do nothing, let x-model handle it.
            }

            // Call the factory function to get the custom configuration.
            const config = aui_get_choices_config(el);

            // Create the new Choices.js instance.
            const choicesInstance = new Choices(el, config);

            // Set the initial selected value from the settings data.
            choicesInstance.setChoiceByValue(String(this.settings[fieldId]));

            // Listen for changes FROM the Choices.js UI.
            el.addEventListener('change', () => {
                // For single select, getValue(true) returns a string.
                this.settings[fieldId] = choicesInstance.getValue(true);
            });

            // Watch for changes TO the Alpine settings data.
            this.$watch(`settings['${fieldId}']`, (newValue) => {
                const currentValue = choicesInstance.getValue(true);
                if (newValue !== currentValue) {
                    choicesInstance.setChoiceByValue(String(newValue));
                }
            });
        },

        /**
         * Initializes and syncs a Choices.js instance for a MULTI-select field.
         */
        initChoices(fieldId) {
            const el = this.$refs[fieldId];
            if (!el) {
                console.error(`Choices.js init failed: element with x-ref="${fieldId}" not found.`);
                return;
            }

            // Safety check: ensure the setting is an array before we begin.
            if (!Array.isArray(this.settings[fieldId])) {
                this.settings[fieldId] = [];
            }

            // Call your factory function to get the custom configuration.
            const config = aui_get_choices_config(el);

            // Create the new Choices.js instance with your custom config.
            const choicesInstance = new Choices(el, config);

            // Set the initial selected values from your settings data.
            choicesInstance.setChoiceByValue(this.settings[fieldId]);

            // Listen for changes FROM the Choices.js UI.
            el.addEventListener('change', () => {
                // When the user makes a change, update the Alpine settings data.
                this.settings[fieldId] = choicesInstance.getValue(true);
            });

            // Watch for changes TO the Alpine settings data (e.g., clicking "Discard").
            this.$watch(`settings['${fieldId}']`, (newValue) => {
                // To prevent infinite loops, only update the UI if it's out of sync.
                if (JSON.stringify(newValue) !== JSON.stringify(choicesInstance.getValue(true))) {
                    choicesInstance.setChoiceByValue(newValue);
                }
            });
        },

        /**
         * Initializes the light/dark mode theme
         */
        initTheme() {
            const savedTheme = localStorage.getItem('asf_theme');
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

            if (savedTheme) {
                this.theme = savedTheme;
            } else if (prefersDark) {
                this.theme = 'dark';
            } else {
                this.theme = 'light';
            }

            this.$watch('theme', (value) => {
                localStorage.setItem('asf_theme', value);
            });
        },

        /**
         * Toggles the theme between light and dark
         */
        toggleTheme() {
            this.theme = this.theme === 'light' ? 'dark' : 'light';
        },

        /**
         * Re-initializes third-party scripts like Choices.js on new elements.
         */
        reinitializePlugins() {
            this.$nextTick(() => {
                console.log('Re-initializing...');
                if (typeof aui_init === 'function') {
                    aui_init();
                }
            });
        },

        /**
         * Handles the visual transition when switching views.
         */
        changeView(updateFunction) {
            if (this.isChangingView) return;
            this.isChangingView = true;

            setTimeout(() => {
                updateFunction();
                this.$nextTick(() => {
                    this.isChangingView = false;
                    this.reinitializePlugins();
                });
            }, 150);
        },


        /**
         * Load configuration from PHP
         */
        loadConfiguration() {
            if (this.config.sections) {
                this.sections = this.config.sections.map((section) => ({
                    ...section,
                }));
            }
        },

        /**
         * Load settings from PHP
         */
        loadSettings() {
            this.settings = window.ayecodeSettingsFramework?.settings || {};
            this.originalSettings = JSON.parse(JSON.stringify(this.settings));
            this.imagePreviews = window.ayecodeSettingsFramework?.image_previews || {};
            this.originalImagePreviews = JSON.parse(JSON.stringify(this.imagePreviews));
        },

        /**
         * Create a flat array of all fields for easy searching
         */
        flattenAllFields() {
            this.allFields = [];
            this.sections.forEach(section => {
                if (section.fields) {
                    section.fields.forEach(field => {
                        this.allFields.push({ field, sectionId: section.id, sectionName: section.name, sectionIcon: section.icon, subsectionId: null, subsectionName: null });
                    });
                }
                if (section.subsections) {
                    section.subsections.forEach(subsection => {
                        if (subsection.fields) {
                            subsection.fields.forEach(field => {
                                this.allFields.push({ field, sectionId: section.id, sectionName: section.name, sectionIcon: section.icon, subsectionId: subsection.id, subsectionName: subsection.name });
                            });
                        }
                    });
                }
            });
        },

        /**
         * Set initial section and subsection
         */
        setInitialSection() {
            if (this.sections.length > 0) {
                this.currentSection = this.sections[0].id;
                const currentSectionObj = this.sections.find(s => s.id === this.currentSection);
                if (currentSectionObj?.subsections?.length > 0) {
                    this.currentSubsection = currentSectionObj.subsections[0].id;
                }
                // ✨ ADD THIS CHECK: If the default section is an AJAX page, load its content.
                if (currentSectionObj?.type === 'custom_page' && currentSectionObj.ajax_content) {
                    this.loadCustomPageContent(this.currentSection);
                }
            }
            this.updateUrlHash();
        },

        get isActionRunning() {
            // This checks if any value in the actionStates object has isLoading set to true.
            return Object.values(this.actionStates).some(state => state.isLoading);
        },

        /**
         * Setup event listeners for keyboard shortcuts etc.
         */
        setupEventListeners() {
            window.addEventListener('beforeunload', (e) => {
                // ✨ UPDATED CONDITION
                if (this.hasUnsavedChanges || this.isActionRunning) {
                    // This prevents the page from unloading immediately.
                    e.preventDefault();
                    // This is required to trigger the browser's confirmation dialog.
                    e.returnValue = 'A task is running or you have unsaved changes. Are you sure you want to leave?';
                }
            });

            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    this.searchModal.show();
                }
            });

            window.addEventListener('hashchange', () => this.handleUrlHash());
        },

        /**
         * Setup search modal
         */
        setupSearchModal() {
            this.searchModalEl = document.getElementById('asf-search-modal');
            if (this.searchModalEl) {
                this.searchModal = new bootstrap.Modal(this.searchModalEl);
                this.searchModalEl.addEventListener('shown.bs.modal', () => document.getElementById('asf-search-input')?.focus());
                this.searchModalEl.addEventListener('hidden.bs.modal', () => this.searchQuery = '');
            }
        },

        /**
         * Computed properties for current section and subsection data
         */
        get hasUnsavedChanges() {
            return JSON.stringify(this.settings) !== JSON.stringify(this.originalSettings);
        },
        get currentSectionData() {
            return this.sections.find(s => s.id === this.currentSection);
        },
        get currentSubsectionData() {
            if (!this.currentSectionData || !this.currentSectionData.subsections) return null;
            return this.currentSectionData.subsections.find(ss => ss.id === this.currentSubsection);
        },
        get isCustomPageActive() {
            if (!this.currentSectionData) return false;
            return this.currentSectionData.type === 'custom_page';
        },
        get isSettingsPage() {
            if (!this.currentSectionData) {
                return false;
            }

            // Custom pages are not settings pages.
            if (this.currentSectionData.type === 'custom_page') {
                return false;
            }

            // Determine which set of fields to inspect based on the current view.
            const fieldsToCheck = this.currentSubsectionData?.fields || this.currentSectionData?.fields;

            // If there are no fields, it's not a settings page.
            if (!fieldsToCheck || fieldsToCheck.length === 0) {
                return false;
            }

            // It's a settings page if it has at least one field that is not an action button.
            // This could be expanded to other non-data field types like 'alert'.
            return fieldsToCheck.some(field => field.type !== 'action_button');
        },

        /**
         * Computed: Grouped search results for display
         */
        get groupedSearchResults() {
            if (!this.searchQuery.trim()) return [];
            const query = this.searchQuery.toLowerCase().trim();
            const filtered = this.allFields.filter(item =>
                item.field.label?.toLowerCase().includes(query) ||
                item.field.description?.toLowerCase().includes(query) ||
                item.field.id?.toLowerCase().includes(query)
            );

            if (filtered.length === 0) return [];

            const grouped = filtered.reduce((acc, result) => {
                const groupIdentifier = result.subsectionName || result.sectionName;
                const groupTitle = result.subsectionName ? `${result.sectionName} &raquo; ${result.subsectionName}` : result.sectionName;
                if (!acc[groupIdentifier]) {
                    acc[groupIdentifier] = { groupTitle, sectionIcon: result.sectionIcon, results: [] };
                }
                acc[groupIdentifier].results.push(result);
                return acc;
            }, {});

            return Object.values(grouped);
        },


        /**
         * Navigate to a setting from search results
         */
        goToSearchResult(result) {
            this.changeView(() => {
                this.currentSection = result.sectionId;
                this.currentSubsection = result.subsectionId || '';
                this.searchModal.hide();
                this.updateUrlHash(result.field.id);
                this.$nextTick(() => this.highlightField(result.field.id));
            });
        },

        /**
         * Switch sections and subsections
         */
        switchSection(sectionId) {
            this.changeView(() => {
                this.currentSection = sectionId;
                this.sidebarOpen = false;
                const section = this.sections.find(s => s.id === sectionId);
                this.currentSubsection = section?.subsections?.length > 0 ? section.subsections[0].id : '';
                this.updateUrlHash();
                if (section?.type === 'custom_page' && section.ajax_content) {
                    this.loadCustomPageContent(sectionId);
                }
            });
        },
        switchSubsection(subsectionId) {
            if (this.currentSubsection === subsectionId) return;
            this.changeView(() => {
                this.currentSubsection = subsectionId;
                this.updateUrlHash();
            });
        },

        /**
         * Highlight a specific field by its ID
         */
        highlightField(fieldId) {
            this.$nextTick(() => {
                const fieldElement = document.getElementById(fieldId);
                if (fieldElement) {
                    const container = fieldElement.closest('.row, .py-4, .border-bottom');
                    if (container) {
                        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        container.classList.add('highlight-setting');
                        setTimeout(() => container.classList.remove('highlight-setting'), 3500);
                    }
                }
            });
        },

        /**
         * Handle URL hash for navigation
         */
        handleUrlHash() {
            const hash = window.location.hash.substring(1);
            if (!hash) {
                this.setInitialSection(); // This function now handles its own content loading
                return;
            }
            const params = new URLSearchParams(hash);
            const sectionId = params.get('section');
            const subsectionId = params.get('subsection');
            const fieldId = params.get('field');

            if (sectionId && this.sections.some(s => s.id === sectionId)) {
                this.currentSection = sectionId;
                const section = this.sections.find(s => s.id === sectionId);

                // ✨ ADD THIS CHECK: If the section from the URL is an AJAX page, load its content.
                if (section?.type === 'custom_page' && section.ajax_content) {
                    this.loadCustomPageContent(sectionId);
                }

                if (subsectionId && section.subsections?.some(ss => ss.id === subsectionId)) {
                    this.currentSubsection = subsectionId;
                } else {
                    this.currentSubsection = section.subsections?.length > 0 ? section.subsections[0].id : '';
                }
            } else {
                this.setInitialSection(); // Also handles the case of an invalid hash
            }
            if (fieldId) this.highlightField(fieldId);
        },

        updateUrlHash(fieldId = null) {
            const params = new URLSearchParams();
            if (this.currentSection) params.set('section', this.currentSection);
            if (this.currentSubsection) params.set('subsection', this.currentSubsection);
            if (fieldId) params.set('field', fieldId);
            const newHash = params.toString();
            history.replaceState(null, '', newHash ? `#${newHash}` : window.location.pathname + window.location.search);
        },


        /**
         * Save settings via AJAX
         */
        async saveSettings() {
            this.isLoading = true;
            try {
                const response = await fetch(window.ayecodeSettingsFramework.ajax_url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        action: window.ayecodeSettingsFramework.action,
                        nonce: window.ayecodeSettingsFramework.nonce,
                        settings: JSON.stringify(this.settings)
                    })
                });
                const data = await response.json();
                if (data.success) {
                    this.originalSettings = JSON.parse(JSON.stringify(this.settings));
                    this.originalImagePreviews = JSON.parse(JSON.stringify(this.imagePreviews));
                    this.showNotification(data.data.message || this.strings.saved, 'success');
                } else {
                    this.showNotification(data.data.message || this.strings.error, 'error');
                }
            } catch (error) {
                console.error('Save error:', error);
                this.showNotification(this.strings.error, 'error');
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * Discard changes and restore original settings
         */
        discardChanges() {
            if (confirm(this.strings.confirm_discard)) {
                this.settings = JSON.parse(JSON.stringify(this.originalSettings));
                this.imagePreviews = JSON.parse(JSON.stringify(this.originalImagePreviews));
            }
        },

        /**
         * Renders a field by calling the global field renderer.
         */
        renderField(field) {
            if (window.asfFieldRenderer) {
                const funcName = 'render' + field.type.charAt(0).toUpperCase() + field.type.slice(1) + 'Field';
                if(typeof window.asfFieldRenderer[funcName] === 'function') {
                    return window.asfFieldRenderer[funcName](field);
                }
                if(typeof window.asfFieldRenderer.renderField === 'function') {
                    return window.asfFieldRenderer.renderField(field);
                }
            }
            return `<div class="alert alert-warning">Field renderer for type "${field.type}" not found.</div>`;
        },

        /**
         * Opens the WordPress Media Library to select an image.
         */
        selectImage(fieldId) {
            if (typeof wp === 'undefined' || typeof wp.media === 'undefined') {
                alert('WordPress media library not available.');
                return;
            }
            const frame = wp.media({
                title: 'Select or Upload an Image',
                button: { text: 'Use this image' },
                multiple: false
            });
            frame.on('select', () => {
                const attachment = frame.state().get('selection').first().toJSON();
                this.settings[fieldId] = attachment.id;
                const previewUrl = attachment.sizes.thumbnail?.url || attachment.sizes.medium?.url || attachment.url;
                this.imagePreviews[fieldId] = previewUrl;
            });
            frame.open();
        },

        /**
         * Removes a selected image.
         */
        removeImage(fieldId) {
            this.settings[fieldId] = null;
            delete this.imagePreviews[fieldId];
        },

        /**
         * Executes an AJAX action, dynamically finding and sending data from inputs in its container,
         * with support for polling/chained requests.
         */
        async executeAction(fieldId) {
            // Find the configuration for the action button that was clicked
            const field = this.allFields.find(f => f.field.id === fieldId)?.field;
            if (!field || !field.ajax_action) {
                console.error('Action button configuration not found for:', fieldId);
                return;
            }

            // Set the initial loading state for the UI
            this.actionStates[fieldId] = { isLoading: true, message: 'Starting...', progress: 0, success: null };

            // --- Dynamically gather data from form inputs ---
            const inputData = {};
            const container = this.$refs['action_container_' + fieldId];

            if (container) {
                // Find all supported form elements within this specific action's container
                const inputs = container.querySelectorAll('input, select, textarea');

                inputs.forEach(input => {
                    // Use the input's `name` attribute as the key for the data
                    if (input.name) {
                        if (input.type === 'checkbox') {
                            inputData[input.name] = input.checked;
                        } else {
                            inputData[input.name] = input.value;
                        }
                    }
                });
            }else{

            }

            // --- Define the recursive polling function ---
            const poll = async (currentStep) => {
                try {
                    // Prepare all data for the AJAX request
                    const requestBody = {
                        action: 'ayecode_settings_framework_execute_action',
                        nonce: window.ayecodeSettingsFramework.tool_nonce,
                        tool_action: field.ajax_action,
                        step: currentStep,
                        input_data: JSON.stringify(inputData)
                    };

                    const response = await fetch(window.ayecodeSettingsFramework.ajax_url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams(requestBody)
                    });

                    // Handle non-successful HTTP responses (e.g., 500 server error)
                    if (!response.ok) {
                        throw new Error(`Server responded with an error: ${response.status}`);
                    }

                    // Handle non-JSON responses (e.g., PHP fatal error outputting HTML)
                    const data = await response.json();

                    // Update the UI with the latest progress from the server
                    this.actionStates[fieldId].success = data.success;
                    if (data.data?.message) this.actionStates[fieldId].message = data.data.message;
                    if (data.data?.progress) this.actionStates[fieldId].progress = data.data.progress;

                    // Check if the server provided a "next_step" to continue the chain
                    if (data.success && data.data?.next_step !== null && data.data?.progress < 100) {
                        // Call myself again with the next step value after a short delay
                        setTimeout(() => poll(data.data.next_step), 20);
                    } else {
                        // The chain is complete (or has failed), so stop the loading spinner
                        this.actionStates[fieldId].isLoading = false;
                        // Reset the UI after 5 seconds to clear the final message
                        setTimeout(() => {
                            if (this.actionStates[fieldId]) {
                                this.actionStates[fieldId] = { isLoading: false, message: '', progress: 0, success: null };
                            }
                        }, 8000);
                    }

                } catch (error) {
                    // Handle any failure during the fetch/poll process
                    this.actionStates[fieldId].success = false;
                    this.actionStates[fieldId].message = 'Something went wrong, please refresh and try again.';
                    this.actionStates[fieldId].isLoading = false; // Stop loading on error
                    console.error('Action failed:', error);
                }
            };

            // Start the process by calling the poll function with the initial step
            poll(0);
        },

        /**
         * Loads content for a custom page via AJAX.
         */
        async loadCustomPageContent(sectionId) {
            if (this.loadedContentCache[sectionId]) return;

            const sectionData = this.sections.find(s => s.id === sectionId);
            if (!sectionData || !sectionData.ajax_content) return;

            this.isContentLoading = true;
            try {
                const response = await fetch(window.ayecodeSettingsFramework.ajax_url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        action: 'ayecode_settings_framework_load_content_pane',
                        nonce: window.ayecodeSettingsFramework.tool_nonce,
                        content_action: sectionData.ajax_content
                    })
                });
                const data = await response.json();
                this.loadedContentCache[sectionId] = data.success ? data.data.html : `<div class="alert alert-danger">Error: ${data.data?.message || 'Could not load content.'}</div>`;
            } catch (error) {
                this.loadedContentCache[sectionId] = `<div class="alert alert-danger">Request failed while loading content.</div>`;
            } finally {
                this.isContentLoading = false;
            }
        },

        /**
         * Show notification message
         */
        showNotification(message, type = 'info') {
            if (window.wp && window.wp.data && window.wp.data.dispatch('core/notices')) {
                window.wp.data.dispatch('core/notices').createNotice(
                    type === 'error' ? 'error' : 'success', message, { type: 'snackbar', isDismissible: true }
                );
            } else {
                aui_toast('asf-settings-framework-' + type, type, message);
            }
        }
    };
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Alpine === 'undefined') {
        console.error('Alpine.js is required for AyeCode Settings Framework');
        return;
    }
    console.log('AyeCode Settings Framework ready');
});