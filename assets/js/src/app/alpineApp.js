// assets/js/src/app/alpineApp.js

import * as configSvc from '@/services/config';
import * as settingsSvc from '@/services/settings';
import * as routerSvc from '@/services/hashRouter';
import * as searchSvc from '@/services/search';
import * as actionsSvc from '@/services/actions';
import * as uploadsSvc from '@/services/uploads';
import * as customPageSvc from '@/services/customPage';
import * as extensionPageSvc from '@/services/extensionPage'; // <-- Import the new service
import * as notifySvc from '@/services/notifications';
import * as themeSvc from '@/services/theme';
import * as pluginsSvc from '@/services/plugins';
import * as mediaSvc from '@/services/media';
import * as mapsSvc from '@/services/maps';
import * as cond from '@/utils/conditions';
import * as highlight from '@/utils/highlight';
import * as findUtil from '@/utils/find';

window.__ASF_NULL_FIELD = new Proxy({}, {
    get: (target, prop) => {
        if (prop === 'hasOwnProperty') return (key) => Object.prototype.hasOwnProperty.call(target, key);
        return '';
    },
    has: () => true,
});

// Helper function for addField
function buildFieldData(fields) {
    return fields.reduce((acc, field) => {
        if (field.id) acc[field.id] = field.default !== undefined ? field.default : null;
        if (field.type === 'group' && field.fields) Object.assign(acc, buildFieldData(field.fields));
        if (field.type === 'accordion' && field.fields) field.fields.forEach(panel => {
            if (panel.fields) Object.assign(acc, buildFieldData(panel.fields));
        });
        return acc;
    }, {});
};


