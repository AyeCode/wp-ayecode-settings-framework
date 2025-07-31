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
        hasUnsavedChanges: false,
        sidebarOpen: false,
        theme: 'light',
        isChangingView: false,

        // Search
        searchModalEl: null,
        searchModal: null,
        allFields: [],

        // Sections (processed from config)
        sections: [],

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

            // Set initial section based on URL or default
            this.handleUrlHash();

            // Setup event listeners and modal
            this.setupSearchModal();
            this.setupEventListeners();

            // Initial plugin load
            this.reinitializePlugins();
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
                    hasUnsavedChanges: false,
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
            }
            this.updateUrlHash();
        },

        /**
         * Setup event listeners for keyboard shortcuts etc.
         */
        setupEventListeners() {
            window.addEventListener('beforeunload', (e) => {
                if (this.hasUnsavedChanges) {
                    e.preventDefault();
                    e.returnValue = this.strings.confirm_discard || 'You have unsaved changes';
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
        get currentSectionData() {
            return this.sections.find(s => s.id === this.currentSection);
        },
        get currentSubsectionData() {
            if (!this.currentSectionData || !this.currentSectionData.subsections) return null;
            return this.currentSectionData.subsections.find(ss => ss.id === this.currentSubsection);
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
            if (this.currentSection === sectionId) return;
            this.changeView(() => {
                this.currentSection = sectionId;
                this.sidebarOpen = false;
                const section = this.sections.find(s => s.id === sectionId);
                this.currentSubsection = section?.subsections?.length > 0 ? section.subsections[0].id : '';
                this.updateUrlHash();
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
         * Mark as changed
         */
        markChanged() {
            this.hasUnsavedChanges = true;
        },

        /**
         * Highlight a specific field by its ID
         */
        highlightField(fieldId) {
            this.$nextTick(() => {
                const fieldElement = document.getElementById(fieldId);
                if (fieldElement) {
                    const container = fieldElement.closest('.row, .py-4');
                    if (container) {
                        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        container.classList.add('highlight-setting');
                        setTimeout(() => container.classList.remove('highlight-setting'), 2500);
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
                    this.hasUnsavedChanges = false;
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
                this.hasUnsavedChanges = false;
            }
        },

        // ✨ --- RENDERER PROXY --- ✨
        /**
         * Renders a field by calling the global field renderer.
         */
        renderField(field) {
            if (window.asfFieldRenderer) {
                return window.asfFieldRenderer.renderField(field);
            }
            return '<div class="alert alert-danger">Error: Field renderer not found.</div>';
        },

        // ✨ --- IMAGE-SPECIFIC METHODS --- ✨
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
                this.markChanged();
            });
            frame.open();
        },

        /**
         * Removes a selected image.
         */
        removeImage(fieldId) {
            this.settings[fieldId] = null;
            delete this.imagePreviews[fieldId];
            this.markChanged();
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