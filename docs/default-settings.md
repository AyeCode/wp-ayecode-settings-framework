# Default Settings

The AyeCode Settings Framework provides manual methods to manage default values for your settings fields, giving you full control over when and how defaults are installed.

## Table of Contents

- [Overview](#overview)
- [Installation Methods](#installation-methods)
- [Usage Examples](#usage-examples)
- [Helper Methods](#helper-methods)
- [Type Normalization](#type-normalization)
- [Accessing Settings Externally](#accessing-settings-externally)
- [Hooks](#hooks)

---

## Overview

The framework provides two main public methods for working with default settings:

1. **`install_defaults($force = false)`** - Saves defaults to the database (one-time setup)
2. **`fill_missing_defaults($settings)`** - Merges defaults in memory (useful for runtime)

Both methods automatically normalize types (booleans → integers, strings → numbers) for consistency between PHP and JavaScript.

---

## Installation Methods

### Method 1: Plugin Activation Hook (Recommended)

The most common approach is to install defaults when your plugin is activated:

```php
// In your main plugin file
register_activation_hook(__FILE__, 'my_plugin_install_defaults');

function my_plugin_install_defaults() {
    $settings = new My_Plugin_Settings();
    $settings->install_defaults();
}
```

**What this does:**
- Checks if settings option exists in database
- If not, extracts all defaults from field config
- Normalizes types (true → 1, "8" → 8)
- Saves to database
- Fires `ayecode_settings_framework_defaults_installed` action
- Returns `true` if installed, `false` if option already exists

### Method 2: First Admin Load

Install defaults the first time an admin visits your settings page:

```php
class My_Plugin_Settings extends Settings_Framework {

    public function __construct() {
        parent::__construct();

        // Install defaults on first admin visit
        add_action('admin_init', [$this, 'maybe_install_defaults']);
    }

    public function maybe_install_defaults() {
        // Only run on our settings page
        if (!isset($_GET['page']) || $_GET['page'] !== $this->page_slug) {
            return;
        }

        // Install if not already installed (returns false if exists)
        $this->install_defaults();
    }
}
```

### Method 3: Manual Installation

Call the method whenever you need to install defaults:

```php
$settings = new My_Plugin_Settings();

// Install defaults (only if option doesn't exist)
if ($settings->install_defaults()) {
    echo 'Defaults installed!';
} else {
    echo 'Settings already exist.';
}
```

### Method 4: Force Reinstall Defaults

Reset all settings to defaults, overwriting existing values:

```php
$settings = new My_Plugin_Settings();
$settings->install_defaults(true);  // Force = true, overwrites existing
```

**Warning:** This will overwrite all user settings! Use with caution.

---

## Usage Examples

### Example 1: Basic Field with Default

```php
public function get_config() {
    return [
        'sections' => [
            [
                'id' => 'general',
                'name' => 'General Settings',
                'fields' => [
                    [
                        'id' => 'enable_feature',
                        'type' => 'toggle',
                        'label' => 'Enable Feature',
                        'default' => true,  // Will be saved as 1 (integer)
                    ],
                    [
                        'id' => 'max_items',
                        'type' => 'number',
                        'label' => 'Maximum Items',
                        'default' => 10,  // Will be saved as 10 (integer, not "10" string)
                    ],
                    [
                        'id' => 'site_title',
                        'type' => 'text',
                        'label' => 'Site Title',
                        'default' => 'My Site',
                    ],
                ],
            ],
        ],
    ];
}
```

**After calling `install_defaults()`:**
Database will contain:
```php
[
    'enable_feature' => 1,
    'max_items' => 10,
    'site_title' => 'My Site'
]
```

### Example 2: Fill Missing Defaults at Runtime

Use `fill_missing_defaults()` when you need defaults in memory without saving:

```php
function get_my_setting($key) {
    $settings_framework = new My_Plugin_Settings();

    // Get raw settings from DB
    $settings = $settings_framework->get_settings();

    // Merge with defaults (in memory only, doesn't save)
    $settings = $settings_framework->fill_missing_defaults($settings);

    return $settings[$key] ?? null;
}
```

**Use case:** When you're adding new fields and want them to have defaults even before user saves.

### Example 3: Migration Script

Update existing installations with new defaults:

```php
function my_plugin_migrate_to_v2() {
    // Check if migration already ran
    if (get_option('my_plugin_v2_migrated')) {
        return;
    }

    $settings = new My_Plugin_Settings();
    $current = $settings->get_settings();

    // Add new defaults for v2 fields
    $current = $settings->fill_missing_defaults($current);

    // Save updated settings
    update_option('my_plugin_settings', $current);
    update_option('my_plugin_v2_migrated', true);
}
add_action('admin_init', 'my_plugin_migrate_to_v2');
```

### Example 4: Hook Into Installation

```php
add_action('ayecode_settings_framework_defaults_installed', 'my_after_install', 10, 2);

function my_after_install($settings, $option_name) {
    if ($option_name === 'my_plugin_settings') {
        error_log('Defaults installed: ' . print_r($settings, true));

        // Perform setup tasks
        flush_rewrite_rules();

        // Send welcome email
        wp_mail(
            get_option('admin_email'),
            'Plugin Activated',
            'Your settings have been initialized!'
        );
    }
}
```

---

## Helper Methods

### `install_defaults($force = false)`

Installs default settings to the database.

**Parameters:**
- `$force` (bool) - If true, overwrites existing settings. Default: false

**Returns:**
- `true` if defaults were installed
- `false` if settings already exist (unless force = true)

**Example:**
```php
$settings = new My_Plugin_Settings();

// Safe install (won't overwrite)
$installed = $settings->install_defaults();

// Force install (overwrites everything!)
$settings->install_defaults(true);
```

### `fill_missing_defaults($settings)`

Merges default values for missing keys. Does NOT save to database.

**Parameters:**
- `$settings` (array) - Current settings array

**Returns:**
- (array) Settings with missing defaults filled in

**Example:**
```php
$settings = new My_Plugin_Settings();
$current = $settings->get_settings();  // From DB

// Add missing defaults
$complete = $settings->fill_missing_defaults($current);

// $current['new_field'] might not exist
// $complete['new_field'] will have the default value
```

### `reset_settings()`

Resets all settings to their default values (existing method, enhanced with normalization).

**Returns:**
- `true` on success
- `false` on failure

**Example:**
```php
$settings = new My_Plugin_Settings();
$settings->reset_settings();  // Resets to normalized defaults
```

---

## Type Normalization

All default setting methods automatically normalize data types for consistency between PHP and JavaScript.

### Toggle/Checkbox Fields

**Input (various types accepted):**
```php
'default' => true       // boolean
'default' => false      // boolean
'default' => 1          // integer
'default' => 0          // integer
'default' => "1"        // string
'default' => "0"        // string
'default' => "true"     // string
'default' => "false"    // string
```

**Output (always normalized to):**
```php
1  // integer for true/enabled
0  // integer for false/disabled
```

### Number/Range Fields

**Input:**
```php
'default' => 8      // integer
'default' => 8.5    // float
'default' => "8"    // string
'default' => "8.5"  // string
```

**Output:**
```php
8    // integer
8.5  // float (actual number, not string)
```

### Why Normalization Matters

**Without normalization:**
```javascript
// JavaScript gets inconsistent types
if (settings.enable_feature === "1") { }   // Fragile string comparison
if (settings.max_size === "8") { }         // Wrong type
```

**With normalization:**
```javascript
// Clean, typed comparisons
if (settings.enable_feature === 1) { }  // Reliable
if (settings.max_size === 8) { }        // Correct
```

---

## Accessing Settings Externally

After calling `install_defaults()`, settings are in the WordPress database and accessible via standard functions.

### From Other Plugins/Themes

```php
// Anywhere in WordPress
$settings = get_option('my_plugin_settings');

// Access individual settings
$enabled = $settings['enable_feature'];  // Returns: 1 or 0
$max = $settings['max_items'];           // Returns: 10 (integer)
```

### In Template Files

```php
<?php
$settings = get_option('my_plugin_settings');
if ($settings['show_header'] == 1) {
    get_template_part('header', 'custom');
}
?>
```

### In REST API Endpoints

```php
register_rest_route('myplugin/v1', '/settings', [
    'methods' => 'GET',
    'callback' => function() {
        $settings = get_option('my_plugin_settings');
        return rest_ensure_response($settings);
    },
]);
```

### In WP-CLI Commands

```php
class My_CLI_Command {
    public function check_setting($args) {
        $settings = get_option('my_plugin_settings');
        WP_CLI::line("Feature enabled: " . $settings['enable_feature']);
    }
}
```

---

## Hooks

### Action: `ayecode_settings_framework_defaults_installed`

Fires when defaults are installed to the database via `install_defaults()`.

**Parameters:**
- `$settings` (array): The normalized settings that were saved
- `$option_name` (string): The WordPress option name

**Example:**
```php
add_action('ayecode_settings_framework_defaults_installed', function($settings, $option_name) {
    if ($option_name === 'my_plugin_settings') {
        // Run setup tasks
        do_action('my_plugin_initialized');

        // Log event
        error_log('Plugin settings initialized');

        // Set flag for first-time setup
        update_option('my_plugin_first_run', true);
    }
}, 10, 2);
```

### Action: `ayecode_settings_framework_reset`

Fires when settings are reset to defaults via `reset_settings()`.

**Parameters:**
- `$defaults` (array): The normalized default settings
- `$option_name` (string): The WordPress option name

**Example:**
```php
add_action('ayecode_settings_framework_reset', function($defaults, $option_name) {
    if ($option_name === 'my_plugin_settings') {
        // Clear caches
        wp_cache_flush();

        // Reset related data
        delete_transient('my_plugin_cache');

        // Log reset
        error_log('Settings reset to defaults');
    }
}, 10, 2);
```

---

## Best Practices

### 1. Always Define Defaults

```php
// GOOD
[
    'id' => 'max_items',
    'type' => 'number',
    'default' => 10,  // Always provide default
]

// BAD
[
    'id' => 'max_items',
    'type' => 'number',
    // Missing default - field will be empty on fresh install
]
```

### 2. Use Appropriate Types

```php
// GOOD - Use natural types
['type' => 'toggle', 'default' => true]    // boolean (becomes 1)
['type' => 'number', 'default' => 10]      // integer
['type' => 'text', 'default' => 'hello']   // string

// ACCEPTABLE - Will be normalized
['type' => 'toggle', 'default' => "1"]     // string → 1 (int)
['type' => 'number', 'default' => "10"]    // string → 10 (int)
```

### 3. Install on Activation

```php
// RECOMMENDED
register_activation_hook(__FILE__, function() {
    $settings = new My_Plugin_Settings();
    $settings->install_defaults();
});
```

This ensures:
- ✅ Settings exist immediately after activation
- ✅ Other code can use `get_option()` right away
- ✅ No waiting for first admin visit

### 4. Check Return Value

```php
// Check if installation was needed
if ($settings->install_defaults()) {
    // First time installation
    do_first_run_setup();
} else {
    // Settings already existed
}
```

### 5. Use fill_missing_defaults() for New Fields

When adding new fields to existing plugins:

```php
// Don't force reinstall (loses user data)
// $settings->install_defaults(true);  ❌

// Instead, merge missing defaults at runtime
$current = $settings->get_settings();
$complete = $settings->fill_missing_defaults($current);  ✅
```

---

## Troubleshooting

### Defaults Not Appearing

**Problem:** Settings page shows empty values after calling `install_defaults()`.

**Solution:** Check that:
1. `install_defaults()` returned `true` (actually installed)
2. Field IDs in config match the saved option keys
3. Defaults are defined in field config
4. Browser cache is cleared

```php
// Debug
$settings = new My_Plugin_Settings();
$result = $settings->install_defaults();
var_dump($result);  // Should be true on first run

$data = get_option('my_plugin_settings');
var_dump($data);  // Should show all defaults
```

### Wrong Types in Database

**Problem:** Legacy data has wrong types (strings instead of integers).

**Solution:** Call `install_defaults(true)` once to fix types:

```php
// One-time migration
function my_plugin_fix_types() {
    if (get_option('my_plugin_types_fixed')) {
        return;
    }

    $settings = new My_Plugin_Settings();
    $settings->install_defaults(true);  // Force reinstall with correct types

    update_option('my_plugin_types_fixed', true);
}
add_action('admin_init', 'my_plugin_fix_types');
```

**Warning:** This overwrites user settings! Only use for type fixes, not for adding new fields.

### External Code Not Seeing Settings

**Problem:** `get_option('my_plugin_settings')` returns empty array.

**Solution:** Ensure `install_defaults()` was called:

```php
// Check if defaults are installed
$settings = get_option('my_plugin_settings');
if (empty($settings)) {
    // Not installed yet - install now
    $framework = new My_Plugin_Settings();
    $framework->install_defaults();
}
```

---

## Summary

The default settings system provides:

- ✅ **Manual control** - You decide when to install defaults
- ✅ **Smart merging** - `fill_missing_defaults()` preserves user values
- ✅ **Type-safe** - Normalizes booleans and numbers automatically
- ✅ **Database-backed** - Accessible via `get_option()` everywhere
- ✅ **Flexible** - Works on activation, first load, or manual call
- ✅ **Hookable** - Actions for installation and reset events

**Recommended workflow:**
1. Define `'default'` values in your field configuration
2. Call `install_defaults()` in activation hook
3. Use `fill_missing_defaults()` when adding new fields to existing installs
4. Let the framework handle type normalization automatically
