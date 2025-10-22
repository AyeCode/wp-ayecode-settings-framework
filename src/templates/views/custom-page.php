<?php
/**
 * Template View: Custom Page
 *
 * Renders the content for a page of type 'custom_page'.
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
    <div class="py-4">
        <template x-if="activePageConfig.content_html">
            <div x-html="activePageConfig.content_html"></div>
        </template>
        <template x-if="activePageConfig.ajax_content">
            <div>
                <template x-if="isContentLoading">
                    <div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden"><?php esc_html_e( 'Loading...', 'ayecode-connect' ); ?></span></div></div>
                </template>
                <div x-show="!isContentLoading" x-html="loadedContentCache[activePageConfig.id]"></div>
            </div>
        </template>
    </div>
</div>