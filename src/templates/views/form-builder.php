<?php
/**
 * Template View: Form Builder
 *
 * Renders the form builder interface.
 *
 * @package AyeCode\SettingsFramework
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}
?>
<div class="row g-5">
    <div class="col-md-6 col-12">
        <div x-show="leftColumnView === 'field_settings'" x-cloak x-transition>
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="mb-0">Field Settings</h4>
                <button type="button" class="btn-close" @click="leftColumnView = 'field_list'; editingField = null;"></button>
            </div>
            <div class="border rounded p-3 bg-body">
                <template x-if="editingField">
                    <div>
                        <template x-for="(fieldSchema, index) in editingField.fields" :key="index">
                            <div x-show="fieldSchema.type !== 'hidden'">
                                <div class="py-4" x-html="renderField(fieldSchema, 'editingField')"></div>
                            </div>
                        </template>

                        <!-- Special case for options, as it's not a standard field -->
                        <template x-if="editingField.type === 'select'">
                            <div class="py-4">
                                <div class="row">
                                    <div class="col-md-4">
                                        <label class="form-label fw-bold mb-0">Options</label>
                                        <p class="form-text text-muted mt-1 mb-0">Enter one option per line in `key : value` format.</p>
                                    </div>
                                    <div class="col-md-8">
                                        <textarea class="form-control" x-model="editingField.options" rows="5"></textarea>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <button class="btn btn-primary w-100" @click="leftColumnView = 'field_list'; editingField = null;">Done</button>
                    </div>
                </template>
            </div>
        </div>
        <div x-show="leftColumnView === 'field_list'" x-cloak x-transition>
            <h4 class="mb-3">Available Fields</h4>
            <template x-for="(group, groupIndex) in activePageConfig.templates" :key="groupIndex">
                <div class="mb-4">
                    <h6 class="text-muted" x-text="group.group_title"></h6>
                    <ul class="row row-cols-2 gy-0 gx-1 px-0">
                        <template x-for="option in group.options" :key="option.title">
                            <li class="col" @click="addField(option)">
                                <span class="btn btn-sm btn-outline-secondary w-100 c-pointer d-block text-start" >
                                    <i :class="option.icon || 'fa-solid fa-plus'" class="fa-fw me-2 text-muted"></i>
                                    <span x-text="option.title"></span>
                                </span>
                            </li>
                        </template>
                    </ul>
                </div>
            </template>
        </div>
    </div>

    <div class="col-md-6 col-12 d-flex flex-column">
        <h4 class="mb-3" x-text="activePageConfig.page_title || activePageConfig.name"></h4>
        <div
                class="border rounded p-3 min-vh-50 bg-body flex-grow-1"
                x-sort="(item, pos) => handleSort(item, pos)"
        >
            <template x-for="field in settings[activePageConfig.id]" :key="sortIteration + '-' + field._uid">
                <div class="px-3 py-2 border rounded mb-2 bg-light-subtle" :class="{ 'border-primary': editingField && editingField._uid === field._uid }" x-sort:item="field._uid">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <span x-sort:handle class="c-move me-3 text-muted"><i class="fa-solid fa-grip-vertical"></i></span>
                            <a href="#" @click.prevent="editField(field)" class="fw-bold text-decoration-none text-body">
                                <i :class="field.icon || 'fa-solid fa-pen-to-square'" class="fa-fw me-2 text-muted"></i>
                                <span x-text="field.label"></span>
                                <span class="ms-2 text-muted small" x-text="'(' + field.type + ')'"></span>
                            </a>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-outline-danger" @click="deleteField(field)">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                    <p class="text-muted small mb-0 ps-4 ms-2" x-text="field.description"></p>
                    <template x-if="field.type === 'group'">
                        <div class="ms-5 mt-2 p-2 border-start">
                            <div
                                    class="nested-dropzone min-vh-10 border-dashed rounded p-3"
                                    x-sort="(item, pos) => {
                                        let items = [...field.fields];
                                        const movedItem = items.find(i => i._uid == item);
                                        const oldIndex = items.indexOf(movedItem);
                                        items.splice(oldIndex, 1);
                                        items.splice(pos, 0, movedItem);
                                        field.fields = items;
                                    }"
                            >
                                <template x-for="childField in field.fields" :key="childField._uid">
                                </template>
                            </div>
                        </div>
                    </template>
                </div>
            </template>
            <div x-show="!settings[activePageConfig.id] || settings[activePageConfig.id].length === 0" class="text-center text-muted p-5">
                <p>Click on a field from the left to add it to your form.</p>
            </div>
        </div>

        <div class="pt-4 mt-4 d-flex justify-content-end align-items-center">
            <div x-show="hasUnsavedChanges" class="text-muted me-3" x-cloak>
             <span class="d-inline-flex align-items-center">
                <i class="fa-solid fa-circle text-warning me-2"></i>
                <span>Unsaved changes</span>
             </span>
            </div>
            <button class="btn btn-primary" @click="saveForm()" :disabled="isLoading || !hasUnsavedChanges">
                <span x-show="isLoading" class="spinner-border spinner-border-sm me-1" role="status"></span>
                <span x-text="isLoading ? strings.saving : 'Save Form'"></span>
            </button>
        </div>
    </div>
</div>
