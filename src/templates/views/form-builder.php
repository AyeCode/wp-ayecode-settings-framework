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

        <template x-if="leftColumnView === 'field_settings'">
            <div id="asf-field-settings"
                 :key="'fs-' + (editingField && editingField._uid ? editingField._uid : 'none')"
                 x-cloak x-transition>
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4 class="mb-0">Field Settings</h4>
                    <button type="button" class="btn-close"
                            @click="leftColumnView = 'field_list'; $nextTick(() => { editingField = window.__ASF_NULL_FIELD })"
                    ></button>
                </div>
                <div class="border rounded p-3 bg-body">
                    <template x-if="editingField">
                        <div>
                            <template x-for="(fieldSchema, index) in editingField.fields" :key="index">
                                <div x-show="fieldSchema.type !== 'hidden'">
                                    <div class="pb-4"
                                         x-html="renderField(fieldSchema, 'editingField', activePageConfig)"
                                         x-effect="$nextTick(() => Alpine.initTree($el))"></div>
                                </div>
                            </template>
                            <button class="btn btn-primary w-100"
                                    @click="leftColumnView = 'field_list'; $nextTick(() => { editingField = window.__ASF_NULL_FIELD })">Done</button>
                        </div>
                    </template>
                </div>
            </div>
        </template>

        <div x-show="leftColumnView === 'field_list'" x-cloak x-transition>
            <h4 class="mb-3">Available Fields</h4>
            <template x-for="(group, groupIndex) in activePageConfig.templates" :key="groupIndex">
                <div class="mb-4">
                    <h6 class="text-muted" x-text="group.group_title"></h6>
                    <ul class="row row-cols-2 gy-0 gx-1 px-0">
                        <template x-for="option in group.options" :key="option.title">
                            <template x-if="!option.hidden">
                                <li class="col list-unstyled position-relative"
                                    @click="handleFieldClick(option)"
                                    :class="{ 'opacity-50': option.limit && countFieldsByTemplateId(option) >= option.limit }">
                                    <span class="btn btn-sm btn-outline-secondary w-100 d-block text-start"
                                          :class="{ 'c-pointer': !option.limit || countFieldsByTemplateId(option) < option.limit }">
                                        <i :class="option.icon || 'fa-solid fa-plus'" class="fa-fw me-2 text-muted"></i>
                                        <span x-text="option.title"></span>

                                        <template x-if="option.description">
                                            <i class="fa-solid fa-circle-question text-body-tertiary fs-sm position-absolute end-0 top-0 mt-2 me-2"
                                               data-bs-toggle="tooltip"
                                               :data-bs-title="option.description"
                                               @click.stop>
                                            </i>
                                        </template>
                                    </span>
                                </li>
                            </template>
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
                x-sort:group="{ name: 'fields' }"
                x-sort="(item, pos) => handleSort(item, pos, null)"
        >
            <template x-for="field in parentFields" :key="sortIteration + '-' + field._uid">
                <div class="mb-2"
                     x-sort:item="field._uid"
                >
                    <div :class="{ 'border border-danger rounded p-2': duplicateKeys.includes(field[activePageConfig.unique_key_property]) }">
                        <div class="px-3 py-2 border rounded bg-light-subtle"
                             :class="{
                                'border-primary': editingField && editingField._uid === field._uid,
                                'border-warning': field.hasOwnProperty('is_active') && !field.is_active,
                             }"
                        >
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="d-flex align-items-center flex-grow-1 c-pointer" @click.prevent="editField(field)">
                                    <span class="c-move me-3 text-muted" x-sort:handle><i class="fa-solid fa-grip-vertical"></i></span>
                                    <i :class="field.icon || getTemplateForField(field)?.icon || 'fa-solid fa-pen-to-square'" class="fa-fw me-2 text-muted"></i>
                                    <a href="#" class="fw-bold text-decoration-none text-body">
                                        <span x-text="field.label"></span>
                                        <span class="ms-2 text-muted small" x-text="'(' + field.type + ')'"></span>
                                    </a>
                                </div>

                                <div class="d-flex align-items-center justify-content-end" style="width: 80px;">
                                    <template x-if="field.hasOwnProperty('is_active') && !field.is_active">
                                        <i class="fas fa-exclamation-triangle text-warning me-2" title="Inactive" data-bs-toggle="tooltip"></i>
                                    </template>
                                    <template x-if="activePageConfig.default_top && parentFields[0]._uid === field._uid">
                                        <i class="fas fa-check-circle me-2 text-primary" title="Default option" data-bs-toggle="tooltip"></i>
                                    </template>
                                    <button class="btn btn-sm btn-icon text-muted" @click.prevent="editField(field)" data-bs-toggle="tooltip" title="Edit Field">
                                        <i class="fa-solid fa-pencil"></i>
                                    </button>
                                    <button class="btn btn-sm btn-icon text-muted hover-text-danger" @click="deleteField(field)" x-show="!field._is_default" data-bs-toggle="tooltip" title="Delete Field">
                                        <i class="fa-solid fa-trash-can"></i>
                                    </button>
                                    <button class="btn btn-sm btn-icon text-muted opacity-25" x-show="field._is_default" data-bs-toggle="tooltip" title="Default field, can't be deleted">
                                        <i class="fa-solid fa-trash-can"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div x-show="duplicateKeys.includes(field[activePageConfig.unique_key_property])" class="text-danger small mt-1 ps-2" x-cloak>
                            Warning: This field key is a duplicate.
                        </div>
                    </div>

                    <template x-if="activePageConfig.nestable || getTemplateForField(field)?.allowed_children">
                        <div class="ms-4 child-fields"
                             x-sort:group="{ name: 'fields' }"
                             x-sort="(item, pos) => handleSort(item, pos, field._uid)"
                        >
                            <template x-for="childField in childFields(field._uid)" :key="sortIteration + '-' + childField._uid">
                                <div class="mt-2" :class="{ 'border border-danger rounded p-2': duplicateKeys.includes(childField[activePageConfig.unique_key_property]) }">
                                    <div class="px-3 py-2 border rounded bg-light-subtle"
                                         :class="{
                                            'border-primary': editingField && editingField._uid === childField._uid,
                                            'border-warning': childField.hasOwnProperty('is_active') && !childField.is_active
                                        }"
                                         x-sort:item="childField._uid"
                                    >
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div class="d-flex align-items-center flex-grow-1 c-pointer" @click.prevent="editField(childField)">
                                                <span class="c-move me-3 text-muted" x-sort:handle><i class="fa-solid fa-grip-vertical"></i></span>
                                                <i :class="childField.icon || getTemplateForField(childField)?.icon || 'fa-solid fa-pen-to-square'" class="fa-fw me-2 text-muted"></i>
                                                <a href="#" class="fw-bold text-decoration-none text-body">
                                                    <span x-text="childField.label"></span>
                                                    <span class="ms-2 text-muted small" x-text="'(' + childField.type + ')'"></span>
                                                </a>
                                            </div>

                                            <div class="d-flex align-items-center justify-content-end" style="width: 80px;">
                                                <template x-if="childField.hasOwnProperty('is_active') && !childField.is_active">
                                                    <i class="fas fa-exclamation-triangle text-warning me-2" title="Inactive" data-bs-toggle="tooltip"></i>
                                                </template>
                                                <button class="btn btn-sm btn-icon text-muted" @click.prevent="editField(childField)" data-bs-toggle="tooltip" title="Edit Field">
                                                    <i class="fa-solid fa-pencil"></i>
                                                </button>
                                                <button class="btn btn-sm btn-icon text-muted hover-text-danger" @click="deleteField(childField)" x-show="!childField._is_default" data-bs-toggle="tooltip" title="Delete Field">
                                                    <i class="fa-solid fa-trash-can"></i>
                                                </button>
                                                <button class="btn btn-sm btn-icon text-muted opacity-25" x-show="childField._is_default"  data-bs-toggle="tooltip" title="Default field, can't be deleted">
                                                    <i class="fa-solid fa-trash-can"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div x-show="duplicateKeys.includes(childField[activePageConfig.unique_key_property])" class="text-danger small mt-1 ps-2" x-cloak>
                                        Warning: This field key is a duplicate.
                                    </div>
                                </div>
                            </template>
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