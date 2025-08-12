<?php
/**
 * Admin Page Renderer
 *
 * This class is responsible for rendering the main HTML structure of the
 * settings page, including the header, sidebar, and content areas.
 * It uses data from the framework instance to populate dynamic content.
 *
 * @package AyeCode\SettingsFramework
 */

namespace AyeCode\SettingsFramework;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Admin_Page {
    /**
     * A reference to the main framework instance.
     *
     * @var Settings_Framework
     */
    private $framework;

    /**
     * Constructor.
     *
     * @param Settings_Framework $framework The main framework instance.
     */
    public function __construct( Settings_Framework $framework ) {
        $this->framework = $framework;
    }

    /**
     * Renders the full admin page markup.
     */
    public function render() {
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( __( 'You do not have sufficient permissions to access this page.', 'ayecode-settings-framework' ) );
        }

        $plugin_name = $this->framework->get_plugin_name();

        ?>
        <style>
            /* Prevents hidden fields from flashing on load/tab switch */
            [x-cloak] { display: none !important; }
            #wpfooter { display: none; }
            /* Style for highlighting search result */
            .highlight-setting {
                transition: background-color 0.3s ease-in-out;
                background-color: rgba(0, 123, 255, 0.1) !important;
            }
            /* Styles for the new import dropzone */
            .asf-dropzone {
                border: 2px dashed #dcdcde;
                border-radius: 6px;
                padding: 40px 20px;
                text-align: center;
                cursor: pointer;
                transition: background-color 0.2s ease, border-color 0.2s ease;
            }
            .asf-dropzone.is-dragover {
                background-color: #f0f7ff;
                border-color: #2271b1;
            }
            .asf-dropzone input[type="file"] {
                display: none;
            }
        </style>

        <div class="bsui" x-data="ayecodeSettingsApp()" style="margin-left: -20px !important;">
            <div class="asf-container mw-100" style="margin-bottom: -65px !important;" :data-bs-theme="theme">
                <header class="asf-header d-flex align-items-center px-4 justify-content-between bg-light-subtle border-bottom py-3">
                    <div class="d-flex align-items-center">
                        <h1 class="h6 mb-0 text-center fw-bold d-flex align-items-center">
                            <?php echo wp_kses_post( $plugin_name ); ?>
                            <span class="badge ms-2 text-info bg-primary-subtle mt-1"><?php echo wp_kses_post($this->framework->get_page_title()); ?></span>
                        </h1>
                    </div>
                    <div class="d-flex align-items-center">
                        <div class="mx-2 animate-scale d-inline-flex">
                            <button @click="toggleTheme()"
                                    class="bs-dark-mode-toggle btn btn-icon fs-6 btn-icon rounded-circle" role="button"
                                    data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Toggle dark mode"
                                    aria-label="Toggle dark mode">
                                <i x-show="theme === 'light'" class="fa-solid fa-sun animate-target"></i>
                                <i x-show="theme === 'dark'" x-cloak class="fa-solid fa-moon animate-target"></i>
                            </button>
                        </div>
                        <div x-show="isSettingsPage" x-cloak>
                            <div class="d-inline-flex align-items-center">
                                <div x-show="hasUnsavedChanges" class="text-muted me-3">
									<span class="d-inline-flex align-items-center">
										<i class="fa-solid fa-circle text-warning me-2"></i>
										<span x-text="strings.unsaved_changes" class="d-none d-md-block"></span>
									</span>
                                </div>
                                <button class="btn btn-primary" @click="saveSettings()" :disabled="isLoading || !hasUnsavedChanges">
                                    <span x-show="isLoading" class="spinner-border spinner-border-sm me-1" role="status"></span>
                                    <span x-text="isLoading ? strings.saving : '<?php _e( 'Save Changes', 'ayecode-settings-framework' ); ?>'"></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>
                <div class="asf-settings-page d-flex" style="min-height: calc(100vh - 107px);">
                    <aside class="asf-sidebar bg-light-subtle collapse collapse-horizontal d-lg-block" id="asf-sidebar">
                        <div class="p-3">
                            <button type="button" class="form-control text-start text-muted bg-light-subtle" @click="searchModal.show()">
                                <i class="fa-solid fa-magnifying-glass me-2"></i>
                                <span x-text="strings.search_placeholder || 'Quick search...'"></span>
                                <span class="ms-auto small text-muted border rounded px-2 float-end">Ctrl+K</span>
                            </button>
                        </div>
                        <div class="flex-grow-1" style="overflow-y: auto; width: 280px;">
                            <nav class="nav flex-column py-2">
                                <template x-for="section in sections" :key="section.id">
                                    <div class="sidebar-nav-section">
                                        <a href="#" class="nav-link text-dark-subtle d-flex align-items-center w-100 p-3" :class="{'bg-primary-subtle': currentSection === section.id}" @click.prevent="switchSection(section.id)">
                                            <i :class="section.icon || 'fa-solid fa-gear'" class="fa-fw me-3 text-muted"></i>
                                            <span class="flex-grow-1" :class="currentSection === section.id ? 'fw-bold' : 'fw-semibold'" x-text="section.name"></span>
                                            <i class="fa-solid fa-chevron-down ms-2 text-muted small" x-show="section.subsections"></i>
                                        </a>
                                        <div x-show="currentSection === section.id && section.subsections">
                                            <div class="nav flex-column py-1 pe-2 ps-4">
                                                <template x-for="subsection in section.subsections" :key="subsection.id">
                                                    <a href="#" class="nav-link" :class="{ 'bg-primary-subtle rounded': currentSubsection === subsection.id, 'text-dark-subtle': currentSubsection !== subsection.id }" @click.prevent="switchSubsection(subsection.id)">
                                                        <span x-text="subsection.name"></span>
                                                    </a>
                                                </template>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </nav>
                        </div>
                    </aside>
                    <div class="main-content w-100 d-flex flex-column justify-content-between position-relative bg-secondary-subtle">
                        <main class="asf-content container" :class="{ 'is-changing': isChangingView }">
                            <div class="bg-light-subtle p-4 p-md-5 my-5 rounded border" :key="currentSection + '-' + currentSubsection" x-cloak>
                                <template x-if="activePageConfig">
                                    <div>
                                        <template x-if="activePageConfig.type === 'custom_page' && !currentSubsectionData">
                                            <div>
                                                <h2 class="h3" x-text="activePageConfig.page_title || activePageConfig.name"></h2>
                                                <template x-if="activePageConfig.description">
                                                    <p class="text-muted" x-html="activePageConfig.description"></p>
                                                </template>
                                                <hr class="mt-4 mb-0">
                                                <div class="py-4">
                                                    <template x-if="activePageConfig.content_html">
                                                        <div x-html="activePageConfig.content_html"></div>
                                                    </template>
                                                    <template x-if="activePageConfig.ajax_content">
                                                        <div>
                                                            <template x-if="isContentLoading">
                                                                <div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>
                                                            </template>
                                                            <div x-show="!isContentLoading" x-html="loadedContentCache[activePageConfig.id]"></div>
                                                        </div>
                                                    </template>
                                                </div>
                                            </div>
                                        </template>

