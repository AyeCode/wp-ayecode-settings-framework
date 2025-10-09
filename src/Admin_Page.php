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
     * Renders the full admin page markup by loading template parts.
     */
    public function render() {
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'ayecode-settings-framework' ) );
        }

        $templates_dir = dirname( __FILE__ ) . '/templates/';
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

            .sortable-ghost{
                opacity: 0.5 !important;
                border: 1px solid #0a90ff;
            }
            /* Style for highlighting required field error */
            .asf-field-error{
                transition: background-color 0.3s ease-in-out;
                background-color: rgba(255, 0, 8, 0.1) !important;
            }

        </style>

        <div class="bsui" x-data="ayecodeSettingsApp()" style="margin-left: -20px !important;">
            <div class="asf-container mw-100" style="margin-bottom: -65px !important;" :data-bs-theme="theme">

                <?php include $templates_dir . 'partials/header.php'; ?>

                <div class="asf-settings-page d-flex" style="min-height: calc(100vh - 105px);">

                    <?php include $templates_dir . 'partials/sidebar.php'; ?>

                    <div class="main-content w-100 d-flex flex-column justify-content-between position-relative bg-secondary-subtle">
                        <main class="asf-content container" :class="{ 'is-changing': isChangingView }">
                            <div class="bg-light-subtle p-4 p-md-5 my-5 rounded border" :key="currentSection + '-' + currentSubsection" x-cloak >
                                <template x-if="activePageConfig">
                                    <div>
                                        <?php // Default view for standard settings pages ?>
                                        <template x-if="!activePageConfig.type || (activePageConfig.type !== 'custom_page' && activePageConfig.type !== 'action_page' && activePageConfig.type !== 'import_page' && activePageConfig.type !== 'form_builder' && activePageConfig.type !== 'list_table' && activePageConfig.type !== 'dashboard' && activePageConfig.type !== 'extension_list_page')">
                                            <?php include $templates_dir . 'views/standard-settings.php'; ?>
                                        </template>

                                        <?php // View for custom pages ?>
                                        <template x-if="activePageConfig.type === 'custom_page' && !currentSubsectionData">
                                            <?php include $templates_dir . 'views/custom-page.php'; ?>
                                        </template>

                                        <?php // View for action pages ?>
                                        <template x-if="activePageConfig.type === 'action_page'">
                                            <?php include $templates_dir . 'views/action-page.php'; ?>
                                        </template>

                                        <?php // View for import pages ?>
                                        <template x-if="activePageConfig.type === 'import_page'">
                                            <?php include $templates_dir . 'views/import-page.php'; ?>
                                        </template>

                                        <?php // View for the new list table ?>
                                        <template x-if="activePageConfig.type === 'list_table'">
                                            <?php include $templates_dir . 'views/list-table.php'; ?>
                                        </template>

                                        <?php // NEW: View for the Dashboard ?>
                                        <template x-if="activePageConfig.type === 'dashboard'">
                                            <?php include $templates_dir . 'views/dashboard-page.php'; ?>
                                        </template>

                                        <?php // View for the new form builder ?>
                                        <template x-if="activePageConfig.type === 'form_builder'">
                                            <?php include $templates_dir . 'views/form-builder.php'; ?>
                                        </template>

                                        <?php // View for the Extension List Page ?>
                                        <template x-if="activePageConfig.type === 'extension_list_page'"  :key="'ext-page-' + activePageConfig.id">
                                            <?php include $templates_dir . 'views/extension-list-page.php'; ?>
                                        </template>
                                    </div>
                                </template>
                            </div>
                        </main>

                        <?php include $templates_dir . 'partials/save-bar.php'; ?>
                    </div>
                </div>

                <?php include $templates_dir . 'partials/search-modal.php'; ?>
            </div>
        </div>
        <?php
    }
}