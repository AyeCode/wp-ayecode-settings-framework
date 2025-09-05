// assets/js/src/app/alpineApp.js

// Small glue-only Alpine component. All real logic lives in /services & /utils.
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
        leftColumnView: 'field_list',
        editingField: null,
        sortIteration: 0,

        // LIFECYCLE
        init() {
            themeSvc.initTheme(this);
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

        // NEW COMPUTED PROPERTIES FOR NESTING
        get parentFields() {
            const fields = this.settings[this.activePageConfig?.id] || [];
            // **THE FIX**: Treat null, undefined, and 0 as root-level items.
            return fields.filter(f => !f._parent_id || f._parent_id == 0);
        },
        childFields(parentId) {
            const fields = this.settings[this.activePageConfig?.id] || [];
            return fields.filter(f => f._parent_id == parentId);
        },

        // METHODS
        toggleTheme()                 { themeSvc.toggleTheme(this); },
        reinitializePlugins()         { pluginsSvc.reinitializePlugins(this); },
        changeView(fn)                { pluginsSvc.changeView(this, fn); },
        goToSearchResult(result)      { searchSvc.goToSearchResult(this, result); },
        goToSection(sectionId, ss='') {
            if (this.activePageConfig?.type === 'form_builder') {
                this.editingField = null;
                this.leftColumnView = 'field_list';
            }
            routerSvc.goToSection(this, sectionId, ss);
        },
        goToCustomLink(link)          { searchSvc.goToCustomLink(this, link); },
        switchSection(sectionId)      {
            if (this.activePageConfig?.type === 'form_builder') {
                this.editingField = null;
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
        shouldShowField(field)        { return cond.shouldShowField(this, field); },

        evaluateCondition(rule)       { return cond.evaluateCondition(this, rule); },
        evaluateSimpleComparison(e)   { return cond.evaluateSimpleComparison(e); },

        renderField(field, modelPrefix = 'settings') {
            return settingsSvc.renderFieldCompat(field, modelPrefix);
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
        addField(optionTemplate) {
            const newField = optionTemplate.fields.reduce((acc, field) => {
                acc[field.id] = field.default !== undefined ? field.default : null;
                return acc;
            }, {});
            newField._uid = 'new_' + Date.now();
            newField.is_new = true;
            newField.template_id = optionTemplate.id;
            newField.fields = optionTemplate.fields;
            newField._template_icon = optionTemplate.icon;
            this.settings[this.activePageConfig.id].push(newField);
            this.editField(newField);
        },
        editField(field) {
            this.editingField = field;
            this.leftColumnView = 'field_settings';
            setTimeout(() => this.reinitializePlugins(), 50);
        },
        deleteField(field) {
            if (!confirm('Are you sure you want to delete this field?')) return;
            let fields = this.settings[this.activePageConfig.id];
            const index = fields.findIndex(f => f._uid === field._uid);
            if (index > -1) {
                fields.splice(index, 1);
            }
            this.settings[this.activePageConfig.id] = fields.filter(f => f._parent_id !== field._uid);
            if (this.editingField && this.editingField._uid === field._uid) {
                this.editingField = null;
                this.leftColumnView = 'field_list';
            }
        },
        handleSort(item, position, parentId = null) {
            const sectionId = this.activePageConfig.id;
            let items = [...this.settings[sectionId]];

            const movedItem = items.find(i => i._uid == item);
            if (!movedItem) return;

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

            // **THE FIX**: When checking for siblings, account for the fact that a root-level parentId might be null or 0.
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