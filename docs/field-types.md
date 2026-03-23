# Field Types Reference

Complete reference for all field types and their parameters in the WP AyeCode Settings Framework.

---

## Common Parameters

These parameters are available for **all or most field types**:

### Core Parameters
- **`id`** (string, required) - Unique identifier for the field
- **`type`** (string, required) - The field type (see Field Types below)
- **`label`** (string) - Label text displayed for the field
- **`description`** (string) - Help text displayed below the field (also `desc` alias)
- **`default`** (mixed) - Default value for the field
- **`class`** (string) - Additional CSS classes for the input element
- **`placeholder`** (string) - Placeholder text for input fields
- **`extra_attributes`** (array) - Additional HTML attributes
  - Example: `'extra_attributes' => ['required' => true, 'data-custom' => 'value']`

### Advanced Parameters
- **`custom_desc`** (string) - Custom description HTML (allows raw HTML)
- **`searchable`** (array) - Search terms to make field discoverable
  - Example: `'searchable' => ['google', 'maps', 'api', 'key']`
- **`show_if`** (string) - Conditional display logic (supports parentheses, &&, ||, comparisons)
  - Example: `'show_if' => "[%other_field%] == 'value' && [%another%] != ''""`
- **`input_group_right`** (string) - HTML to append to right of input
  - Example: `'input_group_right' => '<span class="input-group-text">%</span>'`
- **`active_placeholder`** (bool) - Auto-fill placeholder value on focus

---

## Text Input Fields

### text
Standard single-line text input.

```php
[
    'id' => 'site_title',
    'type' => 'text',
    'label' => 'Site Title',
    'description' => 'Enter your site title',
    'default' => 'My Site',
    'placeholder' => 'Enter title...'
]
```

### email
Email input with validation.

```php
[
    'id' => 'contact_email',
    'type' => 'email',
    'label' => 'Contact Email',
    'placeholder' => 'email@example.com'
]
```

### url
URL input with validation.

```php
[
    'id' => 'website_url',
    'type' => 'url',
    'label' => 'Website URL',
    'placeholder' => 'https://example.com'
]
```

### slug
Auto-sanitizing text (lowercase, hyphens only).

```php
[
    'id' => 'post_slug',
    'type' => 'slug',
    'label' => 'URL Slug',
    'placeholder' => 'my-post-slug'
]
```

### password
Masked text input.

```php
[
    'id' => 'api_secret',
    'type' => 'password',
    'label' => 'API Secret'
]
```

### google_api_key
Password field that reveals on focus.

```php
[
    'id' => 'google_maps_key',
    'type' => 'google_api_key',
    'label' => 'Google Maps API Key'
]
```

### textarea
Multi-line text area.

**Additional Parameters:**
- `rows` (int) - Number of visible rows (default: 5)

```php
[
    'id' => 'about_text',
    'type' => 'textarea',
    'label' => 'About',
    'rows' => 10
]
```

### number
Numeric input with controls.

**Additional Parameters:**
- `min` (number) - Minimum value
- `max` (number) - Maximum value
- `step` (number) - Increment step

```php
[
    'id' => 'max_items',
    'type' => 'number',
    'label' => 'Maximum Items',
    'min' => 1,
    'max' => 100,
    'step' => 1,
    'default' => 10
]
```

---

## Selection Fields

### checkbox
Single checkbox for yes/no values.

```php
[
    'id' => 'enable_feature',
    'type' => 'checkbox',
    'label' => 'Enable Feature',
    'description' => 'Check to enable',
    'default' => '1'
]
```

### toggle
Bootstrap-style toggle switch.

```php
[
    'id' => 'is_active',
    'type' => 'toggle',
    'label' => 'Active',
    'default' => true
]
```

### radio
Radio buttons (vertical list).

**Additional Parameters:**
- `options` (array, required) - Key-value pairs

```php
[
    'id' => 'layout',
    'type' => 'radio',
    'label' => 'Layout Style',
    'options' => [
        'grid' => 'Grid Layout',
        'list' => 'List Layout'
    ],
    'default' => 'grid'
]
```

