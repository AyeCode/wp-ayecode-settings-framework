<?php
/**
 * Template Part: Header
 *
 * This template part renders the main header of the settings page.
 *
 * @package AyeCode\SettingsFramework
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

$plugin_name = $this->framework->get_plugin_name();
$page_title  = $this->framework->get_page_title();
?>
<header class="asf-header d-flex align-items-center px-4 justify-content-between bg-light-subtle border-bottom py-3 navbar">

    <div class="d-flex align-items-center">
        <button class="navbar-toggler me-2 d-lg-none d-block" type="button" data-bs-toggle="collapse" data-bs-target="#asf-sidebar" aria-expanded="false" aria-controls="asf-sidebar">
            <span class="navbar-toggler-icon"></span>
        </button>
        <h1 class="h6 mb-0 text-center fw-bold d-flex align-items-center">
            <?php echo wp_kses_post( $plugin_name ); ?>
            <span class="badge ms-2 text-info bg-primary-subtle mt-1"><?php echo wp_kses_post( $page_title ); ?></span>
        </h1>
    </div>
    <div class="d-flex align-items-center">
        <div class="mx-2 animate-scale d-inline-flex">
            <button @click="toggleTheme()"
                    class="bs-dark-mode-toggle btn btn-icon fs-6 btn-icon rounded-circle" role="button"
                    data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="<?php esc_attr_e( 'Toggle dark mode', 'ayecode-connect' ); ?>"
                    aria-label="<?php esc_attr_e( 'Toggle dark mode', 'ayecode-connect' ); ?>">
                <i x-show="theme === 'light'" class="fa-solid fa-sun animate-target"></i>
                <i x-show="theme === 'dark'" x-cloak class="fa-solid fa-moon animate-target"></i>
            </button>
        </div>
        <div x-show="isSettingsPage" x-cloak>
            <div class="d-inline-flex align-items-center">
                <div x-show="hasUnsavedChanges" class="text-muted me-3">
					<span class="d-inline-flex align-items-center">
					   <i class="fa-solid fa-circle text-warning me-2"></i>
					   <span x-text="strings.unsaved_changes" class="d-none d-lg-block"></span>
					</span>
                </div>
                <button class="btn btn-primary" @click="saveSettings()" :disabled="isLoading || !hasUnsavedChanges">
                    <span x-show="isLoading" class="spinner-border spinner-border-sm me-1" role="status"></span>
                    <span class="d-none d-lg-block" x-text="isLoading ? strings.saving : '<?php esc_html_e( 'Save Changes', 'ayecode-connect' ); ?>'"></span>
                    <span class="d-block d-lg-none" x-html="isLoading ? strings.saving : '<i class=\'fa-solid fa-floppy-disk\'></i>'"></span>
                </button>
            </div>
        </div>
    </div>
</header>