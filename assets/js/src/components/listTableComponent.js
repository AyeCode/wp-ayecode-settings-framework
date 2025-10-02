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
                        return this.sortDirection === 'asc' ? valA - valB : valB - valA;
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
            this.modalInstance = new bootstrap.Modal(this.$refs.editModal);
            this.load_items();

            this.$refs.editModal.addEventListener('hidden.bs.modal', () => {
                this.editingItem = {};
                this.isEditing = false;
            });
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
            // ... (no changes to this method)
            this.isSaving = true;
            try {
                const response = await fetch(window.ayecodeSettingsFramework.ajax_url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        action: window.ayecodeSettingsFramework.tool_ajax_action,
                        nonce: window.ayecodeSettingsFramework.tool_nonce,
                        tool_action: tool_action,
                        data: JSON.stringify(data),
                    })
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
            // ... (no changes to this method)
            this.isLoading = true;
            const result = await this.do_ajax(this.config.table_config.ajax_action_get);
            if (result && result.success) {
                this.items = result.data;
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

            const result = await this.do_ajax(action, this.editingItem);

            if (result && result.success) {
                this.modalInstance.hide();
                if (!this.isEditing && this.config.post_create_view) {
                    this.postCreateItem = result.data;
                    this.change_view('post_create');
                } else {
                    this.load_items();
                }
            }
        },

        async delete_item(itemId) {
            // ... (no changes to this method)
            const confirmed = await window.aui_confirm('Are you sure you want to delete this item? This cannot be undone.', 'Delete', 'Cancel', true, true);
            if (confirmed) {
                await this.do_ajax(this.config.modal_config.ajax_action_delete, { id: itemId });
                this.load_items();
            }
        },

        change_view(newView) {
            // ... (no changes to this method)
            this.view = newView;
            if (newView === 'list') {
                this.load_items();
            }
        },

        render_field(field, modelPrefix) {
            // ... (no changes to this method)
            return renderFieldCompat(field, modelPrefix);
        },

        should_show_field(field, context) {
            // ... (no changes to this method)
            return evaluateShowIf(context, field);
        }
    };
}