                                        <template x-if="activePageConfig.type === 'action_page'">
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
                                        </template>

                                        <template x-if="activePageConfig.type === 'import_page'">
                                            <div x-data="{ state: actionStates[activePageConfig.id] }">
                                                <h2 class="h3" x-text="activePageConfig.page_title || activePageConfig.name"></h2>
                                                <template x-if="activePageConfig.description">
                                                    <p class="text-muted" x-html="activePageConfig.description"></p>
                                                </template>
                                                <hr class="mt-4 mb-0">

                                                <template x-for="(field, index) in activePageConfig.fields" :key="field.id || index">
                                                    <div :class="field.type === 'hidden' ? '' : 'py-4'" x-show="shouldShowField(field)" x-transition x-cloak x-html="renderField(field)"></div>
                                                </template>

                                                <div class="pt-4 mt-4 border-top">

                                                    <label :for="'file-upload-' + activePageConfig.id" class="asf-dropzone border border-dashed w-100  text-body bg-body-tertiary border-4 bg-opacity-50" x-show="state.status === 'idle'" x-cloak
                                                           @dragover.prevent="$el.classList.add('is-dragover')"
                                                           @dragleave.prevent="$el.classList.remove('is-dragover')"
                                                           @drop.prevent="$el.classList.remove('is-dragover'); handleFileSelect($event.dataTransfer, activePageConfig.id)">
                                                        <input :id="'file-upload-' + activePageConfig.id" type="file" @change="handleFileSelect($event, activePageConfig.id)" :accept="activePageConfig.accept || '*/*'">
                                                        <i class="fa-solid fa-upload fa-2x mb-2"></i>
                                                        <p class="mb-0">Drag & drop your file here, or <span class="text-primary fw-bold">click to browse</span>.</p>
                                                    </label>

                                                    <div class="" x-show="state.status === 'selected'" x-cloak>
                                                        <div class="alert alert-light d-flex align-items-center">
                                                            <i class="fa-solid fa-file-lines fa-2x text-muted me-3"></i>
                                                            <div class="flex-grow-1">
                                                                <div class="fw-bold" x-text="state.selectedFile?.name"></div>
                                                                <div class="small text-muted" x-text="`${(state.selectedFile?.size / 1024).toFixed(2)} KB`"></div>
                                                            </div>
                                                            <button type="button" class="btn-close" @click="state.status = 'idle'; state.selectedFile = null;"></button>
                                                        </div>

                                                    </div>

