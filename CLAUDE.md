# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
# Install JS dependencies
npm install

# Development build (watch mode)
npm run dev

# Production build → assets/dist/
npm run build
```

There are no PHP tests or linting commands configured in this repository.

## Architecture Overview

This is a **WordPress settings framework library** (PHP + JS) distributed via Composer. Plugins extend it to create rich admin settings pages with Alpine.js reactive UI.

### PHP Architecture

The entry point is `src/Settings_Framework.php` — an **abstract class** that plugins extend. Consuming plugins must:
1. Extend `Settings_Framework` (or `Setup_Wizard` for wizard-style UIs)
2. Define protected properties: `$option_name`, `$page_slug`, `$plugin_name`, etc.
3. Implement `get_config()` returning a sections/fields configuration array

The framework bootstraps itself in `__construct()` → `init()`, which instantiates the other classes and registers WordPress hooks.

**Core classes and their roles:**
- `Settings_Framework` — abstract base; handles WP hooks, asset enqueueing, AJAX routing, settings save/reset/normalize
- `Admin_Page` — renders the full admin page HTML shell (header, sidebar, content area) using PHP templates
- `Ajax_Handler` — handles `save_*` and `reset_*` AJAX actions, delegates to `Field_Manager`
- `Tool_Ajax_Handler` — handles `asf_tool_action_*` AJAX requests (dashboard widgets, system status, RSS feeds)
- `Field_Manager` — sanitizes/validates settings on save; builds a flat field map from the nested config
- `Field_Renderer` — PHP utility class; lists supported field types (most actual rendering is done in JS)
- `Extensions_Manager` — handles extension list pages: install/activate/deactivate plugins and themes via AJAX
- `Setup_Wizard` — abstract subclass of `Settings_Framework` for multi-step wizard UIs; uses `src/templates/wizard/`
- `System_Status_Handler` — generates system status HTML for the built-in system status content pane

**Settings are stored** as a single WordPress option (`get_option($option_name)`). Toggle/checkbox fields normalize to `1`/`0`; number fields normalize to actual PHP numbers (not strings).

### JavaScript Architecture

The JS is built with Vite from `assets/js/src/settings.js` into `assets/dist/js/settings.js` as an **IIFE** (for WordPress compatibility). Alpine.js and `@alpinejs/sort` are external — enqueued separately by WordPress.

The PHP side passes all data to JS via `window.ayecodeSettingsFramework` (or `window.ayecodeWizardFramework` for wizards), injected with `wp_add_inline_script` before the main script tag. This object contains the full `config`, current `settings`, `ajax_url`, nonces, and i18n `strings`.

### Page Types (config `type` field)

Sections in the config array can declare a `type` which determines which view template is loaded:
- *(none)* → `standard-settings.php` — normal field-based settings
- `custom_page` → `custom-page.php` — arbitrary HTML content
- `action_page` → `action-page.php` — buttons that trigger server-side actions
- `import_page` → `import-page.php` — file upload/import UI
- `list_table` → `list-table.php` — tabular data display
- `dashboard` → `dashboard-page.php` — widget-based dashboard
- `form_builder` → `form-builder.php` — drag-and-drop form builder
- `extension_list_page` → `extension-list-page.php` — install/manage extensions

### AJAX Action Naming Convention

AJAX actions are namespaced by `option_name` or `page_slug`:
- `save_{option_name}` / `reset_{option_name}` — settings persistence
- `asf_tool_action_{page_slug}` — tool/action button handler
- `asf_content_pane_{page_slug}` — content pane loader
- `asf_temp_file_upload_{page_slug}` / `asf_temp_file_delete_{page_slug}` — import file handling

### WordPress Hooks

Key hooks fired by the framework:
- `ayecode_settings_framework_saved` — action after save (receives `$settings`, `$option_name`)
- `ayecode_settings_framework_reset` — action after reset
- `ayecode_settings_framework_defaults_installed` — action after `install_defaults()`
- `ayecode_settings_framework_sections` — filter to inject sections from addons
- `asf_execute_tool_{page_slug}` — action for child class to handle custom tool actions
- `asf_render_content_pane_{page_slug}` — action for child class to handle custom content panes

### Key Implementation Notes

- **`is_connected()` and `is_member_active()` both return `true` hardcoded** with a `@todo remove after testing` comment — these need fixing before production use.
- Settings config is **lazy-loaded** via `get_config_raw()` to avoid overhead on non-settings admin pages.
- Alpine.js scripts get `defer` added automatically via `add_defer_to_alpine_scripts()` filter.
- Temporary import files are stored in `{uploads}/ayecode-sf-import-temp/{page_slug}/` and cleaned up daily via WP-Cron.
- The framework integrates with **AyeCode UI** (Bootstrap 5 WP wrapper) via the `aui_screen_ids` filter.
