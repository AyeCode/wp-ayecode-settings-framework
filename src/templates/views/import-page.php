<?php
/**
 * Template View: Import Page
 *
 * Renders the content for a page of type 'import_page'.
 *
 * @package AyeCode\SettingsFramework
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}
?>
<div x-data="{ state: actionStates[activePageConfig.id], hiddenFieldName: activePageConfig.fields.find(f => f.type === 'hidden')?.id }">
    <h2 class="h3" x-text="activePageConfig.page_title || activePageConfig.name"></h2>
    <template x-if="activePageConfig.description">
        <p class="text-muted" x-html="activePageConfig.description"></p>
    </template>
    <hr class="mt-4 mb-0">

    <template x-for="(field, index) in activePageConfig.fields" :key="field.id || index">
        <div :class="field.type === 'hidden' ? '' : 'py-4'" x-show="shouldShowField(field)" x-transition x-cloak x-html="renderField(field)"></div>
    </template>

    <div class="py-4">
        <label :for="'file-upload-' + activePageConfig.id" class="asf-dropzone w-100 mw-100 text-body bg-body-tertiary" x-show="state.status === 'idle'" x-cloak
               @dragover.prevent="$el.classList.add('is-dragover')"
               @dragleave.prevent="$el.classList.remove('is-dragover')"
               @drop.prevent="$el.classList.remove('is-dragover'); handleFileUpload($event, activePageConfig.id, hiddenFieldName)">
            <input :id="'file-upload-' + activePageConfig.id" type="file" @change="handleFileUpload($event, activePageConfig.id, hiddenFieldName)" :accept="activePageConfig.accept_file_type === 'csv' ? '.csv,text/csv' : (activePageConfig.accept_file_type === 'json' ? '.json,application/json' : '*/*')">
            <i class="fa-solid fa-upload fa-2x mb-3 text-muted"></i>
            <p class="mb-0 fw-bold">Drag & drop a .<span x-text="activePageConfig.accept_file_type"></span> file here, or <span class="text-primary">click to browse</span>.</p>
            <small class=" d-block mt-1">Maximum upload size: <?php echo esc_html( size_format( wp_max_upload_size() ) ); ?></small>
            <p><span x-text="'.'+activePageConfig.accept_file_type" class="badge text-primary bg-primary-subtle fs-6 mt-3 border"></span></p>
        </label>

        <div class="card w-100 mw-100" x-show="state.status === 'uploading'" x-cloak>
            <div class="card-body text-center">
                <div class="spinner-border text-primary mb-3" role="status"></div>
                <p class="mb-1 fw-bold">Uploading...</p>
                <div class="progress" style="height: 5px;">
                    <div class="progress-bar" role="progressbar" :style="`width: ${state.uploadProgress}%`"></div>
                </div>
            </div>
        </div>

        <div class="card w-100 mw-100" x-show="state.status === 'selected'" x-cloak>
            <div class="card-body d-flex align-items-center">
                <i class="fa-solid fa-file-circle-check fa-2x text-success me-3"></i>
                <div class="flex-grow-1">
                    <div class="fw-bold" x-text="state.uploadedFilename"></div>
                    <div class="small text-muted" x-text="state.message"></div>
                </div>
                <button type="button" class="btn-close" @click="removeUploadedFile(activePageConfig.id, hiddenFieldName)"></button>
            </div>
        </div>

        <div class="alert alert-danger" x-show="state.status === 'error'" x-cloak>
            <h5 class="alert-heading">Upload Failed</h5>
            <p x-text="state.message"></p>
            <button type="button" class="btn btn-sm btn-danger" @click="state.status = 'idle'; state.message = '';">Try Again</button>
        </div>

        <div class="card w-100 mw-100" x-show="state.status === 'complete'" x-cloak>
            <div class="card-body p-4">
                <template x-if="state.success">
                    <div class="text-center mb-3">
                        <i class="fa-solid fa-circle-check fa-3x text-success"></i>
                        <h4 class="card-title mt-2">Import Complete</h4>
                    </div>
                </template>
                <template x-if="!state.success">
                    <div class="text-center mb-3">
                        <i class="fa-solid fa-circle-xmark fa-3x text-danger"></i>
                        <h4 class="card-title mt-2">Import Failed</h4>
                    </div>
                </template>

                <p class="text-muted text-center" x-text="state.message"></p>

                <template x-if="state.summary && Object.keys(state.summary).length > 0">
                    <div class="text-start border rounded p-3 my-4 bg-light-subtle">
                        <h6 class="fw-bold mb-3 text-center">Import Summary</h6>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0">
                                <span><i class="fa-solid fa-plus me-2 text-success"></i>Records Created</span>
                                <span class="badge bg-success-subtle text-success-emphasis rounded-pill" x-text="state.summary.created || 0"></span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0">
                                <span><i class="fa-solid fa-pen-to-square me-2 text-primary"></i>Records Updated</span>
                                <span class="badge bg-primary-subtle text-primary-emphasis rounded-pill" x-text="state.summary.updated || 0"></span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0">
                                <span><i class="fa-solid fa-forward me-2 text-secondary"></i>Records Skipped</span>
                                <span class="badge bg-secondary-subtle text-secondary-emphasis rounded-pill" x-text="state.summary.skipped || 0"></span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0" x-show="state.summary.invalid > 0">
                                <span><i class="fa-solid fa-triangle-exclamation me-2 text-warning"></i>Invalid Records</span>
                                <span class="badge bg-warning-subtle text-warning-emphasis rounded-pill" x-text="state.summary.invalid"></span>
                            </li>
                        </ul>
                        <template x-if="state.summary.errors && state.summary.errors.length > 0">
                            <div class="mt-3">
                                <h6 class="fw-bold text-danger">Errors</h6>
                                <ul class="list-unstyled small text-danger-emphasis bg-danger-subtle p-2 rounded">
                                    <template x-for="(error, i) in state.summary.errors" :key="i">
                                        <li x-text="error"></li>
                                    </template>
                                </ul>
                            </div>
                        </template>
                    </div>
                </template>

                <div class="text-center mt-4">
                    <button type="button" class="btn btn-primary" @click="resetImportPageState(activePageConfig)">
                        <i class="fa-solid fa-rotate-right me-2"></i>
                        Import Another File
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div x-show="state.status !== 'complete'">
        <div class="pt-4 mt-4 border-top">
            <div class="d-flex align-items-center justify-content-end">
                <div class="me-3" x-show="state.status === 'processing' && state.message" x-cloak>
                    <span :class="state.success ? 'text-success' : 'text-danger'" x-text="state.message"></span>
                </div>
                <div class="progress me-3" style="height: 5px; width: 100px;" x-show="state.status === 'processing' && state.processingProgress > 0 && state.processingProgress < 100" x-cloak>
                    <div class="progress-bar" role="progressbar" :style="{ width: state.processingProgress + '%' }"></div>
                </div>
                <button type="button"
                        :class="`btn ${activePageConfig.button_class || 'btn-primary'}`"
                        @click="executePageAction()"
                        :disabled="state.status !== 'selected' || state.isLoading">
                    <span x-show="state.isLoading" class="spinner-border spinner-border-sm me-2" x-cloak></span>
                    <span x-text="state.isLoading ? 'Processing...' : activePageConfig.button_text || 'Run Action'"></span>
                </button>
            </div>
        </div>
    </div>
</div>