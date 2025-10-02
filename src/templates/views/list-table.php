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

        <div class="d-flex justify-content-end my-4" x-show="items.length > 0">

            <button class="btn btn-primary me-auto" @click="open_modal()" x-show="config.post_create_view">
                <i class="fa-solid fa-plus me-1"></i>
                <span x-text="'Add ' + (config.table_config.singular || 'Item')"></span>
            </button>

            <div class="input-group" style="max-width: 250px;">
                <span class="input-group-text bg-transparent"><i class="fa-solid fa-magnifying-glass"></i></span>
                <input type="search" class="form-control" x-model.debounce.300ms="searchQuery" placeholder="Search...">
            </div>
        </div>

        <template x-if="!items.length && !isLoading">
            <div class="text-center p-5 border rounded bg-body">
                <p x-text="'No ' + (config.table_config.plural.toLowerCase() || 'items') + ' found.'"></p>
                <button class="btn btn-primary btn-lg" @click="open_modal()" x-show="config.post_create_view">
                    <span x-text="'Create Your First ' + (config.table_config.singular || 'Item')"></span>
                </button>
            </div>
        </template>

        <div class="table-responsive" x-show="items.length > 0" x-cloak>
            <table class="table table-hover bg-body rounded-3 align-middle table-borderless table-striped">
                <thead class="bg-light-subtle">
                <tr>
                    <template x-for="[columnKey, column] in Object.entries(config.table_config.columns)" :key="columnKey">
                        <th scope="col" @click="sort_by(columnKey)" class="c-pointer ">
                            <span x-text="column.label"></span>
                            <i class="fa-solid fa-sort ms-1 text-muted" x-show="sortColumn !== columnKey"></i>
                            <i class="fa-solid fa-sort-up ms-1" x-show="sortColumn === columnKey && sortDirection === 'asc'"></i>
                            <i class="fa-solid fa-sort-down ms-1" x-show="sortColumn === columnKey && sortDirection === 'desc'"></i>
                        </th>
                    </template>
                    <th scope="col" class="text-end">Actions</th>
                </tr>
                </thead>
                <tbody>
                <template x-for="item in filteredItems" :key="item.id">
                    <tr>
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
                    <td :colspan="Object.keys(config.table_config.columns).length + 1" class="text-center text-muted py-4">
                        No items match your search.
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
                <button class="btn btn-primary" @click="change_view('list')">Done</button>
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
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" @click="save_item()" :disabled="isSaving">
                        <span x-show="isSaving" class="spinner-border spinner-border-sm me-1"></span>
                        <span x-text="isSaving ? 'Saving...' : 'Save Changes'"></span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>