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
            settingsSvc.loadSettings(this);
            configSvc.flattenAllFields(this);

            this.sections.forEach(section => {
                if (section.type === 'form_builder') {
                    if (!Array.isArray(this.settings[section.id])) {
                        this.settings[section.id] = [];
                    }

                    const templates = section.templates.flatMap(g => g.options);
                    this.settings[section.id].forEach(savedField => {
                        const template = templates.find(t => t.fields.find(f => f.id === 'type' && f.default === savedField.type));
                        if (template) {
                            savedField.fields = template.fields;
                        }
                    });
                }
            });

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

        // METHODS
        toggleTheme()                 { themeSvc.toggleTheme(this); },
        reinitializePlugins()         { pluginsSvc.reinitializePlugins(this); },
        changeView(fn)                { pluginsSvc.changeView(this, fn); },
        goToSearchResult(result)      { searchSvc.goToSearchResult(this, result); },
        goToSection(sectionId, ss='') {
            // If leaving a form builder, reset its state
            if (this.activePageConfig?.type === 'form_builder') {
                this.editingField = null;
                this.leftColumnView = 'field_list';
            }
            routerSvc.goToSection(this, sectionId, ss);
        },
        goToCustomLink(link)          { searchSvc.goToCustomLink(this, link); },
        switchSection(sectionId)      {
            // If leaving a form builder, reset its state
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

        // ** RESTORED FUNCTIONS **
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
        addField(optionTemplate, parentField = null) {
            // Create a new field object from the template's fields array
            const newField = optionTemplate.fields.reduce((acc, field) => {
                acc[field.id] = field.default !== undefined ? field.default : null;
                return acc;
            }, {});

            newField._uid = Date.now();
            newField.fields = optionTemplate.fields; // Keep a reference to the schema

            const targetArray = parentField ? parentField.fields : this.settings[this.activePageConfig.id];
            targetArray.push(newField);

            this.editField(newField);
        },
        editField(field) {
            this.editingField = field;
            this.leftColumnView = 'field_settings';
        },
        deleteField(field, parentField = null) {
            if (!confirm('Are you sure you want to delete this field?')) return;
            const targetArray = parentField ? parentField.fields : this.settings[this.activePageConfig.id];
            const index = targetArray.findIndex(f => f._uid === field._uid);
            if (index > -1) {
                targetArray.splice(index, 1);
            }
            if (this.editingField && this.editingField._uid === field._uid) {
                this.editingField = null;
                this.leftColumnView = 'field_list';
            }
        },
        handleSort(item, position) {
            const sectionId = this.activePageConfig.id;
            let items = [...this.settings[sectionId]];

            const movedItem = items.find(i => i._uid == item);
            if (!movedItem) return;

            const oldIndex = items.indexOf(movedItem);
            if (oldIndex === -1) return;

            // Remove the item from its old position and insert it into the new one
            items.splice(oldIndex, 1);
            items.splice(position, 0, movedItem);

            // Re-assign the entire array to ensure Alpine's reactivity is triggered
            this.settings[sectionId] = items;

            // Force a re-render by updating the iteration key
            this.sortIteration++;
        },
        findPageConfigById(id, secs)  { return findUtil.findPageConfigById(id, secs); },
        showNotification(msg, type)   { notifySvc.showNotification(this, msg, type); },
    };
}