### radio_group
Radio buttons as button group.

**Additional Parameters:**
- `options` (array, required) - Key-value pairs
- `button_style` (string) - Bootstrap button style (default: 'outline-primary')
- `button_size` (string) - Size: '', 'btn-group-sm', 'btn-group-lg'

```php
[
    'id' => 'size',
    'type' => 'radio_group',
    'label' => 'Size',
    'options' => [
        'small' => 'Small',
        'medium' => 'Medium',
        'large' => 'Large'
    ],
    'button_style' => 'outline-primary',
    'default' => 'medium'
]
```

### radio_card_group
Radio buttons as cards with icons.

**Additional Parameters:**
- `options` (array, required) - Can be strings or objects with:
  - `label` (string) - Card title
  - `description` (string) - Card description
  - `icon` (string) - FontAwesome icon class
  - `icon_color` (string) - CSS color for icon
  - `image` (string) - Image URL (overrides icon)
  - `html` (string) - Custom HTML (overrides image/icon)

```php
[
    'id' => 'plan',
    'type' => 'radio_card_group',
    'label' => 'Select Plan',
    'options' => [
        'basic' => [
            'label' => 'Basic',
            'icon' => 'fa-solid fa-user',
            'description' => 'Basic features'
        ],
        'pro' => [
            'label' => 'Pro',
            'icon' => 'fa-solid fa-star',
            'icon_color' => '#ffc107',
            'description' => 'Pro features'
        ]
    ],
    'default' => 'pro'
]
```

### checkbox_group
Multiple checkboxes for multi-selection.

**Additional Parameters:**
- `options` (array, required) - Key-value pairs
- `default` (array) - Array of selected values

```php
[
    'id' => 'features',
    'type' => 'checkbox_group',
    'label' => 'Features',
    'options' => [
        'feature_1' => 'Feature 1',
        'feature_2' => 'Feature 2'
    ],
    'default' => ['feature_1']
]
```

### checkbox_card_group
Multiple checkboxes as cards.

**Additional Parameters:**
- Same as `radio_card_group`
- `default` (array) - Array of selected values

```php
[
    'id' => 'addons',
    'type' => 'checkbox_card_group',
    'label' => 'Add-ons',
    'options' => [
        'addon_1' => [
            'label' => 'Add-on 1',
            'icon' => 'fa-solid fa-puzzle-piece'
        ]
    ],
    'default' => ['addon_1']
]
```

### select
Dropdown select menu.

**Additional Parameters:**
- `options` (array, required) - Simple or nested (optgroups)
- `placeholder` (string) - Adds empty first option
- `class` (string) - Use 'aui-select2' for enhanced select

```php
[
    'id' => 'country',
    'type' => 'select',
    'label' => 'Country',
    'placeholder' => 'Select...',
    'options' => [
        'us' => 'United States',
        'uk' => 'United Kingdom'
    ],
    'class' => 'aui-select2'
]
```

**With optgroups:**
```php
[
    'id' => 'location',
    'type' => 'select',
    'label' => 'Location',
    'options' => [
        'North America' => [
            'us' => 'United States',
            'ca' => 'Canada'
        ],
        'Europe' => [
            'uk' => 'United Kingdom'
        ]
    ]
]
```

### multiselect
Multiple selection dropdown.

**Additional Parameters:**
- `options` (array, required) - Same as select
- `placeholder` (string)
- `default` (array) - Array of selected values

```php
[
    'id' => 'user_roles',
    'type' => 'multiselect',
    'label' => 'Allowed Roles',
    'placeholder' => 'Select roles...',
    'options' => [
        'administrator' => 'Administrator',
        'editor' => 'Editor'
    ],
    'default' => ['administrator']
]
```

---

## Media Fields

### color
Color picker with hex input.

```php
[
    'id' => 'primary_color',
    'type' => 'color',
    'label' => 'Primary Color',
    'default' => '#0055ff'
]
```

### image
WordPress media library image picker.

```php
[
    'id' => 'logo_image',
    'type' => 'image',
    'label' => 'Logo'
]
```

