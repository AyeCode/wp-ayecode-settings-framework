import { showNotification } from '@/services/notifications';
import { renderFieldCompat } from '@/services/settings';
import { shouldShowField as evaluateShowIf } from '@/utils/conditions';

/**
 * A reusable Alpine.js component for a List Table page.
 * @param {object} config The configuration object for this specific list table instance.
 */
export default function listTableComponent(config) {
    return {
        config: config,
        _lastLoadedSectionId: null, // Track which section we last loaded
        view: 'list', // Can be 'list', 'modal', or 'post_create'
        items: [],
        editingItem: {},
        postCreateItem: {},
        isLoading: true,
        isSaving: false,
        isEditing: false,
        modalInstance: null,

        // New state for table features
        searchQuery: '',
        sortColumn: '',
        sortDirection: 'asc',
        currentStatus: 'all',
        currentFilters: {},
        selectedItems: [],
        bulkAction: '',

        /**
         * A computed property that automatically filters and sorts the items.
         * The table in the template will now loop over this property.
         */
        get filteredItems() {
            // Start with all items
            let filtered = this.items;

            // Apply search filter
            if (this.searchQuery.trim() !== '') {
                const query = this.searchQuery.toLowerCase().trim();
                filtered = this.items.filter(item => {
                    // Search through all values of an item
                    return Object.values(item).some(value =>
                        String(value).toLowerCase().includes(query)
                    );
                });
            }

            // Apply sorting
            if (this.sortColumn) {
                filtered.sort((a, b) => {
                    let valA = a[this.sortColumn];
                    let valB = b[this.sortColumn];

                    // Basic type checking for sorting
                    if (typeof valA === 'number' && typeof valB === 'number') {
                        return this.sortDirection === 'asc' ? valA - valB : valB - a;
                    }

                    // Default to string comparison
                    return this.sortDirection === 'asc'
                        ? String(valA).localeCompare(String(valB))
                        : String(valB).localeCompare(String(valA));
                });
            }

            return filtered;
        },

        init() {
            console.log('[List Table] init() called for section:', this.config.id, this.config.name);

            // Only initialize modal if modal_config exists
            if (this.config.modal_config && this.$refs.editModal) {
                this.modalInstance = new bootstrap.Modal(this.$refs.editModal);
            }

            // THE FIX: Only access statuses properties if the config exists.
            if (this.config.table_config.statuses && this.config.table_config.statuses.status_key) {
                if (this.config.table_config.statuses.default_status) {
                    this.currentStatus = this.config.table_config.statuses.default_status;
                }
                if (!this.config.table_config.statuses.counts) {
                    this.config.table_config.statuses.counts = {};
                }
            }

            // Initialize currentFilters based on the config
            if (this.config.table_config.filters) {
                this.config.table_config.filters.forEach(filter => {
                    this.currentFilters[filter.id] = ''; // Default to empty (all)
                });
            }

            console.log('[List Table] About to call load_items()...');
            this.load_items();

            // Add event listener only if modal exists
            if (this.$refs.editModal) {
                this.$refs.editModal.addEventListener('hidden.bs.modal', () => {
                    this.editingItem = {};
                    this.isEditing = false;
                });
            }

            // Watch for changes in filters and reload the data
            this.$watch('currentFilters', () => this.load_items(), { deep: true });

            // Listen for section change events from parent
            console.log('[List Table] Setting up section-change listener');
            window.addEventListener('asf-section-changed', (e) => {
                console.log('[List Table] Section changed event received!', e.detail);
                const newSectionId = e.detail.sectionId;
                const newSectionType = e.detail.sectionType;

                // Only reload if it's a list_table section and different from what we last loaded
                if (newSectionType === 'list_table' && newSectionId !== this._lastLoadedSectionId) {
                    console.log('[List Table] Different list_table section detected!');
                    console.log('[List Table] Last loaded:', this._lastLoadedSectionId, 'New section:', newSectionId);

                    // Update config to new activePageConfig
                    const newConfig = e.detail.activePageConfig;

                    // Initialize counts object if it doesn't exist to prevent template errors
                    if (newConfig.table_config?.statuses && !newConfig.table_config.statuses.counts) {
                        newConfig.table_config.statuses.counts = {};
                    }

                    this.config = newConfig;
                    this._lastLoadedSectionId = newSectionId;
                    this.load_items();
                }
            });
        },

        filter_by_status(status) {
            this.currentStatus = status;
            this.load_items();
        },

        update_counts(newCounts) {
            if (newCounts && this.config.table_config.statuses) {
                this.config.table_config.statuses.counts = newCounts;
            }
        },

        toggle_select_all(event) {
            if (event.target.checked) {
                this.selectedItems = this.filteredItems.map(item => item.id);
            } else {
                this.selectedItems = [];
            }
        },

        async apply_bulk_action() {
            if (!this.bulkAction || this.selectedItems.length === 0) {
                showNotification(this, 'Please select an action and at least one item.', 'error');
                return;
            }

            const confirmed = await window.aui_confirm(`You are about to perform the action "${this.config.table_config.bulk_actions[this.bulkAction]}" on ${this.selectedItems.length} items. Are you sure?`, 'Confirm', 'Cancel', true, true);

            if (confirmed) {
                const result = await this.do_ajax(this.config.table_config.ajax_action_bulk, {
                    action: this.bulkAction,
                    item_ids: this.selectedItems
                });

                if (result && result.success) {
                    // THE FIX: Provide a default success message.
                    showNotification(this, result.data?.message || 'Action applied successfully!', 'success');
                    this.selectedItems = [];
                    this.bulkAction = '';
                    this.load_items();
                }
            }
        },

        /**
         * Toggles the sort order for a given column.
         * @param {string} columnKey - The key of the column to sort by.
         */
        sort_by(columnKey) {
            if (this.sortColumn === columnKey) {
                // If it's the same column, reverse the direction
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                // If it's a new column, set it and default to ascending
                this.sortColumn = columnKey;
                this.sortDirection = 'asc';
            }
        },

        async do_ajax(tool_action, data = {}) {
            this.isSaving = true;
            try {
                const response = await fetch(window.ayecodeSettingsFramework.ajax_url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        action: window.ayecodeSettingsFramework.tool_ajax_action,
                        nonce: window.ayecodeSettingsFramework.tool_nonce,
                        tool_action: tool_action,
                        section_id: this.config.id, // Send the section ID to distinguish between multiple list_tables
                        data: JSON.stringify(data),
                        status: this.currentStatus, // Send the current status
                        filters: JSON.stringify(this.currentFilters), // Send the current filters
                    })
                });
                const result = await response.json();

                // THE FIX: Provide default messages if none are returned.
                if (!result.success) {
                    // Use optional chaining (?.) to safely access nested properties.
                    // If `data` or `data.message` is missing, fall back to a generic error.
                    showNotification(this, result.data?.message || 'An error occurred.', 'error');
                } else {
                    // For successful actions, also check for a message and provide a default.
                    // We'll add this to the calling functions for better context.
                }

                return result;
            } catch (error) {
                showNotification(this, 'A network error occurred during the request.', 'error');
            } finally {
                this.isSaving = false;
            }
        },

        async do_ajax_with_files(tool_action, data = {}) {
            this.isSaving = true;
            try {
                const formData = new FormData();
                formData.append('action', window.ayecodeSettingsFramework.tool_ajax_action);
                formData.append('nonce', window.ayecodeSettingsFramework.tool_nonce);
                formData.append('tool_action', tool_action);
                formData.append('section_id', this.config.id); // Send the section ID to distinguish between multiple list_tables
                formData.append('status', this.currentStatus);
                formData.append('filters', JSON.stringify(this.currentFilters));

                // Separate file and non-file data
                const nonFileData = {};

                // Get all file inputs from the modal
                const fileInputs = this.$refs.editModal.querySelectorAll('input[type="file"]');

                fileInputs.forEach(input => {
                    // Use either the id or name attribute as the key
                    const key = input.id || input.name;

                    if (input.files && input.files[0]) {
                        formData.append(key, input.files[0]);
                    }
                });

                // Loop through the data object and collect non-file fields
                for (const [key, value] of Object.entries(data)) {
                    const field = this.config.modal_config.fields.find(f => f.id === key);
                    if (!field || (field.type !== 'file' && field.type !== 'image')) {
                        nonFileData[key] = value;
                    }
                }

                // Append non-file data as JSON string (matching the do_ajax format)
                formData.append('data', JSON.stringify(nonFileData));

                const response = await fetch(window.ayecodeSettingsFramework.ajax_url, {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                if (!result.success) {
                    showNotification(this, result.data?.message || 'An error occurred.', 'error');
                }

                return result;
            } catch (error) {
                showNotification(this, 'A network error occurred during the request.', 'error');
            } finally {
                this.isSaving = false;
            }
        },

        async load_items() {
            console.log('[List Table] load_items() called, action:', this.config.table_config.ajax_action_get, 'section:', this.config.id);
            console.log('[List Table] _lastLoadedSectionId:', this._lastLoadedSectionId, 'config.id:', this.config.id);

            // Check if we've switched to a different section
            if (this._lastLoadedSectionId && this._lastLoadedSectionId !== this.config.id) {
                console.log('[List Table] Section changed! Resetting state...');
                // Reset state for new section
                this.items = [];
                this.searchQuery = '';
                this.sortColumn = '';
                this.sortDirection = 'asc';
                this.currentStatus = this.config.table_config.statuses?.default_status || 'all';
                this.currentFilters = {};
                this.selectedItems = [];

                // Reinitialize filters
                if (this.config.table_config.filters) {
                    this.config.table_config.filters.forEach(filter => {
                        this.currentFilters[filter.id] = '';
                    });
                }
            }

            this._lastLoadedSectionId = this.config.id;

            this.isLoading = true;
            this.items = [];
            const result = await this.do_ajax(this.config.table_config.ajax_action_get);
            console.log('[List Table] load_items() result:', result);

            if (result && result.success) {
                // THE FIX:
                // 1. Always update counts if they exist in the response.
                if (result.data && result.data.counts) {
                    this.update_counts(result.data.counts);
                }

                // 2. Safely update items, defaulting to an empty array.
                // This handles both response shapes: { items: [...] } or just [...]
                if (result.data && result.data.items !== undefined) {
                    this.items = result.data.items || [];
                } else {
                    this.items = result.data || [];
                }
            }

            this.isLoading = false;
        },

        open_modal(item = null) {
            if (item) {
                this.isEditing = true;
                this.editingItem = JSON.parse(JSON.stringify(item));
            } else {
                this.isEditing = false;
                this.editingItem = {};
                this.config.modal_config.fields.forEach(field => {
                    if (field.default !== undefined) {
                        this.editingItem[field.id] = field.default;
                    } else if (field.type === 'select' && field.options && Object.keys(field.options).length > 0) {
                        // If it's a select field with no default, automatically use the first option.
                        this.editingItem[field.id] = Object.keys(field.options)[0];
                    }
                });
            }
            this.modalInstance.show();
        },

        async save_item() {
            // Loop through fields to find any that are required.
            for (const field of this.config.modal_config.fields) {
                // Skip validation if field is hidden by show_if
                if (!this.should_show_field(field, this.editingItem)) {
                    continue;
                }

                if (field.extra_attributes?.required) {
                    const value = this.editingItem[field.id];
                    // If the value is empty or just whitespace, show an error and stop.
                    if (!value || String(value).trim() === '') {
                        showNotification(this, `The "${field.label || field.id}" field is required.`, 'error');
                        return; // Stop the save process.
                    }
                }
            }

            const action = this.isEditing
                ? this.config.modal_config.ajax_action_update
                : this.config.modal_config.ajax_action_create;

            // Check if there are any file inputs in the modal
            const hasFileInputs = this.config.modal_config.fields.some(field => field.type === 'file' || field.type === 'image');

            let result;
            if (hasFileInputs) {
                result = await this.do_ajax_with_files(action, this.editingItem);
            } else {
                result = await this.do_ajax(action, this.editingItem);
            }

            if (result && result.success) {
                this.modalInstance.hide();
                // Only show post_create_view if it exists AND this is a new item (not editing)
                if (!this.isEditing && this.config.post_create_view) {
                    this.postCreateItem = result.data;
                    this.change_view('post_create');
                } else {
                    this.load_items();
                }
            }
        },

        async delete_item(itemId) {
            const confirmed = await window.aui_confirm('Are you sure you want to delete this item? This cannot be undone.', 'Delete', 'Cancel', true, true);
            if (confirmed) {
                const result = await this.do_ajax(this.config.modal_config.ajax_action_delete, { id: itemId });
                if (result && result.success) {
                    // THE FIX: Provide a default success message.
                    showNotification(this, result.data?.message || 'Item deleted successfully.', 'success');
                    this.load_items();
                }
            }
        },

        change_view(newView) {
            this.view = newView;
            if (newView === 'list') {
                this.load_items();
            }
        },

        render_field(field, modelPrefix) {
            return renderFieldCompat(field, modelPrefix);
        },

        should_show_field(field, context) {
            return evaluateShowIf(context, field);
        }
    };
}