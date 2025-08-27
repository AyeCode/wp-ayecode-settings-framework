<?php
/**
 * Template View: Action Page
 *
 * Renders the content for a page of type 'action_page'.
 *
 * @package AyeCode\SettingsFramework
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}
?>
<div>
    <h2 class="h3" x-text="activePageConfig.page_title || activePageConfig.name"></h2>
    <template x-if="activePageConfig.description">
        <p class="text-muted" x-html="activePageConfig.description"></p>
    </template>
    <hr class="mt-4 mb-0">
    <template x-for="(field, index) in activePageConfig.fields" :key="field.id || index">
        <div :class="field.type === 'hidden' ? '' : 'py-4'" x-show="shouldShowField(field)" x-transition x-cloak x-html="renderField(field)"></div>
    </template>
    <div class="pt-4 mt-4 border-top">
        <div class="d-flex align-items-center justify-content-end">
            <div class="me-3" x-show="actionStates[activePageConfig.id]?.message" x-cloak>
                <span :class="actionStates[activePageConfig.id]?.success ? 'text-success' : 'text-danger'" x-text="actionStates[activePageConfig.id]?.message"></span>
            </div>
            <div class="progress me-3" style="height: 5px; width: 100px;" x-show="actionStates[activePageConfig.id]?.progress > 0 && actionStates[activePageConfig.id]?.progress < 100" x-cloak>
                <div class="progress-bar" role="progressbar" :style="{ width: actionStates[activePageConfig.id]?.progress + '%' }"></div>
            </div>
            <button type="button"
                    :class="`btn ${activePageConfig.button_class || 'btn-primary'}`"
                    @click="executePageAction()"
                    :disabled="actionStates[activePageConfig.id]?.isLoading">
                <span x-show="actionStates[activePageConfig.id]?.isLoading" class="spinner-border spinner-border-sm me-2" x-cloak></span>
                <span x-text="actionStates[activePageConfig.id]?.isLoading ? 'Processing...' : activePageConfig.button_text || 'Run Action'"></span>
            </button>
        </div>
        <div class="border rounded p-3 mt-3 bg-light" x-show="actionStates[activePageConfig.id]?.exportedFiles.length > 0" x-cloak>
            <h6 class="fw-bold">Generated Files</h6>
            <ul class="list-group">
                <template x-for="(file, index) in actionStates[activePageConfig.id].exportedFiles" :key="index">
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <i class="fa-solid fa-file-csv me-2 text-muted"></i>
                            <span x-text="file.name"></span>
                            <small class="text-muted ms-2" x-text="file.size"></small>
                        </div>
                        <a :href="file.url" class="btn btn-sm btn-outline-primary" download>Download</a>
                    </li>
                </template>
            </ul>
        </div>
    </div>
</div>