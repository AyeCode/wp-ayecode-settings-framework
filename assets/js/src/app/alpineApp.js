// assets/js/src/app/alpineApp.js

import * as configSvc from '@/services/config';
import * as settingsSvc from '@/services/settings';
import * as routerSvc from '@/services/hashRouter';
import * as searchSvc from '@/services/search';
import * as actionsSvc from '@/services/actions';
import * as uploadsSvc from '@/services/uploads';
import * as customPageSvc from '@/services/customPage';
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
            console.log('AyeCode Settings Framework initialized');
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
            if (!uniqueKeyProp) {
                return [];
            }
            const allFields = this.settings[this.activePageConfig.id] || [];
            const keyCounts = allFields.reduce((acc, field) => {
                const key = field[uniqueKeyProp];
                if (key) {
                    acc[key] = (acc[key] || 0) + 1;
                }
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
            if (!this.activePageConfig || this.activePageConfig.type !== 'form_builder' || !this.editingField?._uid) {
                return [];
            }
            const allFields = this.settings[this.activePageConfig.id] || [];
            return allFields
                .filter(f => f._uid !== this.editingField._uid)
                .map(f => ({
                    label: f.label,
                    value: f.key || f.htmlvar_name || f._uid,
                    _uid: f._uid
                }));
        },

        // METHODS
        toggleTheme()                 { themeSvc.toggleTheme(this); },
        reinitializePlugins()         { pluginsSvc.reinitializePlugins(this); },
        changeView(fn)                { pluginsSvc.changeView(this, fn); },
        goToSearchResult(result)      { searchSvc.goToSearchResult(this, result); },
        goToSection(sectionId, ss='') {
            if (this.activePageConfig?.type === 'form_builder') {
                this.editingField = window.__ASF_NULL_FIELD;
                this.leftColumnView = 'field_list';
            }
            routerSvc.goToSection(this, sectionId, ss);
        },
        goToCustomLink(link)          { searchSvc.goToCustomLink(this, link); },
        switchSection(sectionId)      {
            if (this.activePageConfig?.type === 'form_builder') {
                this.editingField = window.__ASF_NULL_FIELD;
                this.leftColumnView = 'field_list';
            }
            routerSvc.switchSection(this, sectionId);
        },
        switchSubsection(ssId)        { routerSvc.switchSubsection(this, ssId); },
        highlightField(fieldId)       { highlight.highlightField(this, fieldId); },
        handleUrlHash()               { routerSvc.handleUrlHash(this); },
        updateUrlHash(fieldId=null)   { routerSvc.updateUrlHash(this, fieldId); },
        setInitialSection()           { routerSvc.setInitialSection(this); },
        async saveSettings()          { await settingsSvc.saveSettings(this); },
        discardChanges()              { settingsSvc.discardChanges(this); },
        shouldShowField(field) {
            const context = this.editingField && this.editingField._uid ? this.editingField : this.settings;
            return cond.shouldShowField(context, field);
        },

        evaluateCondition(rule)       { return cond.evaluateCondition(this, rule); },
        evaluateSimpleComparison(e)   { return cond.evaluateSimpleComparison(e); },

        renderField(field, modelPrefix = 'settings', pageConfig = null) {
            if (!field || typeof field !== 'object' || !field.type) {
                console.warn('[ASF] renderField: skipped invalid schema', field);
                return '';
            }
            const configToUse = pageConfig || this.activePageConfig;
            return settingsSvc.renderFieldCompat(field, modelPrefix, configToUse);
        },
        selectImage(fieldId)          { mediaSvc.selectImage(this, fieldId); },
        removeImage(fieldId)          { mediaSvc.removeImage(this, fieldId); },
        initGdMap(fieldId, lat, lng)  { mapsSvc.initGdMap(this, fieldId, lat, lng); },
        initChoice(fieldId)           { pluginsSvc.initChoice(this, fieldId); },
        initChoices(fieldId)          { pluginsSvc.initChoices(this, fieldId); },
        async executePageAction()     { await actionsSvc.executePageAction(this); },
        async executeAction(fieldId)  { await actionsSvc.executeAction(this, fieldId); },
        handleFileUpload(e, pid, h)   { uploadsSvc.handleFileUpload(this, e, pid, h); },
        async removeUploadedFile(pid, h) { await uploadsSvc.removeUploadedFile(this, pid, h); },
        async loadCustomPageContent(id){ await customPageSvc.loadCustomPageContent(this, id); },

        // Form Builder Methods
        async saveForm() {
            await settingsSvc.saveFormBuilder(this);
        },

        countFieldsByTemplateId(optionTemplate) {
            const allFields = this.settings[this.activePageConfig.id] || [];
            const idToCheck = (optionTemplate.defaults && optionTemplate.defaults.field_type_key)
                ? optionTemplate.defaults.field_type_key
                : (optionTemplate.base_id || optionTemplate.id);

            return allFields.filter(field => {
                const keyToCompare = field.field_type_key || field.template_id;
                return keyToCompare === idToCheck;
            }).length;
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

            const buildFieldData = (fields) => {
                return fields.reduce((acc, field) => {
                    if (field.id) {
                        acc[field.id] = field.default !== undefined ? field.default : null;
                    }
                    if (field.type === 'group' && field.fields) {
                        Object.assign(acc, buildFieldData(field.fields));
                    }
                    if (field.type === 'accordion' && field.fields) {
                        field.fields.forEach(panel => {
                            if (panel.fields) {
                                Object.assign(acc, buildFieldData(panel.fields));
                            }
                        });
                    }
                    return acc;
                }, {});
            };

            const newField = buildFieldData(actualTemplate.fields);
            newField._uid = 'new_' + Date.now();
            newField.is_new = true;
            newField.template_id = actualTemplate.id;
            newField.fields = actualTemplate.fields;
            newField._template_icon = actualTemplate.icon;

            if (defaultsToApply) {
                for (const key in defaultsToApply) {
                    if (Object.prototype.hasOwnProperty.call(newField, key)) {
                        newField[key] = defaultsToApply[key];
                    }
                }
            }

            this.settings[this.activePageConfig.id].push(newField);
            this.editField(newField);
        },
        editField(field) {
            document.querySelector('.tooltip')?.remove();

            if (!field.conditions) {
                field.conditions = [];
            }
            if (this.editingField && this.editingField._uid && this.editingField._uid !== field._uid) {
                this.leftColumnView = 'field_list';
                this.editingField = window.__ASF_NULL_FIELD;

                this.$nextTick(() => {
                    this.editingField = field;
                    this.leftColumnView = 'field_settings';
                    this.$nextTick(() => this.reinitializePlugins());
                });
            } else {
                this.editingField = field;
                this.leftColumnView = 'field_settings';
                this.$nextTick(() => this.reinitializePlugins());
            }
        },
        deleteField(field) {
            if (field._is_default) {
                alert('This is a default field and cannot be deleted.');
                return;
            }
            if (!confirm('Are you sure you want to delete this field?')) return;
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

            // --- START: UNIFIED VALIDATION LOGIC ---
            if (parentId) {
                const parentField = items.find(i => i._uid == parentId);
                const parentTemplate = this.getTemplateForField(parentField);
                const movedItemTemplate = this.getTemplateForField(movedItem);

                // Check for field-specific rules first
                if (parentTemplate && parentTemplate.allowed_children) {
                    // This is the fix: check for the wildcard '*'
                    if (parentTemplate.allowed_children[0] !== '*' && (!movedItemTemplate || !parentTemplate.allowed_children.includes(movedItemTemplate.id))) {
                        alert(`A "${movedItemTemplate?.title}" field cannot be placed inside a "${parentTemplate.title}".`);
                        this.sortIteration++; // Force re-render
                        return;
                    }
                }
                // If no specific rules, fall back to the global 'nestable' check
                else if (!this.activePageConfig.nestable) {
                    alert('Nesting is not enabled for this field.');
                    this.sortIteration++; // Force re-render
                    return;
                }
            }
            // --- END: UNIFIED VALIDATION LOGIC ---

            if (parentId !== null) {
                const hasChildren = items.some(i => i._parent_id === movedItem._uid);
                if (hasChildren) {
                    alert('Items that already have children cannot be nested.');
                    this.sortIteration++;
                    return;
                }
            }

            movedItem._parent_id = parentId;

            const oldIndex = items.indexOf(movedItem);
            items.splice(oldIndex, 1);

            const targetSiblings = items.filter(i => {
                const targetParentId = parentId === null ? 0 : parentId;
                const itemParentId = i._parent_id === null ? 0 : i._parent_id;
                return itemParentId == targetParentId;
            });

            let newIndex;

            if (position >= targetSiblings.length) {
                const lastSibling = targetSiblings.length > 0 ? targetSiblings[targetSiblings.length - 1] : null;
                if (lastSibling) {
                    const lastSiblingIndex = items.indexOf(lastSibling);
                    const lastChildIndex = items.findLastIndex(i => i._parent_id === lastSibling._uid);
                    newIndex = lastChildIndex !== -1 ? lastChildIndex + 1 : lastSiblingIndex + 1;
                } else if (parentId) {
                    newIndex = items.findIndex(i => i._uid === parentId) + 1;
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
            this.editingField.conditions.push({
                action: '',
                field: '',
                condition: '',
                value: ''
            });
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