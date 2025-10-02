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
        customSearchLinks: [],

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
            this.customSearchLinks = window.ayecodeSettingsFramework?.custom_search_links || [];
            this.loadConfiguration();
            this.loadSettings();
            this.flattenAllFields();

            // Initialize data models and states for all sections and subsections
            this.sections.forEach(section => {
                const processPage = (pageConfig) => {
                    if (pageConfig.type === 'action_page' || pageConfig.type === 'import_page' || pageConfig.type === 'tool_page') {
                        this.initializeActionPageData(pageConfig);
                    }
                };
                processPage(section);
                if (section.subsections) {
                    section.subsections.forEach(processPage);
                }
            });

            // pre-initialize action button field states
            this.allFields.forEach(item => {
                if (item.type === 'field' && item.field.type === 'action_button') {
                    if (item.field.toggle_config) {
                        const initialState = item.field.has_dummy_data || false;
                        this.actionStates[item.field.id] = {
                            has_dummy_data: initialState,
                            isLoading: false,
                            message: '',
                            progress: 0,
                            success: null
                        };
                        // Mirror the state into the settings object for show_if
                        this.settings[item.field.id] = initialState;
                    } else {
                        this.actionStates[item.field.id] = { isLoading: false, message: '', progress: 0, success: null };
                    }
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
         * Renders a table cell with custom logic based on column type.
         */
        renderCell(columnKey, item) {
            const columnConfig = this.activePageConfig.table_config.columns[columnKey];
            const value = item[columnKey];

            if (columnConfig && columnConfig.type) {
                switch (columnConfig.type) {
                    case 'user':
                        if (!item.user_name) return 'N/A';
                        return `<a href="${item.user_profile_url}">${item.user_name}</a>`;
                    case 'date':
                        return new Date(value).toLocaleDateString();
                    case 'badge':
                        let badgeClass = 'bg-secondary';
                        if (value === 'read_write') badgeClass = 'bg-primary';
                        if (value === 'read') badgeClass = 'bg-info';
                        return `<span class="badge ${badgeClass}">${value}</span>`;
                }
            }

            // Default behavior: escape and display raw text
            const el = document.createElement('div');
            el.textContent = value;
            return el.innerHTML;
        },

        /**
         * Helper to initialize data for an action page or import page.
         */
        initializeActionPageData(pageConfig) {
            // A recursive helper function to process fields and their children
            const processFieldsForDefaults = (fields) => {
                if (!fields || !Array.isArray(fields)) return;

                fields.forEach(field => {
                    if (!field) return;

                    // Set the default value if the field has an ID and a default is provided
                    if (field.id && this.settings[field.id] === undefined && field.default !== undefined) {
                        this.settings[field.id] = field.default;
                    } else if (field.id && this.settings[field.id] === undefined) {
                        // Ensure the property exists in the settings object even without a default
                        this.settings[field.id] = '';
                    }

                    // If the field is a group, recurse into its children
                    if (field.type === 'group' && field.fields) {
                        processFieldsForDefaults(field.fields);
                    }
                });
            };

            // Start the recursive process on the page's top-level fields
            processFieldsForDefaults(pageConfig.fields);

            // This part remains the same, initializing the state for the action buttons/pages
            let initialState = {
                isLoading: false,
                message: '',
                progress: 0,
                success: null,
                exportedFiles: []
            };

            if (pageConfig.type === 'import_page') {
                initialState = {
                    ...initialState,
                    uploadedFilename: '',
                    uploadProgress: 0,
                    processingProgress: 0,
                    status: 'idle',
                    summary: {},
                };
            }

            this.actionStates[pageConfig.id] = initialState;
        },

        resetImportPageState(pageConfig) {
            // This function safely resets the state for an import page
            // without breaking the reference held by the Alpine component.
            const state = this.actionStates[pageConfig.id];
            if (!state) return;

            // Use Object.assign to reset properties on the existing state object
            Object.assign(state, {
                isLoading: false,
                message: '',
                progress: 0,
                success: null,
                exportedFiles: [],
                uploadedFilename: '',
                uploadProgress: 0,
                processingProgress: 0,
                status: 'idle',
                summary: {},
            });

            // === ADD THIS NEW BLOCK TO RESET THE SETTINGS FIELDS ===
            // This ensures other fields (like dropdowns) are also reset.
            if (pageConfig.fields) {
                pageConfig.fields.forEach(field => {
                    if (this.settings.hasOwnProperty(field.id)) {
                        // Set the field back to its default value, or empty string
                        this.settings[field.id] = field.default !== undefined ? field.default : '';
                    }
                });
            }
        },

        findPageConfigById(pageId, sections) {
            for (const section of sections) {
                if (section.id === pageId) return section;
                if (section.subsections) {
                    const found = this.findPageConfigById(pageId, section.subsections);
                    if (found) return found;
                }
            }
            return null;
        },

        handleFileUpload(event, pageId, hiddenFieldName) {
            const state = this.actionStates[pageId];
            const file = event.dataTransfer ? event.dataTransfer.files[0] : event.target.files[0];

            if (!file) return;

            const pageConfig = this.findPageConfigById(pageId, this.sections);
            const acceptedFileType = pageConfig?.accept_file_type;

            if (acceptedFileType) {
                const fileExtension = file.name.split('.').pop().toLowerCase();
                const mimeMap = {
                    'csv': 'text/csv',
                    'json': 'application/json'
                };
                const acceptedMime = mimeMap[acceptedFileType];

                // Check both extension and MIME type for better security
                if (fileExtension !== acceptedFileType || (acceptedMime && file.type !== acceptedMime)) {
                    state.status = 'error';
                    state.success = false;
                    state.message = `Invalid file type. Please upload a .${acceptedFileType} file.`;
                    if (event.target) event.target.value = null; // Reset file input
                    return;
                }
            }

            // Reset the file input so the same file can be re-selected
            if (event.target) event.target.value = null;

            state.status = 'uploading';
            state.isLoading = true;
            state.message = '';
            state.success = null;
            state.uploadProgress = 0;

            const formData = new FormData();
            formData.append('action', window.ayecodeSettingsFramework.file_upload_ajax_action);
            formData.append('nonce', window.ayecodeSettingsFramework.tool_nonce);
            formData.append('import_file', file);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', window.ayecodeSettingsFramework.ajax_url, true);

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    state.uploadProgress = Math.round((e.loaded * 100) / e.total);
                }
            };

            xhr.onload = () => {
                state.isLoading = false;
                if (xhr.status >= 200 && xhr.status < 300) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        state.status = 'selected';
                        state.uploadedFilename = response.data.filename;
                        state.message = response.data.message;
                        this.settings[hiddenFieldName] = response.data.filename; // IMPORTANT: Set hidden field
                    } else {
                        state.status = 'error';
                        state.success = false;
                        state.message = response.data.message || 'File upload failed.';
                    }
                } else {
                    state.status = 'error';
                    state.success = false;
                    state.message = `Upload error: ${xhr.statusText}`;
                }
            };

            xhr.onerror = () => {
                state.isLoading = false;
                state.status = 'error';
                state.success = false;
                state.message = 'A network error occurred during upload.';
            };

            xhr.send(formData);
        },

        /**
         * Removes an uploaded temporary file.
         */
        async removeUploadedFile(pageId, hiddenFieldName) {
            const state = this.actionStates[pageId];
            if (!state.uploadedFilename) return;

            const filename = state.uploadedFilename;

            // Immediately reset the frontend state for better UX
            state.status = 'idle';
            state.uploadedFilename = '';
            state.message = '';
            state.success = null;
            this.settings[hiddenFieldName] = '';

            try {
                await fetch(window.ayecodeSettingsFramework.ajax_url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        action: window.ayecodeSettingsFramework.file_delete_ajax_action,
                        nonce: window.ayecodeSettingsFramework.tool_nonce,
                        filename: filename
                    })
                });
                // No need to handle success/error here as we've already updated the UI.
                // We can log errors for debugging if needed.
            } catch (error) {
                console.error('Error deleting temp file:', error);
            }
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

            const processFields = (fields, section, subsection = null) => {
                if (!fields || !Array.isArray(fields)) return;

                fields.forEach(field => {
                    if (!field) return;

                    if (field.type === 'group' && field.fields) {
                        processFields(field.fields, section, subsection);
                    }
                        // --- THIS IS THE CHANGE ---
                    // Only add the field if it has an ID AND its 'searchable' flag is not explicitly false.
                    else if (field.id && field.searchable !== false) {
                        this.allFields.push({
                            type: 'field',
                            field: field,
                            sectionId: section.id,
                            sectionName: section.name,
                            subsectionId: subsection ? subsection.id : null,
                            subsectionName: subsection ? subsection.name : null,
                            icon: section.icon
                        });
                    }
                });
            };

            // The rest of the function remains the same...
            this.sections.forEach(section => {
                this.allFields.push({ type: 'section', id: section.id, name: section.name, icon: section.icon, keywords: section.keywords || [] });
                processFields(section.fields, section);
                if (section.subsections) {
                    section.subsections.forEach(subsection => {
                        this.allFields.push({ type: 'subsection', id: subsection.id, name: subsection.name, icon: section.icon, sectionId: section.id, sectionName: section.name, keywords: subsection.keywords || [] });
                        processFields(subsection.fields, section, subsection);
                    });
                }
            });
        },
        // flattenAllFields() {
        //     this.allFields = [];
        //     this.sections.forEach(section => {
        //         if (section.fields) {
        //             section.fields.forEach(field => {
        //                 this.allFields.push({
        //                     field: field,
        //                     sectionId: section.id,
        //                     sectionName: section.name,
        //                     sectionIcon: section.icon,
        //                     sectionKeywords: section.keywords || [],
        //                     subsectionId: null,
        //                     subsectionName: null
        //                 });
        //             });
        //         }
        //         if (section.subsections) {
        //             section.subsections.forEach(subsection => {
        //                 if (subsection.fields) {
        //                     subsection.fields.forEach(field => {
        //                         this.allFields.push({
        //                             field: field,
        //                             sectionId: section.id,
        //                             sectionName: section.name,
        //                             sectionIcon: section.icon,
        //                             sectionKeywords: section.keywords || [],
        //                             subsectionId: subsection.id,
        //                             subsectionName: subsection.name,
        //                             subsectionKeywords: subsection.keywords || []
        //                         });
        //                     });
        //                 }
        //             });
        //         }
        //     });
        // },

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
                if (currentSectionObj?.type === 'custom_page' && currentSectionObj.ajax_content) {
                    this.loadCustomPageContent(this.currentSection);
                }
            }
            this.updateUrlHash();
        },

        get isActionRunning() {
            return Object.values(this.actionStates).some(state => state.isLoading);
        },

        /**
         * Setup event listeners for keyboard shortcuts etc.
         */
        setupEventListeners() {
            window.addEventListener('beforeunload', (e) => {
                if (this.hasUnsavedChanges || this.isActionRunning) {
                    e.preventDefault();
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
        get activePageConfig() {
            return this.currentSubsectionData || this.currentSectionData || null;
        },
        get hasUnsavedChanges() {
            if (!this.isSettingsPage) {
                return false;
            }

            const visibleFields = this.activePageConfig?.fields || [];

            // Recursive helper function to check fields, including those in groups.
            const checkFieldsRecursively = (fields) => {
                for (const field of fields) {
                    if (field.type === 'group' && field.fields) {
                        // It's a group, so we recurse into its children.
                        if (checkFieldsRecursively(field.fields)) {
                            return true; // Found a change in a nested field.
                        }
                    } else if (field.id) {
                        // It's a standard field, so we perform the comparison.
                        const currentValue = this.settings[field.id];
                        const originalValue = this.originalSettings[field.id];
                        if (JSON.stringify(currentValue) !== JSON.stringify(originalValue)) {
                            return true; // Found a change.
                        }
                    }
                }
                return false; // No changes found at this level of nesting.
            };

            return checkFieldsRecursively(visibleFields);
        },
        get currentSectionData() {
            return this.sections.find(s => s.id === this.currentSection);
        },
        get currentSubsectionData() {
            if (!this.currentSectionData || !this.currentSectionData.subsections) return null;
            return this.currentSectionData.subsections.find(ss => ss.id === this.currentSubsection);
        },
        get isSettingsPage() {
            if (!this.activePageConfig) {
                return false;
            }
            const pageType = this.activePageConfig.type;

            // Add 'tool_page' to the list of types that do NOT get a save button
            if (pageType === 'custom_page' || pageType === 'action_page' || pageType === 'import_page' || pageType === 'tool_page') {
                return false;
            }

            const fieldsToCheck = this.activePageConfig.fields;
            if (!fieldsToCheck || !fieldsToCheck.length) {
                return false;
            }

            // This part is a bit more robust now, but the main fix is the line above.
            const hasSavableField = (fields) => {
                const nonSavableTypes = ['title', 'group', 'alert', 'action_button'];
                return fields.some(field => {
                    if (field.type === 'group' && field.fields) {
                        return hasSavableField(field.fields);
                    }
                    return !nonSavableTypes.includes(field.type);
                });
            };

            return hasSavableField(fieldsToCheck);
        },

        /**
         * Computed: Grouped search results for display
         */
        /**
         * Computed: Grouped search results for display
         */
        get groupedSearchResults() {
            if (!this.searchQuery.trim()) return [];
            const query = this.searchQuery.toLowerCase().trim();

            // 1. Filter regular setting fields (from previous fix)
            const fieldItems = this.allFields.filter(item => item.type === 'field');
            const filtered = fieldItems.filter(item => {
                const field = item.field;
                const textToSearch = [field.label, field.description, item.sectionName, item.subsectionName, ...(field.keywords || [])].join(' ').toLowerCase();
                return textToSearch.includes(query);
            });

            // 2. Group the regular results (from feature #2 fix)
            const grouped = filtered.reduce((acc, result) => {
                const groupIdentifier = result.subsectionName || result.sectionName;
                const groupTitle = result.subsectionName ? `${result.sectionName} &raquo; ${result.subsectionName}` : result.sectionName;
                if (!acc[groupIdentifier]) {
                    acc[groupIdentifier] = {
                        groupTitle, sectionIcon: result.sectionIcon, results: [],
                        sectionId: result.sectionId, subsectionId: result.subsectionId
                    };
                }
                acc[groupIdentifier].results.push(result);
                return acc;
            }, {});

            // 3. --- NEW --- Search and add custom links
            const matchingCustomLinks = this.customSearchLinks.filter(link => {
                const textToSearch = [link.title, link.description, ...(link.keywords || [])].join(' ').toLowerCase();
                return textToSearch.includes(query);
            });

            if (matchingCustomLinks.length > 0) {
                // Add them to a special group called "Helpful Links"
                grouped['helpful_links'] = {
                    groupTitle: 'Helpful Links',
                    sectionIcon: 'fas fa-fw fa-external-link-alt', // A default icon for this group
                    results: matchingCustomLinks,
                    isCustomGroup: true // A flag to help the template render it differently
                };
            }

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

        goToSection(sectionId, subsectionId = '') {
            this.changeView(() => {
                this.currentSection = sectionId;
                const section = this.sections.find(s => s.id === sectionId);
                this.currentSubsection = subsectionId || (section?.subsections?.length > 0 ? section.subsections[0].id : '');
                this.searchModal.hide();
                this.updateUrlHash();
                if (section?.type === 'custom_page' && section.ajax_content) {
                    this.loadCustomPageContent(sectionId);
                }
            });
        },
        /**
         * Navigate to a custom link from search results
         */
        goToCustomLink(link) {
            // First, always hide the modal
            this.searchModal.hide();

            // Then, handle the navigation
            if (link.external) {
                window.open(link.url, '_blank');
            } else {
                window.location.href = link.url;
            }
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
                this.setInitialSection();
                return;
            }
            const params = new URLSearchParams(hash);
            const sectionId = params.get('section');
            const subsectionId = params.get('subsection');
            const fieldId = params.get('field');

            if (sectionId && this.sections.some(s => s.id === sectionId)) {
                this.currentSection = sectionId;
                const section = this.sections.find(s => s.id === sectionId);
                if (section?.type === 'custom_page' && section.ajax_content) {
                    this.loadCustomPageContent(sectionId);
                }
                if (subsectionId && section.subsections?.some(ss => ss.id === subsectionId)) {
                    this.currentSubsection = subsectionId;
                } else {
                    this.currentSubsection = section.subsections?.length > 0 ? section.subsections[0].id : '';
                }
            } else {
                this.setInitialSection();
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
         * Executes an AJAX action for a full "action_page" or "import_page".
         */
        async executePageAction() {
            const pageConfig = this.activePageConfig;
            if (!pageConfig || !pageConfig.ajax_action) {
                console.error('Action page configuration not found.');
                return;
            }
            const actionId = pageConfig.id;
            const state = this.actionStates[actionId];

            state.isLoading = true;
            state.message = 'Starting...';
            state.progress = 0;
            state.processingProgress = 0;
            state.success = null;
            state.exportedFiles = [];
            if (pageConfig.type === 'import_page') {
                state.status = 'processing';
            }

            const inputData = {};
            if (pageConfig.fields && Array.isArray(pageConfig.fields)) {
                pageConfig.fields.forEach(field => {
                    if (field.id) {
                        inputData[field.id] = this.settings[field.id];
                    }
                });
            }

            if (pageConfig.type === 'import_page') {
                const pageState = this.actionStates[pageConfig.id];
                if (pageState && pageState.uploadedFilename) {
                    inputData.import_filename = pageState.uploadedFilename;
                }
            }

            const poll = async (currentStep) => {
                try {
                    const requestBody = {
                        action: window.ayecodeSettingsFramework.tool_ajax_action,
                        nonce: window.ayecodeSettingsFramework.tool_nonce,
                        tool_action: pageConfig.ajax_action,
                        step: currentStep,
                        input_data: JSON.stringify(inputData)
                    };

                    const response = await fetch(window.ayecodeSettingsFramework.ajax_url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams(requestBody)
                    });

                    if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);

                    const data = await response.json();

                    state.success = data.success;
                    if (data.data?.message) state.message = data.data.message;

                    const progress = data.data?.progress || 0;

                    if (data.data?.summary) {
                        state.summary = data.data.summary;
                    }

                    if (pageConfig.type === 'import_page') {
                        state.processingProgress = progress;
                    } else {
                        state.progress = progress;
                    }

                    if (data.success && data.data?.file) {
                        state.exportedFiles.push(data.data.file);
                    }

                    // Check if the process is complete
                    if (data.success && data.data?.next_step !== null && progress < 100) {
                        // If not complete, continue polling
                        setTimeout(() => poll(data.data.next_step), 20);
                    } else {
                        // Otherwise, the process is finished
                        state.isLoading = false;
                        if (pageConfig.type === 'import_page') {
                            state.status = 'complete';
                        }
                    }

                } catch (error) {
                    state.success = false;
                    state.message = 'An error occurred. Please check the console and try again.';
                    state.isLoading = false;
                    if (pageConfig.type === 'import_page') {
                        state.status = 'complete';
                    }
                    console.error('Page action failed:', error);
                }
            };

            poll(0);
        },

        /**
         * Executes an AJAX action for a field of type "action_button".
         */
        async executeAction(fieldId) {
            const fieldItem = this.allFields.find(f => f.type === 'field' && f.field.id === fieldId);
            if (!fieldItem) {
                console.error('Action button configuration not found for:', fieldId);
                return;
            }
            const field = fieldItem.field;
            const state = this.actionStates[fieldId];

            let ajaxAction;
            if (field.toggle_config) {
                ajaxAction = state.has_dummy_data ? field.toggle_config.remove.ajax_action : field.toggle_config.insert.ajax_action;
            } else {
                ajaxAction = field.ajax_action;
            }

            if (!ajaxAction) {
                console.error('No ajax_action defined for:', fieldId);
                return;
            }

            state.isLoading = true;
            state.message = 'Starting...';
            state.progress = 0;
            state.success = null;

            const inputData = {};
            const buttonEl = document.getElementById(fieldId);

            let container = null;
            if (buttonEl) {
                container = buttonEl.closest('.card-body');
            }
            if (!container) {
                container = this.$refs['action_container_' + fieldId];
            }

            if (container) {
                const inputs = container.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    const fieldIdFromInput = input.getAttribute('data-id') || input.id;
                    if (fieldIdFromInput) {
                        if (input.type === 'checkbox') {
                            inputData[fieldIdFromInput] = input.checked;
                        } else {
                            inputData[fieldIdFromInput] = input.value;
                        }
                    }
                });
            }

            const poll = async (currentStep) => {
                try {
                    const requestBody = {
                        action: window.ayecodeSettingsFramework.tool_ajax_action,
                        nonce: window.ayecodeSettingsFramework.tool_nonce,
                        tool_action: ajaxAction,
                        step: currentStep,
                        input_data: JSON.stringify(inputData)
                    };

                    const response = await fetch(window.ayecodeSettingsFramework.ajax_url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams(requestBody)
                    });

                    if (!response.ok) {
                        throw new Error(`Server responded with an error: ${response.status}`);
                    }

                    const data = await response.json();
                    state.success = data.success;
                    if (data.data?.message) state.message = data.data.message;
                    if (data.data?.progress) state.progress = data.data.progress;

                    // Check if the process is complete
                    if (data.success && data.data?.next_step !== null && data.data?.progress < 100) {
                        setTimeout(() => poll(data.data.next_step), 20);
                    } else {
                        // The action is finished
                        state.isLoading = false;

                        // --- THIS IS THE FIX ---
                        // If the action was successful and it's a toggleable button, flip the state.
                        if (data.success && field.toggle_config) {
                            state.has_dummy_data = !state.has_dummy_data;
                            // Also update the mirrored state for the show_if condition
                            this.settings[fieldId] = state.has_dummy_data;
                        }
                        // --- END OF FIX ---

                        if (state.success) {
                            setTimeout(() => {
                                if (state) {
                                    state.message = '';
                                    state.success = null;
                                }
                            }, 8000);
                        }
                    }
                } catch (error) {
                    state.success = false;
                    state.message = 'Something went wrong, please refresh and try again.';
                    state.isLoading = false;
                    console.error('Action failed:', error);
                }
            };
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
                        action: window.ayecodeSettingsFramework.content_pane_ajax_action,
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
