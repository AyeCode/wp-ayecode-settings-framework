// Init action pages + execute actions/pages + state helpers (unchanged)
export function initActionPages(ctx) {
    const initPage = (page) => {
        if (page.type === 'action_page' || page.type === 'import_page' || page.type === 'tool_page') initializeActionPageData(ctx, page);
    };
    ctx.sections.forEach(section => {
        initPage(section);
        section.subsections?.forEach(initPage);
    });
    // pre-init action_button field states
    ctx.allFields.forEach(item => {
        if (item.type === 'field' && item.field.type === 'action_button') {
            if (item.field.toggle_config) {
                const initialState = item.field.has_dummy_data || false;
                ctx.actionStates[item.field.id] = { has_dummy_data: initialState, isLoading: false, message: '', progress: 0, success: null };
                ctx.settings[item.field.id] = initialState;
            } else {
                ctx.actionStates[item.field.id] = { isLoading: false, message: '', progress: 0, success: null };
            }
        }
    });
}

function initializeActionPageData(ctx, pageConfig) {
    const setDefaults = (fields) => {
        if (!Array.isArray(fields)) return;
        fields.forEach(f => {
            if (!f) return;
            if (f.id && ctx.settings[f.id] === undefined && f.default !== undefined) ctx.settings[f.id] = f.default;
            else if (f.id && ctx.settings[f.id] === undefined) ctx.settings[f.id] = '';
            if (f.type === 'group' && f.fields) setDefaults(f.fields);
        });
    };
    setDefaults(pageConfig.fields);

    let initial = { isLoading: false, message: '', progress: 0, success: null, exportedFiles: [] };
    if (pageConfig.type === 'import_page') {
        initial = { ...initial, uploadedFilename: '', uploadProgress: 0, processingProgress: 0, status: 'idle', summary: {} };
    }
    ctx.actionStates[pageConfig.id] = initial;
}

export function resetImportPageState(ctx, pageConfig) {
    const s = ctx.actionStates[pageConfig.id];
    if (!s) return;
    Object.assign(s, { isLoading: false, message: '', progress: 0, success: null, exportedFiles: [], uploadedFilename: '', uploadProgress: 0, processingProgress: 0, status: 'idle', summary: {} });
    pageConfig.fields?.forEach(f => { if (Object.prototype.hasOwnProperty.call(ctx.settings, f.id)) ctx.settings[f.id] = (f.default !== undefined ? f.default : ''); });
}

export function isAnyActionRunning(ctx) {
    return Object.values(ctx.actionStates).some(st => st.isLoading);
}

export async function executePageAction(ctx) {
    const page = ctx.activePageConfig;
    if (!page || !page.ajax_action) { console.error('Action page configuration not found.'); return; }
    const state = ctx.actionStates[page.id];
    state.isLoading = true; state.message = 'Starting...'; state.progress = 0; state.processingProgress = 0; state.success = null; state.exportedFiles = [];
    if (page.type === 'import_page') state.status = 'processing';

    const input = {};
    page.fields?.forEach(f => { if (f.id) input[f.id] = ctx.settings[f.id]; });
    if (page.type === 'import_page') {
        const ps = ctx.actionStates[page.id];
        if (ps?.uploadedFilename) input.import_filename = ps.uploadedFilename;
    }

    const poll = async (step) => {
        try {
            const body = {
                action: window.ayecodeSettingsFramework.tool_ajax_action,
                nonce: window.ayecodeSettingsFramework.tool_nonce,
                tool_action: page.ajax_action,
                step,
                input_data: JSON.stringify(input)
            };
            const res = await fetch(window.ayecodeSettingsFramework.ajax_url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(body) });
            if (!res.ok) throw new Error(`Server responded with status: ${res.status}`);
            const data = await res.json();
            state.success = data.success;
            if (data.data?.message) state.message = data.data.message;
            const progress = data.data?.progress || 0;
            if (data.data?.summary) state.summary = data.data.summary;
            if (page.type === 'import_page') state.processingProgress = progress; else state.progress = progress;
            if (data.success && data.data?.file) state.exportedFiles.push(data.data.file);

            if (data.success && data.data?.next_step !== null && progress < 100) setTimeout(() => poll(data.data.next_step), 20);
            else { state.isLoading = false; if (page.type === 'import_page') state.status = 'complete'; }
        } catch (e) {
            state.success = false; state.message = 'An error occurred. Please check the console and try again.'; state.isLoading = false;
            if (page.type === 'import_page') state.status = 'complete';
            console.error('Page action failed:', e);
        }
    };
    poll(0);
}

export async function executeAction(ctx, fieldId) {
    const item = ctx.allFields.find(f => f.type === 'field' && f.field.id === fieldId);
    if (!item) { console.error('Action button configuration not found for:', fieldId); return; }
    const field = item.field;
    const state = ctx.actionStates[fieldId];

    let ajaxAction;
    if (field.toggle_config) {
        ajaxAction = state.has_dummy_data ? field.toggle_config.remove.ajax_action : field.toggle_config.insert.ajax_action;
    } else {
        ajaxAction = field.ajax_action;
    }
    if (!ajaxAction) { console.error('No ajax_action defined for:', fieldId); return; }

    // Special case: reset_settings uses the built-in handler
    if (ajaxAction === 'reset_settings') {
        state.isLoading = true; state.message = ''; state.progress = 0; state.success = null;
        const success = await ctx.resetSettings();
        state.isLoading = false;
        state.success = success;
        state.message = success ? 'Settings reset successfully!' : 'Reset failed';
        if (success) {
            setTimeout(() => { state.message = ''; state.success = null; }, 8000);
        }
        return;
    }

    state.isLoading = true; state.message = ctx.strings.starting; state.progress = 0; state.success = null;

    const input = {};
    const buttonEl = document.getElementById(fieldId);
    let container = buttonEl?.closest?.('.card-body') || ctx.$refs['action_container_' + fieldId] || null;
    if (container) {
        const inputs = container.querySelectorAll('input, select, textarea');
        inputs.forEach(el => {
            const id = el.getAttribute('data-id') || el.id;
            if (!id) return;
            input[id] = (el.type === 'checkbox') ? el.checked : el.value;
        });
    }

    const poll = async (step) => {
        try {
            const body = {
                action: window.ayecodeSettingsFramework.tool_ajax_action,
                nonce: window.ayecodeSettingsFramework.tool_nonce,
                tool_action: ajaxAction,
                step,
                input_data: JSON.stringify(input)
            };
            const res = await fetch(window.ayecodeSettingsFramework.ajax_url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(body) });
            if (!res.ok) throw new Error(`Server responded with an error: ${res.status}`);
            const data = await res.json();
            state.success = data.success;
            if (data.data?.message) state.message = data.data.message;
            if (data.data?.progress) state.progress = data.data.progress;

            if (data.success && data.data?.next_step !== null && data.data?.progress < 100) {
                setTimeout(() => poll(data.data.next_step), 20);
            } else {
                state.isLoading = false;
                if (data.success && field.toggle_config) {
                    state.has_dummy_data = !state.has_dummy_data;
                    ctx.settings[fieldId] = state.has_dummy_data;
                }
                if (state.success) {
                    setTimeout(() => { state.message = ''; state.success = null; }, 8000);
                }
            }
        } catch (e) {
            state.success = false; state.message = ctx.strings.something_went_wrong; state.isLoading = false;
            console.error('Action failed:', e);
        }
    };
    poll(0);
}