### file
File upload input.

**Additional Parameters:**
- `accept` (string) - File type restrictions

```php
[
    'id' => 'import_file',
    'type' => 'file',
    'label' => 'Import File',
    'accept' => '.csv,.json'
]
```

### icon
FontAwesome icon picker (also `font-awesome`).

```php
[
    'id' => 'menu_icon',
    'type' => 'icon',
    'label' => 'Menu Icon',
    'default' => 'fa-solid fa-bars'
]
```

---

## Range & Slider

### range
Range slider with live value display.

**Additional Parameters:**
- `min` (number) - Minimum (default: 0)
- `max` (number) - Maximum (default: 100)
- `step` (number) - Step increment (default: 1)

```php
[
    'id' => 'opacity',
    'type' => 'range',
    'label' => 'Opacity',
    'min' => 0,
    'max' => 100,
    'step' => 5,
    'default' => 80
]
```

---

## Special Fields

### alert
Informational alert box (not an input).

**Additional Parameters:**
- `alert_type` (string) - Bootstrap alert type: 'info', 'success', 'warning', 'danger'

```php
[
    'type' => 'alert',
    'label' => 'Important Notice',
    'description' => 'Please read the documentation.',
    'alert_type' => 'warning'
]
```

### hidden
Hidden input field.

```php
[
    'id' => 'user_id',
    'type' => 'hidden',
    'default' => '123'
]
```

### link_button
Link styled as a button.

**Additional Parameters:**
- `url` (string, required) - Link URL
- `button_text` (string) - Button label
- `button_class` (string) - Bootstrap button class
- `target` (string) - Link target (e.g., '_blank')

```php
[
    'id' => 'docs_link',
    'type' => 'link_button',
    'label' => 'Documentation',
    'url' => 'https://docs.example.com',
    'button_text' => 'View Docs',
    'button_class' => 'btn-primary',
    'target' => '_blank'
]
```

### action_button
AJAX action button with progress tracking.

**Additional Parameters:**
- `button_text` (string) - Button label
- `button_class` (string) - Bootstrap button class
- `ajax_action` (string, required) - AJAX action identifier

```php
[
    'id' => 'clear_cache',
    'type' => 'action_button',
    'label' => 'Clear Cache',
    'button_text' => 'Clear Now',
    'button_class' => 'btn-primary',
    'ajax_action' => 'clear_cache_action'
]
```

---

## Container Fields

### group
Groups fields in a card container.

**Additional Parameters:**
- `fields` (array, required) - Fields to group

```php
[
    'id' => 'social_settings',
    'type' => 'group',
    'label' => 'Social Media',
    'fields' => [
        [
            'id' => 'facebook_url',
            'type' => 'url',
            'label' => 'Facebook'
        ],
        [
            'id' => 'twitter_url',
            'type' => 'url',
            'label' => 'Twitter'
        ]
    ]
]
```

### accordion
Collapsible accordion panels.

**Additional Parameters:**
- `fields` (array, required) - Panel configurations with:
  - `id` (string, required) - Panel ID
  - `label` (string) - Panel heading
  - `description` (string) - Panel description
  - `open` (bool) - Start open
  - `fields` (array, required) - Fields in panel
- `default_open` (string) - ID of panel to open by default

```php
[
    'id' => 'advanced_settings',
    'type' => 'accordion',
    'default_open' => 'general_panel',
    'fields' => [
        [
            'id' => 'general_panel',
            'label' => 'General',
            'fields' => [
                ['id' => 'setting_a', 'type' => 'text', 'label' => 'Setting A']
            ]
        ],
        [
            'id' => 'advanced_panel',
            'label' => 'Advanced',
            'fields' => [
                ['id' => 'setting_b', 'type' => 'text', 'label' => 'Setting B']
            ]
        ]
    ]
]
```

---

## Advanced Fields

### gd_map
Google Maps with lat/lng inputs.

**Additional Parameters:**
- `lat_field` (string, required) - Latitude field ID
- `lng_field` (string, required) - Longitude field ID

