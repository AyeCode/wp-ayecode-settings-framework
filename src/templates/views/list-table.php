<?php
/**
 * Template View: List Table
 * Renders a generic, AJAX-powered list table for CRUD operations with searching and sorting.
 * @package AyeCode\SettingsFramework
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<div x-data="listTableComponent(activePageConfig)">

    <div x-show="view === 'list'">


        <div class="d-flex mt-3">

            <template x-if="config.table_config.statuses && config.table_config.statuses.status_key">
                <div x-cloak>
                    <div class="list-group list-group-horizontal w-auto d-inline-flex">
                        <a href="#"
                           class="list-group-item list-group-item-action d-flex fw-normal py-2 fs-xs "
                           :class="{ 'active': currentStatus === 'all' }"
                           @click.prevent="filter_by_status('all')">
                            All <span class="count ms-1" x-text="'(' + (config.table_config.statuses.counts.all || 0) + ')'"></span>
                        </a>
                        <template x-for="([status, label], index) in Object.entries(config.table_config.statuses.labels || {})" :key="status">
                            <a href="#"
                               class="list-group-item list-group-item-action d-flex fw-normal py-2 fs-xs "
                               :class="{ 'active': currentStatus === status }"
                               @click.prevent="filter_by_status(status)">
                                <span x-text="label"></span>
                                <span class="count ms-1" x-text="'(' + (config.table_config.statuses.counts[status] || 0) + ')'"></span>
                            </a>
                        </template>
                    </div>
                </div>
            </template>

            <div class="ms-auto">
                <button class="btn btn-primary btn-sm" @click="open_modal()" x-show="config.post_create_view">
                    <i class="fa-solid fa-plus me-1"></i>
                    <span x-text="'Add ' + (config.table_config.singular || 'Item')"></span>
                </button>
            </div>


        </div>



        <div class="d-flex justify-content-between mb-3 mt-4">
            <div>


                <div class="" x-show="config.table_config.bulk_actions" x-cloak >
                    <div class="d-flex align-items-center">
                        <select class="form-select form-select-sm me-2" x-model="bulkAction" style="width: auto;">
                            <option value=""><?php esc_html_e( 'Bulk actions', 'ayecode-connect' ); ?></option>
                            <template x-for="(label, action) in config.table_config.bulk_actions" :key="action">
                                <option :value="action" x-text="label"></option>
                            </template>
                        </select>
                        <button class="btn btn-sm btn-secondary" @click="apply_bulk_action()" :disabled="selectedItems.length === 0"><?php esc_html_e( 'Apply', 'ayecode-connect' ); ?></button>
                    </div>
                </div>

            </div>

            <div class="d-flex align-items-center">
                <template x-for="filter in config.table_config.filters" :key="filter.id">
                    <select class="form-select form-select-sm me-2" x-model="currentFilters[filter.id]" style="min-width: 150px;">
                        <option value="" x-text="filter.placeholder || 'Select...'"></option>
                        <template x-for="[optionValue, optionLabel] in Object.entries(filter.options)" :key="optionValue">
                            <option :value="optionValue" x-text="optionLabel"></option>
                        </template>
                    </select>
                </template>

                <div class="input-group input-group-sm" style="max-width: 250px;">
                    <input type="search" class="form-control" x-model.debounce.300ms="searchQuery" placeholder="<?php esc_attr_e( 'Search...', 'ayecode-connect' ); ?>">
                    <span class="input-group-text bg-transparent"><i class="fa-solid fa-magnifying-glass"></i></span>
                </div>
            </div>
        </div>



        <template x-if="!items.length && !isLoading">
            <div class="text-center p-5 border rounded bg-body">
                <p x-show="!config.table_config.statuses || currentStatus === 'all'" x-text="'No ' + (config.table_config.plural.toLowerCase() || 'items') + ' found.'"></p>
                <p x-show="config.table_config.statuses && currentStatus !== 'all'" x-cloak x-text="'No ' + (config.table_config.plural.toLowerCase() || 'items') + ' found in this view.'"></p>

                <button class="btn btn-primary btn-lg" @click="open_modal()" x-show="config.post_create_view && (!config.table_config.statuses || currentStatus === 'all')">
                    <span x-text="'Create Your First ' + (config.table_config.singular || 'Item')"></span>
                </button>
            </div>
        </template>

        <div class="table-responsive  border rounded" x-show="items.length > 0 && !isLoading" x-cloak>
            <table class="table table-hover bg-body rounded-3 align-middle table-borderless table-striped mb-0">
                <thead class="bg-light-subtle">
                <tr>
                    <th scope="col" class="check-column" style="width: 2.5em;" x-show="config.table_config.bulk_actions" x-cloak>
                        <input type="checkbox" @change="toggle_select_all($event)">
                    </th>
                    <template x-for="[columnKey, column] in Object.entries(config.table_config.columns)" :key="columnKey">
                        <th scope="col" @click="sort_by(columnKey)" class="c-pointer ">
                            <span x-text="column.label"></span>
                            <i class="fa-solid fa-sort ms-1 text-muted" x-show="sortColumn !== columnKey"></i>
                            <i class="fa-solid fa-sort-up ms-1" x-show="sortColumn === columnKey && sortDirection === 'asc'"></i>
                            <i class="fa-solid fa-sort-down ms-1" x-show="sortColumn === columnKey && sortDirection === 'desc'"></i>
                        </th>
                    </template>
                    <th scope="col" class="text-end"><?php esc_html_e( 'Actions', 'ayecode-connect' ); ?></th>
                </tr>
                </thead>
                <tbody>
                <template x-for="item in filteredItems" :key="item.id">
                    <tr>
                        <td class="check-column" x-show="config.table_config.bulk_actions" x-cloak>
                            <input type="checkbox" :value="item.id" x-model="selectedItems">
                        </td>
                        <template x-for="columnKey in Object.keys(config.table_config.columns)" :key="columnKey">
                            <td x-html="item[columnKey]"></td>
                        </template>
                        <td class="text-end">
                            <button class="btn btn-sm btn-icon text-muted" @click.prevent="open_modal(item)" data-bs-toggle="tooltip" title="Edit">
                                <i class="fa-solid fa-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-icon text-muted" @click="delete_item(item.id)" data-bs-toggle="tooltip" title="Delete">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </td>
                    </tr>
                </template>
                <tr x-show="filteredItems.length === 0">
                    <td :colspan="Object.keys(config.table_config.columns).length + (config.table_config.bulk_actions ? 1 : 0) + 1" class="text-center text-muted py-4">
                        <?php esc_html_e( 'No items match your search.', 'ayecode-connect' ); ?>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>

        <div x-show="isLoading" class="text-center p-5"><div class="spinner-border text-primary"></div></div>
    </div>

    <template x-if="config.post_create_view">
        <div x-show="view === 'post_create'" x-cloak>
            <h2 class="h3" x-text="config.post_create_view.title || 'Item Created'"></h2>
            <div class="alert alert-success" x-text="config.post_create_view.message || 'Item created successfully.'"></div>
            <div class="p-4 border rounded bg-body">
                <template x-for="field in config.post_create_view.fields" :key="field.id">
                    <div class="mb-3" x-html="render_field(field, 'postCreateItem')"></div>
                </template>
            </div>
            <div class="mt-4">
                <button class="btn btn-primary" @click="change_view('list')"><?php esc_html_e( 'Done', 'ayecode-connect' ); ?></button>
            </div>
        </div>
    </template>

    <div class="modal fade" tabindex="-1" x-ref="editModal">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" x-text="isEditing ? config.modal_config.title_edit : config.modal_config.title_add"></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <template x-for="field in config.modal_config.fields" :key="field.id">
                        <div class="pb-4" x-show="should_show_field(field, editingItem)" x-cloak x-html="render_field(field, 'editingItem')"></div>
                    </template>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"><?php esc_html_e( 'Close', 'ayecode-connect' ); ?></button>
                    <button type="button" class="btn btn-primary" @click="save_item()" :disabled="isSaving">
                        <span x-show="isSaving" class="spinner-border spinner-border-sm me-1"></span>
                        <span x-text="isSaving ? '<?php echo esc_js( __( 'Saving...', 'ayecode-connect' ) ); ?>' : '<?php echo esc_js( __( 'Save Changes', 'ayecode-connect' ) ); ?>'"></span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>