export default function alpineApp() {
    return {
        // STATE
        config: window.ayecodeSettingsFramework?.config || {},
        originalSettings: {},
        settings: {},
        strings: window.ayecodeSettingsFramework?.strings || {},
        imagePreviews: {},
        originalImagePreviews: {},
        currentSection: '',
        currentSubsection: '',
        searchQuery: '',
        isLoading: false,
        sidebarOpen: false,
        theme: 'light',
        isChangingView: false,
        searchModalEl: null,
        searchModal: null,
        allFields: [],
        customSearchLinks: [],
        sections: [],
        actionStates: {},
        isContentLoading: false,
        loadedContentCache: {},
        accordionStates: {},
        leftColumnView: 'field_list',
        editingField: null,
        sortIteration: 0,
        activeSyncListeners: [],
        initialTargetValues: {},
        isValidating: false,
        lastEditFieldCall: 0,

        // LIFECYCLE
        init() {
            themeSvc.initTheme(this);
            this.editingField = window.__ASF_NULL_FIELD;
            this.customSearchLinks = window.ayecodeSettingsFramework?.custom_search_links || [];
            configSvc.loadConfiguration(this);

            this.settings = window.ayecodeSettingsFramework?.settings || {};
            this.imagePreviews = window.ayecodeSettingsFramework?.image_previews || {};

            configSvc.flattenAllFields(this);

            this.sections.forEach(section => {
                if (section.type === 'form_builder') {
                    if (!Array.isArray(this.settings[section.id])) {
                        this.settings[section.id] = [];
                    }

                    const templates = section.templates.flatMap(g => g.options);
                    this.settings[section.id].forEach(savedField => {
                        const template = templates.find(t => t.id === savedField.template_id);
                        if (template) {
                            savedField.fields = template.fields;
                            savedField._template_icon = template.icon;

                            template.fields.forEach(fieldSchema => {
                                if (savedField[fieldSchema.id] === undefined && fieldSchema.default !== undefined) {
                                    savedField[fieldSchema.id] = fieldSchema.default;
                                }
                                if (fieldSchema.type === 'toggle' && savedField[fieldSchema.id] === true) {
                                    savedField[fieldSchema.id] = 1;
                                }
                            });
                        }
                    });
                }
            });

            this.originalSettings = JSON.parse(JSON.stringify(this.settings));
            this.originalImagePreviews = JSON.parse(JSON.stringify(this.imagePreviews));

            actionsSvc.initActionPages(this);
            routerSvc.handleUrlHash(this);
            searchSvc.setupSearchModal(this);
            pluginsSvc.setupEventListeners(this);
            pluginsSvc.reinitializePlugins(this);

            this.$watch('leftColumnView', (newValue, oldValue) => {
                if (newValue === 'field_list' && oldValue === 'field_settings') {
                    this.clearSyncListeners();
                }
            });
        },

        // COMPUTEDS
        get activePageConfig()      { return routerSvc.activePageConfig(this); },
        get hasUnsavedChanges()     { return settingsSvc.hasUnsavedChanges(this); },
        get currentSectionData()    { return routerSvc.currentSectionData(this); },
        get currentSubsectionData() { return routerSvc.currentSubsectionData(this); },
        get isSettingsPage()        { return settingsSvc.isSettingsPage(this); },
        get isActionRunning()       { return actionsSvc.isAnyActionRunning(this); },
        get groupedSearchResults()  { return searchSvc.groupedSearchResults(this); },


        get duplicateKeys() {
            const uniqueKeyProp = this.activePageConfig?.unique_key_property;
            if (!uniqueKeyProp) return [];
            const allFields = this.settings[this.activePageConfig.id] || [];
            const keyCounts = allFields.reduce((acc, field) => {
                const key = field[uniqueKeyProp];
                if (key) acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {});
            return Object.keys(keyCounts).filter(key => keyCounts[key] > 1);
        },
        get parentFields() {
            const fields = this.settings[this.activePageConfig?.id] || [];
            return fields.filter(f => !f._parent_id || f._parent_id == 0);
        },
        childFields(parentId) {
            const fields = this.settings[this.activePageConfig?.id] || [];
            return fields.filter(f => f._parent_id == parentId);
        },
        get otherFields() {
            if (!this.activePageConfig || this.activePageConfig.type !== 'form_builder' || !this.editingField?._uid) return [];
            const allFields = this.settings[this.activePageConfig.id] || [];
            return allFields
                .filter(f => f._uid !== this.editingField._uid)
                .map(f => ({
                    label: f.label,
                    value: f.key || f.htmlvar_name || f._uid,
                    _uid: f._uid
                }));
        },

        /**
         * Shows a custom modal with three choices: Save, Discard, Cancel.
         * @returns {Promise<string>} A promise that resolves to 'save', 'discard', or 'cancel'.
         */
        confirmWithThreeButtons() {
            return new Promise(resolve => {
                // Make the resolve function globally accessible for the inline onclick handlers.
                // This function will handle both resolving the promise and closing the modal.
                window.asfConfirmResolve = (choice) => {
                    const modalEl = document.querySelector('.aui-modal.show'); // Find the currently visible modal
                    if (modalEl) {
                        const modalInstance = bootstrap.Modal.getInstance(modalEl);
                        if (modalInstance) {
                            // Hide the modal using the correct Bootstrap API
                            modalInstance.hide();
                        }
                    }
                    resolve(choice);
                };

                const body = `
                    <h3 class='h4 py-3 text-center text-dark'>You have unsaved changes.</h3>
                    <p class='text-center text-muted'>What would you like to do?</p>
                    <div class='d-flex justify-content-center mt-4'>
                        <button class='btn btn-outline-secondary w-100 me-2' onclick='window.asfConfirmResolve("cancel")'>Cancel</button>
                        <button class='btn btn-danger w-100 me-2' onclick='window.asfConfirmResolve("discard")'>Discard</button>
                        <button class='btn btn-primary w-100' onclick='window.asfConfirmResolve("save")'>Save & Continue</button>
                    </div>
                `;
                aui_modal('', body, '', false, '', '');
            });
        },

        /**
         * Central navigation handler. Checks for unsaved changes before proceeding.
         * @param {Function} navigationAction The function to execute to change the view.
         */
        async navigateTo(navigationAction) {
            if (this.hasUnsavedChanges) {
                const userChoice = await this.confirmWithThreeButtons();

                if (userChoice === 'save') {
                    const saveSuccess = this.activePageConfig.type === 'form_builder'
                        ? await this.saveForm()
                        : await this.saveSettings();

                    if (saveSuccess) {
                        navigationAction();
                    } else {
                        this.showNotification('Save failed. Navigation cancelled.', 'error');
                    }
                } else if (userChoice === 'discard') {
                    this.discardChanges(false); // Pass false to skip native confirm
                    navigationAction();
                }
                // If 'cancel', do nothing.

            } else {
                navigationAction();
            }
        },

        toggleTheme() { themeSvc.toggleTheme(this); },
        reinitializePlugins() { pluginsSvc.reinitializePlugins(this); },
        changeView(fn) { pluginsSvc.changeView(this, fn); },

        // --- Refactored Navigation Methods ---
        goToSearchResult(result) {
            this.navigateTo(() => searchSvc.goToSearchResult(this, result));
        },
        goToSection(sectionId, ss = '') {
            this.navigateTo(() => {
                if (this.activePageConfig?.type === 'form_builder') {
                    this.editingField = window.__ASF_NULL_FIELD;
                    this.leftColumnView = 'field_list';
                }
                routerSvc.goToSection(this, sectionId, ss);
            });
        },
        goToCustomLink(link) {
            this.navigateTo(() => searchSvc.goToCustomLink(this, link));
        },
        switchSection(sectionId) {
            this.navigateTo(() => {
                if (this.activePageConfig?.type === 'form_builder') {
                    this.editingField = window.__ASF_NULL_FIELD;
                    this.leftColumnView = 'field_list';
                }
                routerSvc.switchSection(this, sectionId);
            });
        },
        switchSubsection(ssId) {
            this.navigateTo(() => routerSvc.switchSubsection(this, ssId));
        },

        highlightField(fieldId) { highlight.highlightField(this, fieldId); },
        handleUrlHash() { routerSvc.handleUrlHash(this); },
        updateUrlHash(fieldId = null) { routerSvc.updateUrlHash(this, fieldId); },
        setInitialSection() { routerSvc.setInitialSection(this); },

        async saveSettings() {
            return await settingsSvc.saveSettings(this);
        },
        async discardChanges(useConfirm = true) {
            await settingsSvc.discardChanges(this, useConfirm);
        },

        shouldShowField(field) {
            const context = this.editingField && this.editingField._uid ? this.editingField : this.settings;
            return cond.shouldShowField(context, field);
        },
        evaluateCondition(rule) { return cond.evaluateCondition(this, rule); },
        evaluateSimpleComparison(e) { return cond.evaluateSimpleComparison(e); },
        renderField(field, modelPrefix = 'settings', pageConfig = null) {
            if (!field || typeof field !== 'object' || !field.type) return '';
            const configToUse = pageConfig || this.activePageConfig;
            return settingsSvc.renderFieldCompat(field, modelPrefix, configToUse);
        },
        selectImage(fieldId) { mediaSvc.selectImage(this, fieldId); },
        removeImage(fieldId) { mediaSvc.removeImage(this, fieldId); },
        initGdMap(fieldId, lat, lng) { mapsSvc.initGdMap(this, fieldId, lat, lng); },
        initChoice(fieldId) { pluginsSvc.initChoice(this, fieldId); },
        initChoices(fieldId) { pluginsSvc.initChoices(this, fieldId); },
        async executePageAction() { await actionsSvc.executePageAction(this); },
        async executeAction(fieldId) { await actionsSvc.executeAction(this, fieldId); },
        handleFileUpload(e, pid, h) { uploadsSvc.handleFileUpload(this, e, pid, h); },
        async removeUploadedFile(pid, h) { await uploadsSvc.removeUploadedFile(this, pid, h); },
        async loadCustomPageContent(id) { await customPageSvc.loadCustomPageContent(this, id); },
        async loadExtensions(section) { await extensionPageSvc.loadExtensions(this, section); }, // <-- Add the new method

        // Form Builder Methods
        async saveForm() {
            if (this.leftColumnView === 'field_settings' && !this.validateEditingField()) {
                return false;
            }

            const sectionId = this.activePageConfig.id;
            const items = this.settings[sectionId] || [];
            items.forEach(f => {
                const parent = (f._parent_id === null || f._parent_id === undefined) ? 0 : f._parent_id;
                f._parent_id = parent;
                if ('tab_parent' in f) f.tab_parent = parent;
                if ('tab_level' in f) f.tab_level = parent ? 1 : 0;
            });
            return await settingsSvc.saveFormBuilder(this);
        },

        countFieldsByTemplateId(optionTemplate) {
            const allFields = this.settings[this.activePageConfig.id] || [];
            const idToCheck = (optionTemplate.defaults && optionTemplate.defaults.field_type_key) ? optionTemplate.defaults.field_type_key : (optionTemplate.base_id || optionTemplate.id);
            return allFields.filter(field => (field.field_type_key || field.template_id) === idToCheck).length;
        },

        handleFieldClick(option) {
            if (option.limit && this.countFieldsByTemplateId(option) >= option.limit) {
                window.aui_toast?.('asf-limit-reached', 'error', 'This field is single use only and is already being used.');
                return;
            }
            this.addField(option);
        },

        addField(optionTemplate) {
            let actualTemplate = optionTemplate;
            let defaultsToApply = null;

            if (optionTemplate.base_id) {
                const allTemplates = this.activePageConfig.templates.flatMap(g => g.options);
                actualTemplate = allTemplates.find(t => t.id === optionTemplate.base_id);
                if (!actualTemplate) {
                    alert(`Error: Base template with id '${optionTemplate.base_id}' could not be found.`);
                    return;
                }
                defaultsToApply = optionTemplate.defaults || {};
            }

            // --- THE FIX: Deep clone all data to prevent shared references ---
            const newField = JSON.parse(JSON.stringify(buildFieldData(actualTemplate.fields)));

            newField._uid = 'new_' + Date.now();
            newField.is_new = true;
            newField.template_id = actualTemplate.id;
            newField.fields = JSON.parse(JSON.stringify(actualTemplate.fields)); // Deep clone schema
            newField._template_icon = actualTemplate.icon;
            newField._parent_id = 0;
            if ('tab_parent' in newField) newField.tab_parent = 0;
            if ('tab_level' in newField) newField.tab_level = 0;

            if (defaultsToApply) {
                for (const key in defaultsToApply) {
                    if (Object.prototype.hasOwnProperty.call(newField, key)) {
                        newField[key] = JSON.parse(JSON.stringify(defaultsToApply[key])); // Deep clone defaults
                    }
                }
            }

            const uniqueKeyProp = this.activePageConfig?.unique_key_property;
            if (uniqueKeyProp && newField[uniqueKeyProp]) {
                const allFields = this.settings[this.activePageConfig.id] || [];
                let newKey = newField[uniqueKeyProp];
                let counter = 2;
                while (allFields.some(f => f[uniqueKeyProp] === newKey)) {
                    newKey = `${newField[uniqueKeyProp]}${counter}`;
                    counter++;
                }
                newField[uniqueKeyProp] = newKey;
            }

            this.settings[this.activePageConfig.id].push(newField);
            this._internalEditField(newField);
        },


        slugify(str) {
            return String(str).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '_').replace(/-+/g, '_');
        },

        findSchemaById(fields, id) {
            for (const field of fields) {
                if (field.id === id) return field;
                if (field.fields) {
                    const found = this.findSchemaById(field.fields, id);
                    if (found) return found;
                }
            }
            return null;
        },

        validateEditingField() {
            if (this.isValidating) {
                return true;
            }
            this.isValidating = true;

            try {
                if (!this.editingField || !this.editingField.fields) return true;

                const settingsPane = document.getElementById('asf-field-settings');
                if (settingsPane) {
                    settingsPane.querySelectorAll('.asf-field-error').forEach(el => el.classList.remove('asf-field-error'));
                }

                const recursiveValidate = (fields) => {
                    for (const fieldSchema of fields) {
                        if (fieldSchema.extra_attributes?.required) {
                            const value = this.editingField[fieldSchema.id];
                            if (value === '' || value === null || value === undefined) {
                                this.showNotification(`Error: The "${fieldSchema.label || fieldSchema.id}" field is required.`, 'error');
                                this.$nextTick(() => {
                                    const invalidEl = document.getElementById(fieldSchema.id);
                                    if (invalidEl) {
                                        const accordionCollapse = invalidEl.closest('.accordion-collapse');
                                        if (accordionCollapse && !accordionCollapse.classList.contains('show')) {
                                            const bsCollapse = new bootstrap.Collapse(accordionCollapse);
                                            bsCollapse.show();
                                        }

                                        const wrapper = invalidEl.closest('.row');
                                        if (wrapper) {
                                            wrapper.classList.add('asf-field-error');
                                            wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            setTimeout(() => {
                                                wrapper.classList.remove('asf-field-error');
                                            }, 3500);
                                        }
                                    }
                                });
                                return false;
                            }
                        }
                        if (fieldSchema.fields && Array.isArray(fieldSchema.fields)) {
                            if (!recursiveValidate(fieldSchema.fields)) {
                                return false;
                            }
                        }
                    }
                    return true;
                };

                return recursiveValidate(this.editingField.fields);
            } finally {
                this.isValidating = false;
            }
        },

        _internalEditField(field) {
            const now = performance.now();
            if (now - this.lastEditFieldCall < 100) return;
            this.lastEditFieldCall = now;

            if (this.editingField?._uid === field._uid) return;

            if (this.editingField && this.editingField._uid && this.editingField._uid !== field._uid) {
                this.clearSyncListeners();
                if (!this.validateEditingField()) {
                    this.$nextTick(() => this.setupWatchersForField(this.editingField));
                    return;
                }
            } else {
                this.clearSyncListeners();
            }

            this.editingField = window.__ASF_NULL_FIELD;
            this.leftColumnView = 'field_list';

            this.$nextTick(() => {
                const template = this.getTemplateForField(field);
                if (template) field.fields = template.fields;

                document.querySelector('.tooltip')?.remove();
                this.initialTargetValues = {};
                this.editingField = field;
                this.leftColumnView = 'field_settings';

                this.$nextTick(() => {
                    this.reinitializePlugins();
                });
            });
        },

        editField(field) {
            if (this.activePageConfig.type === 'form_builder' && this.hasUnsavedChanges) {
                this._internalEditField(field);
            } else {
                this.navigateTo(() => this._internalEditField(field));
            }
        },

        handleFocusSync(sourceFieldId) {
            if (!this.editingField || !this.editingField.fields) return;

            const field = this.editingField;
            const sourceFieldSchema = this.findSchemaById(field.fields, sourceFieldId);

            if (!sourceFieldSchema || !sourceFieldSchema.syncs_with) return;

            // Check if source field is empty
            const sourceValue = field[sourceFieldId];
            if (sourceValue && String(sourceValue).trim() !== '') {
                return;
            }

            // Check if all target fields are also empty
            const allTargetsEmpty = sourceFieldSchema.syncs_with.every(rule => {
                const targetValue = field[rule.target];
                return !targetValue || String(targetValue).trim() === '';
            });

            if (!allTargetsEmpty) {
                return;
            }

            // If all conditions are met, set up a temporary watcher
            const unwatch = this.$watch(`editingField.${sourceFieldId}`, (newValue) => {
                sourceFieldSchema.syncs_with.forEach(rule => {
                    const transformedValue = rule.transform === 'slugify' ? this.slugify(newValue) : newValue;
                    this.editingField[rule.target] = transformedValue;
                });
            });

            // Store the watcher cleanup function to be called when the editor closes.
            this.activeSyncListeners.push(unwatch);
        },

        clearSyncListeners() {
            while (this.activeSyncListeners.length > 0) {
                const unwatch = this.activeSyncListeners.pop();
                if (typeof unwatch === 'function') {
                    try {
                        unwatch();
                    } catch (e) {
                        console.error('Error clearing watcher:', e);
                    }
                }
            }
        },

        closeEditingField() {
            if (this.validateEditingField()) {
                this.clearSyncListeners();
                this.leftColumnView = 'field_list';
                this.$nextTick(() => {
                    this.editingField = window.__ASF_NULL_FIELD;
                });
            }
        },

        async deleteField(field) {
            if (field._is_default) {
                alert('This is a default field and cannot be deleted.');
                return;
            }

            const confirmed = await aui_confirm('Are you sure you want to delete this field?', 'Delete Field', 'Cancel', true);
            if (!confirmed) return;

            let fields = this.settings[this.activePageConfig.id];
            const index = fields.findIndex(f => f._uid === field._uid);
            if (index > -1) {
                fields.splice(index, 1);
            }

            this.settings[this.activePageConfig.id] = fields.filter(f => f._parent_id !== field._uid);

            if (this.editingField && this.editingField._uid === field._uid) {
                this.editingField = window.__ASF_NULL_FIELD;
                this.leftColumnView = 'field_list';
            }
        },

        handleSort(item, position, parentId = null) {
            const sectionId = this.activePageConfig.id;
            let items = [...this.settings[sectionId]];
            const movedItem = items.find(i => i._uid == item);

            if (!movedItem) return;

            if (parentId) {
                const parentField = items.find(i => i._uid == parentId);
                const parentTemplate = this.getTemplateForField(parentField);
                const movedItemTemplate = this.getTemplateForField(movedItem);

                if (parentTemplate && parentTemplate.allowed_children) {
                    if (parentTemplate.allowed_children[0] !== '*' && (!movedItemTemplate || !parentTemplate.allowed_children.includes(movedItemTemplate.id))) {
                        alert(`A "${movedItemTemplate?.title}" field cannot be placed inside a "${parentTemplate.title}".`);
                        this.sortIteration++;
                        return;
                    }
                } else if (!this.activePageConfig.nestable) {
                    alert('Nesting is not enabled for this field.');
                    this.sortIteration++;
                    return;
                }
            }

            if (parentId !== null && items.some(i => i._parent_id === movedItem._uid)) {
                alert('Items that already have children cannot be nested.');
                this.sortIteration++;
                return;
            }

            const newParent = (parentId === null ? 0 : parentId);
            movedItem._parent_id = newParent;
            if ('tab_parent' in movedItem) movedItem.tab_parent = newParent;
            if ('tab_level' in movedItem) movedItem.tab_level = newParent ? 1 : 0;

            const oldIndex = items.indexOf(movedItem);
            items.splice(oldIndex, 1);

            const targetSiblings = items.filter(i => (i._parent_id === null ? 0 : i._parent_id) == newParent);
            let newIndex;

            if (position >= targetSiblings.length) {
                const lastSibling = targetSiblings.length > 0 ? targetSiblings[targetSiblings.length - 1] : null;
                if (lastSibling) {
                    const lastSiblingIndex = items.indexOf(lastSibling);
                    const lastChildIndex = items.findLastIndex ? items.findLastIndex(i => i._parent_id === lastSibling._uid) : -1;
                    newIndex = lastChildIndex !== -1 ? lastChildIndex + 1 : lastSiblingIndex + 1;
                } else if (newParent) {
                    newIndex = items.findIndex(i => i._uid === newParent) + 1;
                } else {
                    newIndex = items.length;
                }
            } else {
                const sibling = targetSiblings[position];
                newIndex = items.indexOf(sibling);
            }

            items.splice(newIndex, 0, movedItem);
            this.settings[sectionId] = items;
            this.sortIteration++;
        },

        addCondition() {
            if (!this.editingField.conditions) {
                this.editingField.conditions = [];
            }
            this.editingField.conditions.push({ action: '', field: '', condition: '', value: '' });
        },
        removeCondition(index) {
            this.editingField.conditions.splice(index, 1);
        },
        getTemplateForField(field) {
            if (!field || !field.template_id) return null;
            const section = this.activePageConfig;
            if (section && section.templates) {
                const templates = section.templates.flatMap(g => g.options);
                return templates.find(t => t.id === field.template_id);
            }
            return null;
        },
        findPageConfigById(id, secs)  { return findUtil.findPageConfigById(id, secs); },
        showNotification(msg, type)   { notifySvc.showNotification(this, msg, type); },
    };
}