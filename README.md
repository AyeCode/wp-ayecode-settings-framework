# AyeCode Settings Framework

A modern WordPress settings framework with Alpine.js and Bootstrap 5, designed for creating beautiful, responsive admin interfaces with minimal code.

## Features

- 🎨 **Modern UI** - Clean, responsive interface using Bootstrap 5
- ⚡ **Alpine.js Powered** - Reactive UI without complex build steps
- 🔍 **Smart Search** - Find and edit settings instantly
- 📱 **Mobile Responsive** - Works perfectly on all devices
- 🎛️ **Rich Field Types** - Text, toggles, colors, selects, and more
- 🔒 **Secure** - Built-in validation and sanitization
- 🌐 **Translation Ready** - Full i18n support
- 🚀 **Performance** - Lightweight and fast

## Installation

Install via Composer:

```bash
composer require ayecode//wp-ayecode-settings-framework/
```

## Quick Start

### 1. Create Configuration Array

```php
$config = array(
    'sections' => array(
        array(
            'id' => 'general',
            'name' => 'General Settings',
            'icon' => 'fa-solid fa-gear',
            'fields' => array(
                array(
                    'id' => 'site_title',
                    'type' => 'text',
                    'label' => 'Site Title',
                    'description' => 'Enter your site title',
                    'default' => 'My Awesome Site'
                ),
                array(
                    'id' => 'enable_feature',
                    'type' => 'toggle',
                    'label' => 'Enable Cool Feature',
                    'description' => 'Turn on the cool feature',
                    'default' => true
                )
            )
        )
    )
);
```

### 2. Initialize Framework

```php
use AyeCode\SettingsFramework\Settings_Framework;

// Initialize the framework
new Settings_Framework($config, 'my_plugin_settings', array(
    'plugin_name' => 'My Awesome Plugin',
    'menu_title' => 'Plugin Settings',
    'page_title' => 'My Plugin Settings'
));
```

### 3. Access Settings

```php
// Get all settings
$settings = get_option('my_plugin_settings', array());

// Get specific setting
$site_title = $settings['site_title'] ?? 'Default Title';
```

## Field Types

### Text Fields
```php
array(
    'id' => 'username',
    'type' => 'text',
    'label' => 'Username',
    'placeholder' => 'Enter username...',
    'required' => true
)
```

### Toggle Switches
```php
array(
    'id' => 'enable_notifications',
    'type' => 'toggle',
    'label' => 'Enable Notifications',
    'description' => 'Turn on email notifications',
    'default' => false
)
```

### Select Dropdowns
```php
array(
    'id' => 'theme_style',
    'type' => 'select',
    'label' => 'Theme Style',
    'options' => array(
        'light' => 'Light Theme',
        'dark' => 'Dark Theme',
        'auto' => 'Auto (System)'
    ),
    'default' => 'light'
)
```

### Color Pickers
```php
array(
    'id' => 'brand_color',
    'type' => 'color',
    'label' => 'Brand Color',
    'default' => '#0073aa'
)
```

### Number Fields
```php
array(
    'id' => 'max_items',
    'type' => 'number',
    'label' => 'Maximum Items',
    'min' => 1,
    'max' => 100,
    'step' => 1,
    'default' => 10
)
```

## Sections with Subsections

```php
array(
    'id' => 'advanced',
    'name' => 'Advanced Settings',
    'icon' => 'fa-solid fa-tools',
    'subsections' => array(
        array(
            'id' => 'performance',
            'name' => 'Performance',
            'icon' => 'fa-solid fa-tachometer-alt',
            'fields' => array(
                // Performance fields here
            )
        ),
        array(
            'id' => 'security', 
            'name' => 'Security',
            'icon' => 'fa-solid fa-shield-alt',
            'fields' => array(
                // Security fields here
            )
        )
    )
)
```

## Search Functionality

Add searchable terms to fields for better discovery:

```php
array(
    'id' => 'google_maps_api_key',
    'type' => 'password',
    'label' => 'Google Maps API Key',
    'searchable' => array('google', 'maps', 'api', 'key', 'geolocation')
)
```

