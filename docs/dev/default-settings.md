# Default Settings

The AyeCode Settings Framework automatically applies default values to all settings fields. Defaults are merged in-memory whenever settings are accessed, ensuring fields always have their configured default values available.

## Table of Contents

- [Overview](#overview)
- [Automatic Defaults](#automatic-defaults)
- [Installation Methods](#installation-methods)
- [Usage Examples](#usage-examples)
- [Helper Methods](#helper-methods)
- [Type Normalization](#type-normalization)
- [Accessing Settings Externally](#accessing-settings-externally)
- [Hooks](#hooks)

---

## Overview

The framework provides three main public methods for working with default settings:

1. **`get_settings()`** - Automatically merges defaults with saved settings (happens automatically)
2. **`install_defaults($force = false)`** - Saves defaults to the database (one-time setup)
3. **`save_missing_defaults()`** - Saves only missing defaults to database (useful for plugin updates)

All methods automatically normalize types (booleans → integers, strings → numbers) for consistency between PHP and JavaScript.

---

## Automatic Defaults

**New in v1.2.0:** The framework now automatically applies default values when reading settings. You don't need to manually call any methods for defaults to appear in the UI.

### How It Works

When you call `get_settings()` (which happens automatically when rendering the settings page), the framework:

1. Retrieves saved settings from the database
2. Merges in default values for any missing fields
3. Normalizes types for JavaScript compatibility
4. Returns the complete settings array

**What this means:**
- ✅ Defaults work immediately without any setup
- ✅ New fields show their default values automatically
- ✅ No need to call `install_defaults()` unless you want to persist defaults
- ✅ Radio buttons, checkboxes, and all field types show correct defaults

### Example

```php
// Define a field with a default
[
    'id' => 'radio_example',
    'type' => 'radio',
    'options' => [
        'option_one' => 'Option One',
        'option_two' => 'Option Two',
    ],
    'default' => 'option_two',
]
```

**Before v1.2.0:** The radio field would show no selection until you called `install_defaults()`.

**From v1.2.0:** The radio field automatically shows "Option Two" selected, even if the user has never saved settings.

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

### Example 3: Version-Based Migration (Recommended)

Update existing installations with new defaults when plugin version changes:

```php
function my_plugin_check_version() {
    $current_version = get_option('my_plugin_version');
    $new_version = MY_PLUGIN_VERSION; // Define this constant in your main plugin file

    // Only run if version has changed
    if (version_compare($current_version, $new_version, '<')) {
        $settings = new My_Plugin_Settings();

        // Save any new field defaults to database
        $settings->save_missing_defaults();

        // Update version number
        update_option('my_plugin_version', $new_version);
    }
}
add_action('admin_init', 'my_plugin_check_version');
```

**Why this is better:**
- ✅ Automatically runs on every version update
- ✅ Only saves missing defaults (preserves user settings)
- ✅ Simple version tracking
- ✅ No need to manually track migration flags

### Example 3b: Migration Script (Alternative)

If you prefer manual migration flags:

```php
function my_plugin_migrate_to_v2() {
    // Check if migration already ran
    if (get_option('my_plugin_v2_migrated')) {
        return;
    }

    $settings = new My_Plugin_Settings();

    // Save missing defaults
    $settings->save_missing_defaults();

    // Mark as migrated
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

### `save_missing_defaults()`

**New in v1.2.0:** Saves missing default settings to the database. Perfect for plugin updates when new fields are added.

**Parameters:**
- None

**Returns:**
- `true` on success

**Example:**
```php
$settings = new My_Plugin_Settings();

// Save any missing defaults to database
$settings->save_missing_defaults();
```

**When to use:**
- Plugin version updates (add new field defaults)
- After adding new fields to existing plugins
- When you want to persist defaults to the database

**What it does:**
1. Gets current settings from database
2. Merges in defaults for missing fields only
3. Normalizes types
4. Saves back to database

**Important:** This only adds missing fields. It NEVER overwrites existing user settings.

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

// Add missing defaults in memory only
$complete = $settings->fill_missing_defaults($current);

// $current['new_field'] might not exist
// $complete['new_field'] will have the default value
```

**Note:** As of v1.2.0, `get_settings()` automatically calls this method, so you rarely need to call it directly.

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

### 3. Persist Defaults on Activation (Optional)

**New in v1.2.0:** Calling `install_defaults()` is now optional since defaults are automatically applied when reading settings.

```php
// OPTIONAL - Only if you want defaults persisted immediately
register_activation_hook(__FILE__, function() {
    $settings = new My_Plugin_Settings();
    $settings->install_defaults();
});
```

**When to use:**
- ✅ If other code accesses settings via `get_option()` before user visits settings page
- ✅ If you want to guarantee settings exist in database immediately
- ✅ If you want to trigger the `ayecode_settings_framework_defaults_installed` hook

**When NOT needed:**
- ❌ If defaults only need to appear in the settings UI (automatic as of v1.2.0)
- ❌ If all access goes through the framework's `get_settings()` method

### 4. Use save_missing_defaults() for Version Updates

**New in v1.2.0:** When adding new fields in plugin updates:

```php
// RECOMMENDED - Version-based approach
function my_plugin_check_version() {
    $current_version = get_option('my_plugin_version');

    if (version_compare($current_version, MY_PLUGIN_VERSION, '<')) {
        $settings = new My_Plugin_Settings();
        $settings->save_missing_defaults(); // Only saves new fields
        update_option('my_plugin_version', MY_PLUGIN_VERSION);
    }
}
add_action('admin_init', 'my_plugin_check_version');
```

**Why this is better:**
- ✅ Automatically handles version updates
- ✅ Only saves missing fields (never overwrites user data)
- ✅ Simple to maintain

**Don't do this:**
```php
// ❌ BAD - Overwrites all user settings!
$settings->install_defaults(true);
```

### 5. Check Return Value (If Using install_defaults)

```php
// Check if installation was needed
if ($settings->install_defaults()) {
    // First time installation
    do_first_run_setup();
} else {
    // Settings already existed
}
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

**New in v1.2.0:** The default settings system is now fully automatic!

The framework provides:

- ✅ **Automatic defaults** - Work immediately without any setup (new in v1.2.0)
- ✅ **Smart merging** - Preserves all user values when adding defaults
- ✅ **Type-safe** - Normalizes booleans and numbers automatically
- ✅ **Database-backed** - Can persist defaults when needed
- ✅ **Version-friendly** - Easy updates with `save_missing_defaults()`
- ✅ **Hookable** - Actions for installation and reset events

**Recommended workflow (v1.2.0+):**

1. **Define defaults** in your field configuration
   ```php
   ['id' => 'my_field', 'type' => 'text', 'default' => 'value']
   ```

2. **Let defaults work automatically** - They'll appear in UI immediately

3. **For plugin updates**, use version-based migration:
   ```php
   if (version_compare(get_option('my_plugin_version'), MY_PLUGIN_VERSION, '<')) {
       $settings->save_missing_defaults();
       update_option('my_plugin_version', MY_PLUGIN_VERSION);
   }
   ```

4. **Optional:** Call `install_defaults()` on activation if other code needs immediate database access

That's it! The framework handles everything else automatically.
