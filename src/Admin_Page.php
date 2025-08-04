<?php
/**
 * Admin Page Renderer
 *
 * Final version with all components and highlighting fixed.
 *
 * @package AyeCode\SettingsFramework
 */

namespace AyeCode\SettingsFramework;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class Admin_Page
{
    /**
     * Framework instance
     * @var Settings_Framework
     */
    private $framework;

    /**
     * Constructor
     *
     * @param Settings_Framework $framework Framework instance
     */
    public function __construct($framework)
    {
        $this->framework = $framework;

        // load choices JS
        add_filter('aui_force_load_select2', '__return_true');

        // ✨ ADD THIS LINE to load the WP Media Uploader scripts @todo add filte to
        // wp_enqueue_media();
        add_action( 'admin_enqueue_scripts', 'wp_enqueue_media');

        // iconpicker
        wp_enqueue_script( 'iconpicker' );

    }

    /**
     * Render the admin page
     */
    public function render()
    {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'ayecode-settings-framework'));
        }

        $plugin_name = $this->framework->get_plugin_name();

        ?>
        <style>
            /* Prevents hidden fields from flashing on load/tab switch */
            [x-cloak] {
                display: none !important;
            }

            #wpfooter {
                display: none;
            }

            /* Style for highlighting search result */
            .highlight-setting {
                transition: background-color 0.3s ease-in-out;
                background-color: rgba(0, 123, 255, 0.1) !important;
            }

            /* The default state has the transition. This is for the "animate in". */
            .asf-contentx {
                transition: opacity 0.05s ease-in-out, transform 0.05s ease-in-out;
            }

            /* The changing state has NO transition. This makes the "animate out" instant. */
            .asf-contentx.is-changing {
                opacity: 0;
                transform: translate(20px, 0);
                transition: none; /* This is the key change */
            }

        </style>

        <div class="bsui" x-data="ayecodeSettingsApp()" style="margin-left: -20px !important;">

            <div class="asf-container mw-100" style="margin-bottom: -65px !important;" :data-bs-theme="theme">

                <header class="asf-header d-flex align-items-center px-4 justify-content-between bg-light-subtle border-bottom py-3">
                    <div class="d-flex align-items-center">
                        <div>
                            <button class="btn btn-sm btn-outline-secondary d-lg-none me-3" type="button"
                                    data-bs-toggle="collapse" data-bs-target="#asf-sidebar" aria-expanded="true"
                                    aria-controls="asf-sidebar"><i class="fa-solid fa-bars"></i></button>
                        </div>
                        <div class="">
                            <h1 class="h6 mb-0 text-center fw-bold d-flex align-items-center"><?php echo wp_kses_post($plugin_name); ?></h1>
                        </div>
                    </div>


                    <div class="d-flex align-items-center">

                        <div x-show="hasUnsavedChanges" x-cloak>
                            <div class="text-muted me-3 d-flex align-items-center">
                                <i class="fa-solid fa-circle text-warning me-2"></i>
                                <span x-text="strings.unsaved_changes" class="d-none d-md-block"></span>
                            </div>
                        </div>
                        <div class="mx-2 animate-scale">
                            <button @click="toggleTheme()"
                                    class="bs-dark-mode-toggle btn btn-icon fs-6 btn-icon rounded-circle" role="button"
                                    data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Toggle dark mode"
                                    aria-label="Toggle dark mode">
                                <i x-show="theme === 'light'" class="fa-solid fa-sun animate-target"></i>
                                <i x-show="theme === 'dark'" x-cloak class="fa-solid fa-moon animate-target"></i>
                            </button>
                        </div>
                        <button class="btn btn-primary" @click="saveSettings()" :disabled="isLoading">
                            <span x-show="isLoading" class="spinner-border spinner-border-sm me-1" role="status"></span>
                            <span x-text="isLoading ? strings.saving : '<?php _e('Save Changes', 'ayecode-settings-framework'); ?>'"
                                  class="d-none d-md-block"></span>
                            <i class="fa-regular fa-floppy-disk d-block d-md-none"></i>
                        </button>
                    </div>
                </header>

                <div class="asf-settings-page d-flex" style="min-height: calc(100vh - 107px);">

                    <aside class="asf-sidebar bg-light-subtle collapse collapse-horizontal d-lg-block" id="asf-sidebar">

                        <div class=" p-3">
                            <button type="button" class="form-control text-start text-muted bg-light-subtle"
                                    @click="searchModal.show()">
                                <i class="fa-solid fa-magnifying-glass me-2"></i>
                                <span x-text="strings.search_placeholder || 'Quick search...'"></span>
                                <span class="ms-auto small text-muted border rounded px-2 float-end">Ctrl+K</span>
                            </button>
                        </div>

                        <div class="flex-grow-1" style="overflow-y: auto; width: 280px;">
                            <nav class="nav flex-column py-2">
                                <template x-for="section in sections" :key="section.id">
                                    <div class="sidebar-nav-section">
                                        <a href="#"
                                           class="nav-link text-dark-subtle  d-flex align-items-center w-100 p-3"
                                           :class="{'bg-primary-subtle': currentSection === section.id}"
                                           @click.prevent="switchSection(section.id)">
                                            <i :class="section.icon || 'fa-solid fa-gear'"
                                               class="fa-fw me-3 text-muted"></i>
                                            <span class="flex-grow-1"
                                                  :class="currentSection === section.id ? 'fw-bold' : 'fw-semibold'"
                                                  x-text="section.name"></span>
                                            <i class="fa-solid fa-chevron-down ms-2 text-muted small"
                                               x-show="section.subsections"></i>
                                        </a>
                                        <div x-show="currentSection === section.id && section.subsections">
                                            <div class="nav flex-column py-1 pe-2 ps-4">
                                                <template x-for="subsection in section.subsections"
                                                          :key="subsection.id">
                                                    <a href="#" class="nav-link"
                                                       :class="{
                                                       'bg-primary-subtle rounded': currentSubsection === subsection.id,
                                                       'text-dark-subtle ': currentSubsection !== subsection.id
                                                   }"
                                                       @click.prevent="switchSubsection(subsection.id)">
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
                            <div class="bg-light-subtle p-4 p-md-5 my-5 rounded border"
                                 :key="currentSection + '-' + currentSubsection"
                                 x-cloak
                            >
                                <template x-if="currentSectionData">
                                    <div>
                                        <template x-if="currentSectionData.subsections">
                                            <template x-if="currentSubsectionData">
                                                <div>
                                                    <h2 class="h3" x-text="currentSubsectionData.name"></h2>
                                                    <p class="text-muted"
                                                       x-text="currentSubsectionData.description"></p>
                                                    <hr class="mt-4 mb-0">
                                                    <template x-for="(field, index) in currentSubsectionData.fields"
                                                              :key="field.id || index">
                                                        <div class="py-4"
                                                             x-show="shouldShowField(field)"
                                                             x-transition
                                                             x-cloak
                                                             x-html="renderField(field)">
                                                        </div>
                                                    </template>
                                                </div>
                                            </template>
                                        </template>
                                        <template x-if="!currentSectionData.subsections">
                                            <div>
                                                <h2 class="h3" x-text="currentSectionData.name"></h2>
                                                <p class="text-muted" x-text="currentSectionData.description"></p>
                                                <hr class="mt-4 mb-0">
                                                <template x-for="(field, index) in currentSectionData.fields"
                                                          :key="field.id || index">
                                                    <div class="py-4"
                                                         x-show="shouldShowField(field)"
                                                         x-transition
                                                         x-cloak
                                                         x-html="renderField(field)">
                                                    </div>
                                                </template>
                                            </div>
                                        </template>
                                    </div>
                                </template>
                            </div>
                        </main>

                        <div class="asf-save-bar bg-light-subtle border-top border-start p-3 position-absolute w-100 bottom-0 text-body"
                             x-show="hasUnsavedChanges" x-cloak x-transition>
                            <div class="d-flex justify-content-between align-items-center w-100 px-3">
                                <div>
                                    <i class="fa-solid fa-triangle-exclamation text-warning me-2"></i>
                                    <span x-text="strings.unsaved_changes"></span>
                                </div>
                                <div>
                                    <button class="btn btn-secondary me-2"
                                            @click="discardChanges()"><?php _e('Discard', 'ayecode-settings-framework'); ?></button>
                                    <button class="btn btn-primary" @click="saveSettings()" :disabled="isLoading">
                                        <span x-show="isLoading" class="spinner-border spinner-border-sm me-1"
                                              role="status"></span>
                                        <span x-text="isLoading ? strings.saving : '<?php _e('Save Changes', 'ayecode-settings-framework'); ?>'"></span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="position-fixed top-0 start-0 w-100 h-100"
                             style="background-color: rgba(0, 0, 0, 0.5); z-index: 99999;" x-show="isLoading" x-cloak>
                            <div class="d-flex h-100 justify-content-center align-items-center">
                                <div class="text-center">
                                    <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"
                                         role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div class="modal fade" id="asf-search-modal" tabindex="-1" aria-labelledby="searchModalLabel"
                     aria-hidden="true">
                    <div class="modal-dialog modal-dialog-scrollable modal-lg">
                        <div class="modal-content">
                            <div class="modal-header border-0 pb-0">
                                <div class="input-group">
                                    <span class="input-group-text bg-transparent border-0 border-bottom  rounded-0"><i
                                                class="fa-solid fa-magnifying-glass"></i></span>
                                    <input type="search"
                                           class="form-control bg-transparent border-0 border-bottom  rounded-0"
                                           id="asf-search-input" :placeholder="strings.search_placeholder"
                                           x-model.debounce.300ms="searchQuery">
                                </div>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"
                                        aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div x-show="!searchQuery" class="text-center text-muted p-5">
                                    <p><?php _e('Start typing to search for settings.', 'ayecode-settings-framework'); ?></p>
                                </div>
                                <div x-show="searchQuery && groupedSearchResults.length === 0"
                                     class="text-center text-muted p-5" x-cloak>
                                    <p><?php _e('No results found for', 'ayecode-settings-framework'); ?> <strong
                                                x-text="searchQuery"></strong></p>
                                </div>

                                <div x-show="groupedSearchResults.length > 0" x-cloak>
                                    <template x-for="group in groupedSearchResults" :key="group.groupTitle">
                                        <div class="mb-3">
                                            <h5 class="px-3 py-2 bg-primary-subtle rounded d-flex align-items-center">
                                                <i :class="group.sectionIcon || 'fa-solid fa-gear'"
                                                   class="fa-fw me-2 text-muted"></i>
                                                <span x-html="group.groupTitle"></span>
                                            </h5>
                                            <ul class="list-group list-group-flush">
                                                <template x-for="result in group.results" :key="result.field.id">
                                                    <li class="list-group-item list-group-item-action border-0 rounded py-1">
                                                        <a href="#" @click.prevent="goToSearchResult(result)"
                                                           class="text-decoration-none text-dark-subtle  d-block p-2">
                                                            <div x-text="result.field.label"></div>
                                                            <div class="small text-muted"
                                                                 x-show="result.field.description"
                                                                 x-text="result.field.description"></div>
                                                        </a>
                                                    </li>
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
