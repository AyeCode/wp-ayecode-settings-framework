<?php
/**
 * Template Part: Save Bar
 *
 * Renders the floating save bar that appears when there are unsaved changes.
 *
 * @package AyeCode\SettingsFramework
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}
?>
<div class="asf-save-bar bg-light-subtle border-top border-start p-3 position-sticky w-100 bottom-0 text-body"
     x-show="hasUnsavedChanges && isSettingsPage" x-cloak x-transition>
    <div class="d-flex justify-content-between align-items-center w-100 px-3">
        <div>
            <i class="fa-solid fa-triangle-exclamation text-warning me-2"></i>
            <span x-text="strings.unsaved_changes"></span>
        </div>
        <div>
            <button class="btn btn-secondary me-2" @click="discardChanges()"><?php esc_html_e( 'Discard', 'ayecode-connect' ); ?></button>
            <button class="btn btn-primary" @click="saveSettings()" :disabled="isLoading">
                <span x-show="isLoading" class="spinner-border spinner-border-sm me-1" role="status"></span>
                <span x-text="isLoading ? strings.saving : '<?php esc_html_e( 'Save Changes', 'ayecode-connect' ); ?>'"></span>
            </button>
        </div>
    </div>
</div>