                                                    <div x-show="['uploading', 'processing'].includes(state.status)" x-cloak>
                                                        <div class="fw-bold mb-2" x-text="state.status === 'uploading' ? 'Uploading...' : 'Processing...'"></div>
                                                        <div class="progress">
                                                            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" :style="`width: ${state.status === 'uploading' ? state.uploadProgress : state.processingProgress}%`"></div>
                                                        </div>
                                                    </div>

                                                    <div x-show="state.message" class="mt-3" :class="state.success ? 'alert alert-success' : 'alert alert-danger'" x-text="state.message"></div>

                                                    <div class="text-end mt-3">
                                                        <button type="button"
                                                                :class="`btn ${activePageConfig.button_class || 'btn-primary'}`"
                                                                @click="executeImport()"
                                                                :disabled="!state.selectedFile || state.isLoading">
                                                            <span x-show="state.isLoading" class="spinner-border spinner-border-sm me-2" x-cloak></span>
                                                            <span x-text="activePageConfig.button_text || 'Upload & Import'"></span>
                                                        </button>
                                                    </div>
                                                </div>

                                            </div>
                                        </template>

                                        <template x-if="!activePageConfig.type || (activePageConfig.type !== 'custom_page' && activePageConfig.type !== 'action_page' && activePageConfig.type !== 'import_page')">
                                            <div>
                                                <h2 class="h3" x-text="activePageConfig.page_title || activePageConfig.name"></h2>
                                                <template x-if="activePageConfig.description">
                                                    <p class="text-muted" x-html="activePageConfig.description"></p>
                                                </template>
                                                <hr class="mt-4 mb-0">
                                                <template x-for="(field, index) in activePageConfig.fields" :key="field.id || index">
                                                    <div :class="field.type === 'hidden' ? '' : 'py-4'" x-show="shouldShowField(field)" x-transition x-cloak x-html="renderField(field)"></div>
                                                </template>
                                            </div>
                                        </template>
                                    </div>
                                </template>
                            </div>
                        </main>

                        <div class="asf-save-bar bg-light-subtle border-top border-start p-3 position-sticky w-100 bottom-0 text-body"
                             x-show="hasUnsavedChanges && isSettingsPage" x-cloak x-transition>
                            <div class="d-flex justify-content-between align-items-center w-100 px-3">
                                <div>
                                    <i class="fa-solid fa-triangle-exclamation text-warning me-2"></i>
                                    <span x-text="strings.unsaved_changes"></span>
                                </div>
                                <div>
                                    <button class="btn btn-secondary me-2" @click="discardChanges()"><?php _e( 'Discard', 'ayecode-settings-framework' ); ?></button>
                                    <button class="btn btn-primary" @click="saveSettings()" :disabled="isLoading">
                                        <span x-show="isLoading" class="spinner-border spinner-border-sm me-1" role="status"></span>
                                        <span x-text="isLoading ? strings.saving : '<?php _e( 'Save Changes', 'ayecode-settings-framework' ); ?>'"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal fade" id="asf-search-modal" tabindex="-1">
                    <div class="modal-dialog modal-dialog-scrollable modal-lg">
                        <div class="modal-content">
                            <div class="modal-header border-0 pb-0">
                                <div class="input-group">
                                    <span class="input-group-text bg-transparent border-0 border-bottom rounded-0"><i class="fa-solid fa-magnifying-glass"></i></span>
                                    <input type="search" class="form-control bg-transparent border-0 border-bottom rounded-0" id="asf-search-input" :placeholder="strings.search_placeholder" x-model.debounce.300ms="searchQuery">
                                </div>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div x-show="!searchQuery" class="text-center text-muted p-5"><p><?php _e( 'Start typing to search for settings.', 'ayecode-settings-framework' ); ?></p></div>
                                <div x-show="searchQuery && groupedSearchResults.length === 0" class="text-center text-muted p-5" x-cloak><p><?php _e( 'No results found for', 'ayecode-settings-framework' ); ?> <strong x-text="searchQuery"></strong></p></div>
                                <div x-show="groupedSearchResults.length > 0" x-cloak>
                                    <template x-for="group in groupedSearchResults" :key="group.groupTitle">
                                        <div class="mb-3">
                                            <h5 class="px-3 py-2 bg-primary-subtle rounded d-flex align-items-center"><i :class="group.sectionIcon || 'fa-solid fa-gear'" class="fa-fw me-2 text-muted"></i><span x-html="group.groupTitle"></span></h5>
                                            <ul class="list-group list-group-flush">
                                                <template x-for="result in group.results" :key="result.field.id">
                                                    <li class="list-group-item list-group-item-action border-0 rounded py-1"><a href="#" @click.prevent="goToSearchResult(result)" class="text-decoration-none text-dark-subtle d-block p-2"><div x-text="result.field.label"></div><div class="small text-muted" x-show="result.field.description" x-text="result.field.description"></div></a></li>
                                                </template>
                                            </ul>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
}