export function handleFileUpload(ctx, event, pageId, hiddenFieldName) {
    const state = ctx.actionStates[pageId];
    const file = event.dataTransfer ? event.dataTransfer.files[0] : event.target.files[0];
    if (!file) return;
    const pageConfig = ctx.findPageConfigById(pageId, ctx.sections);
    const accepted = pageConfig?.accept_file_type;

    if (accepted) {
        const ext = file.name.split('.').pop().toLowerCase();
        const mimeMap = { csv: 'text/csv', json: 'application/json' };
        const acceptedMime = mimeMap[accepted];
        if (ext !== accepted || (acceptedMime && file.type !== acceptedMime)) {
            state.status = 'error'; state.success = false; state.message = `Invalid file type. Please upload a .${accepted} file.`;
            if (event.target) event.target.value = null;
            return;
        }
    }
    if (event.target) event.target.value = null;

    state.status = 'uploading'; state.isLoading = true; state.message = ''; state.success = null; state.uploadProgress = 0;

    const formData = new FormData();
    formData.append('action', window.ayecodeSettingsFramework.file_upload_ajax_action);
    formData.append('nonce', window.ayecodeSettingsFramework.tool_nonce);
    formData.append('import_file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', window.ayecodeSettingsFramework.ajax_url, true);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) state.uploadProgress = Math.round((e.loaded * 100) / e.total); };
    xhr.onload = () => {
        state.isLoading = false;
        if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
                state.status = 'selected'; state.uploadedFilename = response.data.filename; state.message = response.data.message;
                ctx.settings[hiddenFieldName] = response.data.filename;
            } else { state.status = 'error'; state.success = false; state.message = response.data.message || ctx.strings.file_upload_failed; }
        } else { state.status = 'error'; state.success = false; state.message = `Upload error: ${xhr.statusText}`; }
    };
    xhr.onerror = () => { state.isLoading = false; state.status = 'error'; state.success = false; state.message = 'A network error occurred during upload.'; };
    xhr.send(formData);
}

export async function removeUploadedFile(ctx, pageId, hiddenFieldName) {
    const state = ctx.actionStates[pageId];
    if (!state?.uploadedFilename) return;
    const filename = state.uploadedFilename;

    state.status = 'idle'; state.uploadedFilename = ''; state.message = ''; state.success = null;
    ctx.settings[hiddenFieldName] = '';

    try {
        await fetch(window.ayecodeSettingsFramework.ajax_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: window.ayecodeSettingsFramework.file_delete_ajax_action,
                nonce: window.ayecodeSettingsFramework.tool_nonce,
                filename
            })
        });
    } catch (e) { console.error('Error deleting temp file:', e); }
}