## Validation

### Built-in Validation
```php
array(
    'id' => 'email_address',
    'type' => 'email',
    'label' => 'Email Address',
    'required' => true
)
```

### Custom Validation
```php
array(
    'id' => 'custom_field',
    'type' => 'text',
    'label' => 'Custom Field',
    'validate_callback' => 'my_custom_validator'
)

function my_custom_validator($value, $field) {
    if (strlen($value) < 5) {
        return new WP_Error('too_short', 'Value must be at least 5 characters');
    }
    return true;
}
```

## Addon Integration

Your addons can inject settings into existing sections:

```php
// In your addon
add_filter('ayecode_settings_framework_sections', function($sections) {
    // Add new section
    $sections[] = array(
        'id' => 'my_addon',
        'name' => 'My Addon Settings',
        'icon' => 'fa-solid fa-puzzle-piece',
        'fields' => array(
            // Addon fields here
        )
    );
    
    return $sections;
});
```

## Hooks & Filters

### Actions
```php
// After settings are saved
add_action('ayecode_settings_framework_saved', function($settings, $option_name) {
    // Clear caches, trigger updates, etc.
}, 10, 2);

// After settings are reset
add_action('ayecode_settings_framework_reset', function($option_name) {
    // Handle reset logic
});
```

### Filters
```php
// Modify sections before rendering
add_filter('ayecode_settings_framework_sections', function($sections) {
    // Modify or add sections
    return $sections;
});
```

## Styling

The framework uses Bootstrap 5 with minimal custom CSS. To customize:

```css
/* Override framework colors */
:root {
    --asf-blue: #your-color;
    --asf-blue-dark: #your-dark-color;
}

/* Custom field styling */
.your-plugin .form-control {
    border-radius: 8px;
}
```

## JavaScript Integration

Access the Alpine.js app:

```javascript
// Listen for settings changes
document.addEventListener('alpine:init', () => {
    Alpine.data('customExtension', () => ({
        // Your custom Alpine.js data/methods
    }));
});
```

## Requirements

- PHP 7.4+
- WordPress 5.0+
- Modern browser with JavaScript enabled

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## License

GPL-3.0-or-later

## Support

- [GitHub Issues](https://github.com/AyeCode//wp-ayecode-settings-framework//issues)
- [Documentation](https://ayecode.io//wp-ayecode-settings-framework/-docs)
- [Community Support](https://ayecode.io/support)

---


## 🛠️ Building Assets with Vite

This plugin uses [Vite](https://vitejs.dev/) to bundle and optimize its JavaScript.  
We build in **IIFE format** so the output can be safely enqueued in WordPress without requiring a module loader.

### 📦 Prerequisites
- Node.js (LTS version recommended, e.g. 20.x)
- npm or yarn

### 🔧 Setup
```bash
# install dependencies
npm install
```

### 🚀 Development

```bash
npm run dev
```

- Vite will serve unminified builds.
- Update `vite.config.js → server.origin` if you need a different dev URL.

### 🏗️ Production Build
Build optimized assets into `assets/dist`:

```bash
npm run build
```

- Output JS is placed under `assets/dist/js/`
- Filenames follow the entry name (`settings.js`, `admin-keys.js`, etc).
- A `manifest.json` is generated in `assets/dist/` for PHP to resolve correct asset paths.

### 📂 Entry Points
Each entry corresponds to a separate admin screen:

- `settings.js` → Settings Framework (Alpine.js app)
- `admin-keys.js` → API Keys admin page

You can add more entries in `vite.config.js → build.rollupOptions.input`.

### ⚙️ Notes
- **Alpine.js is external** — it’s enqueued separately in WordPress, not bundled.
- Output is an **IIFE** (immediately-invoked function expression) for WP compatibility.
- Static assets (images, fonts, etc.) are handled by WordPress enqueueing, not via Vite’s `public/` folder.


Made with ❤️ by [AyeCode Ltd](https://ayecode.io)