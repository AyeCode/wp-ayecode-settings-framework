<?php
/**
 * Wizard Layout Template - Bootstrap 5.3+ Only
 *
 * This template provides the full-page wizard layout using only Bootstrap 5.3+ classes.
 * No custom CSS - all styling via Bootstrap and AlpineJS.
 *
 * @package AyeCode\SettingsFramework
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}


?>

<!-- Full-height container with gradient background using Bootstrap utilities -->
<div class="bsui">
    <div class="d-flex flex-column vh-100 bg-primary bg-gradient overflow-hidden"
         x-data="setupWizardComponent(window.ayecodeWizardFramework)"
         x-cloak>

        <?php include __DIR__ . '/partials/header.php'; ?>

        <!-- Content area - centered with padding -->
        <div class="flex-fill d-flex align-items-center justify-content-center p-4 overflow-auto">
            <?php include __DIR__ . '/partials/content-area.php'; ?>
        </div>

    </div>
</div>

<style>
    html.wp-toolbar,
    body.wp-admin {
        padding: 0 !important;
        margin: 0 !important;
    }
    #wpcontent,
    #wpbody-content,
    #wpbody,
    #wpwrap {
        margin: 0 !important;
        padding: 0 !important;
        height: 100vh !important;
        width: 100vw !important;
    }
    #adminmenumain,
    #wpadminbar,
    #wpfooter,
    #screen-meta,
    #screen-meta-links,
    #wpcontent > .notice {
        display: none !important;
    }
</style>