```php
[
    'id' => 'location_map',
    'type' => 'gd_map',
    'label' => 'Location',
    'lat_field' => 'latitude',
    'lng_field' => 'longitude'
]
```

### helper_tags
Clickable tags that copy to clipboard.

**Additional Parameters:**
- `options` (object, required) - Tag text => Tooltip description

```php
[
    'id' => 'template_tags',
    'type' => 'helper_tags',
    'label' => 'Template Tags',
    'description' => 'Click to copy',
    'options' => [
        '{site_name}' => 'The site name',
        '{user_name}' => 'Current user'
    ]
]
```

### conditions
Conditional logic builder.

**Additional Parameters:**
- `warning_key` (string) - Field property to check
- `warning_fields` (array) - Values triggering warnings

```php
[
    'id' => 'conditional_logic',
    'type' => 'conditions',
    'warning_key' => 'field_name',
    'warning_fields' => ['required_field']
]
```

### custom_renderer
Custom JavaScript rendering function.

**Additional Parameters:**
- `renderer_function` (string, required) - Global JS function name

```php
[
    'id' => 'custom_field',
    'type' => 'custom_renderer',
    'renderer_function' => 'myCustomRenderer'
]
```

JavaScript:
```javascript
window.myCustomRenderer = function(field) {
    return '<div>Custom HTML</div>';
};
```

---

## Validation & Conditionals

### Required Fields
Use `extra_attributes` to mark fields as required:

```php
[
    'id' => 'required_field',
    'type' => 'text',
    'label' => 'Required Field',
    'extra_attributes' => ['required' => true]
]
```

**Note:** Fields hidden by `show_if` are automatically excluded from required validation.

### Conditional Display
Use `show_if` to show/hide fields based on other field values:

```php
// Simple comparison
'show_if' => "[%enable_feature%] == '1'"

// Multiple conditions with AND
'show_if' => "[%type%] == 'premium' && [%active%] == '1'"

// Multiple conditions with OR
'show_if' => "[%plan%] == 'pro' || [%plan%] == 'enterprise'"

// Complex with parentheses
'show_if' => "[%active%] == '1' && ([%type%] == 'A' || [%type%] == 'B')"

// Comparisons: ==, !=, >, <, >=, <=
'show_if' => "[%count%] > 10"
```

---

## Quick Reference Table

| Type | Purpose | Key Parameters |
|------|---------|----------------|
| `text` | Single-line text | `placeholder` |
| `email` | Email input | Same as text |
| `url` | URL input | Same as text |
| `slug` | Auto-sanitizing slug | Same as text |
| `password` | Masked text | Same as text |
| `google_api_key` | Reveal-on-focus password | Same as text |
| `textarea` | Multi-line text | `rows` |
| `number` | Numeric input | `min`, `max`, `step` |
| `checkbox` | Single checkbox | - |
| `toggle` | Toggle switch | - |
| `radio` | Radio buttons | `options` |
| `radio_group` | Button group radios | `options`, `button_style` |
| `radio_card_group` | Card radios | `options` (with icon/image) |
| `checkbox_group` | Multiple checkboxes | `options` |
| `checkbox_card_group` | Card checkboxes | `options` (with icon/image) |
| `select` | Dropdown select | `options`, `placeholder` |
| `multiselect` | Multiple select | `options`, `placeholder` |
| `color` | Color picker | - |
| `range` | Range slider | `min`, `max`, `step` |
| `image` | Image upload | - |
| `file` | File upload | `accept` |
| `icon` | Icon picker | - |
| `alert` | Info alert | `alert_type` |
| `hidden` | Hidden input | - |
| `link_button` | Button link | `url`, `button_text` |
| `action_button` | AJAX button | `ajax_action`, `button_text` |
| `group` | Field container | `fields` |
| `accordion` | Collapsible panels | `fields`, `default_open` |
| `gd_map` | Map with lat/lng | `lat_field`, `lng_field` |
| `helper_tags` | Copyable tags | `options` |
| `conditions` | Conditional logic | `warning_key` |
| `custom_renderer` | Custom JS | `renderer_function` |
