<?php
/**
 * Template View: Standard Settings
 *
 * Renders a standard settings page with a title, description, and fields.
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
</div>