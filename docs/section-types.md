# Section Types Reference

Complete reference for all section types in the WP AyeCode Settings Framework.

Sections are top-level containers in the settings framework that define entire pages or tabs in your admin interface.

---

## Common Section Parameters

These parameters are available for **all section types**:

- **`id`** (string, required) - Unique identifier for the section
- **`name`** (string, required) - Display name shown in navigation
- **`icon`** (string) - FontAwesome icon class for the section
  - Example: `'icon' => 'fa-solid fa-gear'`
- **`description`** (string) - Optional description text
- **`searchable`** (array) - Search terms to make the section discoverable
  - Example: `'searchable' => ['settings', 'configuration', 'options']`

---

## Standard Section (Settings Fields)

The default section type for standard settings pages with form fields.

### Parameters
- All common parameters
- **`fields`** (array, required) - Array of field configurations
- **`subsections`** (array) - Optional subsections to organize fields

### Example

```php
[
    'id' => 'general',
    'name' => 'General Settings',
    'icon' => 'fa-solid fa-gear',
    'searchable' => ['settings', 'configuration'],
    'fields' => [
        [
            'id' => 'site_title',
            'type' => 'text',
            'label' => 'Site Title',
            'default' => 'My Site'
        ],
        [
            'id' => 'enable_feature',
            'type' => 'toggle',
            'label' => 'Enable Feature'
        ]
    ]
]
```

### With Subsections

```php
[
    'id' => 'advanced',
    'name' => 'Advanced Settings',
    'icon' => 'fa-solid fa-sliders',
    'subsections' => [
        [
            'id' => 'performance',
            'name' => 'Performance',
            'fields' => [
                ['id' => 'cache_enabled', 'type' => 'toggle', 'label' => 'Enable Cache']
            ]
        ],
        [
            'id' => 'security',
            'name' => 'Security',
            'fields' => [
                ['id' => 'ssl_required', 'type' => 'toggle', 'label' => 'Require SSL']
            ]
        ]
    ]
]
```

---

## list_table

CRUD interface with data table, modals, filters, and bulk actions.

### Parameters
- All common parameters
- **`type`** => `'list_table'` (required)
- **`table_config`** (array, required) - Table configuration
- **`modal_config`** (array, required) - Modal form configuration
- **`post_create_view`** (array, optional) - Success view after creation

### table_config Parameters

- **`singular`** (string) - Singular item name (e.g., "API Key")
- **`plural`** (string) - Plural item name (e.g., "API Keys")
- **`ajax_action_get`** (string, required) - AJAX action to fetch items
- **`ajax_action_bulk`** (string, required) - AJAX action for bulk operations
- **`columns`** (array, required) - Column definitions
  - Format: `'column_key' => ['label' => 'Column Label']`
- **`statuses`** (array, optional) - Status filtering configuration
  - `status_key` (string) - Field to use for status
  - `labels` (array) - Status value => label mapping
  - `default_status` (string) - Default selected status
- **`filters`** (array, optional) - Additional filter dropdowns
  - `id` (string) - Filter field ID
  - `placeholder` (string) - Dropdown placeholder
  - `options` (array) - Filter options
- **`bulk_actions`** (array, optional) - Bulk action options
  - Format: `'action_key' => 'Action Label'`

### modal_config Parameters

- **`title_add`** (string) - Modal title for adding new item
- **`title_edit`** (string) - Modal title for editing item
- **`ajax_action_create`** (string, required) - AJAX action to create item
- **`ajax_action_update`** (string, required) - AJAX action to update item
- **`ajax_action_delete`** (string, required) - AJAX action to delete item
- **`fields`** (array, required) - Form fields (same format as section fields)

### post_create_view Parameters

Optional success screen shown after creating a new item.

- **`title`** (string) - Success screen title
- **`message`** (string) - Success message
- **`fields`** (array) - Read-only fields to display (e.g., generated keys)

### Example

```php
[
    'id' => 'api_keys',
    'name' => 'API Keys',
    'icon' => 'fa-solid fa-key',
    'type' => 'list_table',

    'table_config' => [
        'singular' => 'API Key',
        'plural' => 'API Keys',
        'ajax_action_get' => 'get_api_keys',
        'ajax_action_bulk' => 'bulk_api_key_action',

        'columns' => [
            'description' => ['label' => 'Description'],
            'key' => ['label' => 'Key'],
            'permissions' => ['label' => 'Permissions'],
            'last_access' => ['label' => 'Last Access']
        ],

        'statuses' => [
            'status_key' => 'permissions',
            'labels' => [
                'read' => 'Read Only',
                'write' => 'Write Only',
                'read_write' => 'Read/Write'
            ],
            'default_status' => 'all'
        ],

        'filters' => [
            [
                'id' => 'permissions',
                'placeholder' => 'All Permissions',
                'options' => [
                    'read' => 'Read',
                    'write' => 'Write',
                    'read_write' => 'Read/Write'
                ]
            ]
        ],

        'bulk_actions' => [
            'delete' => 'Delete'
        ]
    ],

    'modal_config' => [
        'title_add' => 'Add New API Key',
        'title_edit' => 'Edit API Key',
        'ajax_action_create' => 'create_api_key',
        'ajax_action_update' => 'update_api_key',
        'ajax_action_delete' => 'delete_api_key',

        'fields' => [
            [
                'id' => 'description',
                'type' => 'text',
                'label' => 'Description',
                'extra_attributes' => ['required' => true]
            ],
            [
                'id' => 'permissions',
                'type' => 'select',
                'label' => 'Permissions',
                'options' => [
                    'read' => 'Read',
                    'write' => 'Write',
                    'read_write' => 'Read/Write'
                ],
                'default' => 'read_write'
            ]
        ]
    ],

    'post_create_view' => [
        'title' => 'API Key Generated',
        'message' => 'Please copy your key. You will not see it again.',
        'fields' => [
            [
                'id' => 'consumer_key',
                'type' => 'text',
                'label' => 'Consumer Key',
                'extra_attributes' => [
                    'readonly' => true,
                    'onclick' => 'this.select();'
                ]
            ]
        ]
    ]
]
```

---

## form_builder

Drag-and-drop form builder interface with nestable fields.

### Parameters
- All common parameters
- **`type`** => `'form_builder'` (required)
- **`unique_key_property`** (string) - Property name for unique key (e.g., 'key', 'slug')
- **`nestable`** (bool) - Allow nested/parent-child field relationships
- **`default_top`** (bool) - Show default fields at top of list
- **`templates`** (array, required) - Available field templates

### templates Structure

Array of template groups, each containing:
- **`group_title`** (string) - Group heading in sidebar
- **`options`** (array) - Array of field templates

Each template option can be:

1. **Base Template** (full field definition):
   - `id` (string, required) - Template ID
   - `title` (string) - Display title
   - `icon` (string) - FontAwesome icon
   - `limit` (int) - Max instances allowed
   - `fields` (array, required) - Schema defining the template's fields

2. **Skeleton Template** (extends base template):
   - `id` (string, required) - Skeleton ID
   - `title` (string) - Display title
   - `icon` (string) - FontAwesome icon
   - `base_id` (string, required) - ID of base template to extend
   - `defaults` (array) - Default values to apply
   - `nestable` (bool) - Can this field contain children?
   - `allowed_children` (array) - Template IDs that can be nested (use `['*']` for all)

### Example

```php
[
    'id' => 'form_builder',
    'name' => 'Form Builder',
    'icon' => 'fa-solid fa-edit',
    'type' => 'form_builder',
    'unique_key_property' => 'key',
    'nestable' => true,
    'default_top' => true,

    'templates' => [
        [
            'group_title' => 'Standard Fields',
            'options' => [
                // Base template
                [
                    'id' => 'core_text',
                    'title' => 'Text Field',
                    'icon' => 'fa-solid fa-font',
                    'limit' => 10,
                    'fields' => [
                        ['id' => 'label', 'type' => 'text', 'label' => 'Label'],
                        ['id' => 'key', 'type' => 'slug', 'label' => 'Field Key'],
                        ['id' => 'is_required', 'type' => 'toggle', 'label' => 'Required']
                    ]
                ],
                [
                    'id' => 'core_select',
                    'title' => 'Select',
                    'icon' => 'fa-solid fa-list',
                    'fields' => [
                        ['id' => 'label', 'type' => 'text', 'label' => 'Label'],
                        ['id' => 'key', 'type' => 'slug', 'label' => 'Field Key'],
                        ['id' => 'options', 'type' => 'textarea', 'label' => 'Options']
                    ]
                ]
            ]
        ],
        [
            'group_title' => 'Predefined Fields',
            'options' => [
                // Skeleton template
                [
                    'id' => 'title_field',
                    'title' => 'Title',
                    'icon' => 'fa-solid fa-heading',
                    'base_id' => 'core_text',
                    'limit' => 1,
                    'defaults' => [
                        'label' => 'Title',
                        'key' => 'title',
                        'is_required' => true
                    ]
                ],
                // Container skeleton
                [
                    'id' => 'fieldset',
                    'title' => 'Fieldset',
                    'icon' => 'fa-solid fa-folder',
                    'base_id' => 'core_text',
                    'nestable' => true,
                    'allowed_children' => ['*'], // Can contain any field
                    'defaults' => [
                        'label' => 'Fieldset',
                        'type' => 'group'
                    ]
                ]
            ]
        ]
    ]
]
```

---

## action_page

Full page that executes a single action (hides standard save bar).

### Parameters
- All common parameters
- **`type`** => `'action_page'` (required)
- **`button_text`** (string, required) - Action button label
- **`button_class`** (string) - Bootstrap button class (default: 'btn-secondary')
- **`ajax_action`** (string, required) - AJAX action identifier
- **`fields`** (array) - Input fields for the action

### Example

```php
[
    'id' => 'importer_tool',
    'name' => 'Data Importer',
    'description' => 'Import data from external source.',
    'icon' => 'fa-solid fa-bolt',
    'type' => 'action_page',
    'button_text' => 'Run Import',
    'button_class' => 'btn-success',
    'ajax_action' => 'run_importer_action',

    'fields' => [
        [
            'id' => 'import_source_url',
            'type' => 'url',
            'label' => 'Source URL',
            'description' => 'URL of the data to import'
        ],
        [
            'id' => 'overwrite_existing',
            'type' => 'toggle',
            'label' => 'Overwrite Existing',
            'default' => false
        ]
    ]
]
```

---

## import_page

File upload and import processor with progress tracking.

### Parameters
- All common parameters
- **`type`** => `'import_page'` (required)
- **`button_text`** (string, required) - Import button label
- **`button_class`** (string) - Bootstrap button class
- **`ajax_action`** (string, required) - AJAX action for processing
- **`accept_file_type`** (string, optional) - File type restriction ('csv', 'json')
- **`fields`** (array) - Additional fields (typically includes a hidden field for filename)

### Example

```php
[
    'id' => 'csv_importer',
    'name' => 'CSV Importer',
    'icon' => 'fa-solid fa-upload',
    'type' => 'import_page',
    'description' => 'Upload and process CSV files.',
    'button_text' => 'Import CSV',
    'button_class' => 'btn-primary',
    'ajax_action' => 'process_csv_import',
    'accept_file_type' => 'csv',

    'fields' => [
        [
            'id' => 'imported_file_name',
            'type' => 'hidden'
        ],
        [
            'id' => 'delete_existing',
            'type' => 'toggle',
            'label' => 'Delete Existing Records',
            'description' => 'Remove all existing records before import',
            'default' => false
        ]
    ]
]
```

---

## custom_page

Display custom HTML content (read-only page).

### Parameters
- All common parameters
- **`type`** => `'custom_page'` (required)
- **`html_content`** (string, required) - HTML to display
- **`ajax_content`** (string, optional) - AJAX action to load content dynamically

### Static HTML Example

```php
[
    'id' => 'system_status',
    'name' => 'System Status',
    'icon' => 'fa-solid fa-server',
    'type' => 'custom_page',
    'html_content' => '<div class="card">
        <div class="card-body">
            <h3>System Status</h3>
            <p>All systems operational.</p>
        </div>
    </div>'
]
```

### Dynamic (AJAX) Content Example

```php
[
    'id' => 'system_info',
    'name' => 'System Info',
    'icon' => 'fa-solid fa-info-circle',
    'type' => 'custom_page',
    'ajax_content' => 'load_system_info'
]
```

Then handle the AJAX action:
```php
add_action('asf_render_content_pane_your-page-slug', function($content_action) {
    if ($content_action === 'load_system_info') {
        $html = '<div>Dynamic content here...</div>';
        wp_send_json_success(['html' => $html]);
    }
}, 10, 1);
```

---

## tool_page

Similar to `action_page` but designed for utility/maintenance tools.

**Note:** `tool_page` behaves identically to `action_page`. Use whichever name makes more semantic sense for your use case.

### Example

```php
[
    'id' => 'cache_manager',
    'name' => 'Cache Manager',
    'icon' => 'fa-solid fa-broom',
    'type' => 'tool_page',
    'description' => 'Clear various caches.',
    'button_text' => 'Clear All Caches',
    'button_class' => 'btn-danger',
    'ajax_action' => 'clear_all_caches',
    'fields' => []
]
```

---

## extension_list_page

Display a grid of available extensions/add-ons for your plugin.

### Parameters
- All common parameters
- **`type`** => `'extension_list_page'` (required)
- **`extensions`** (array, required) - Array of extension definitions

Each extension object:
- **`name`** (string) - Extension name
- **`description`** (string) - Description text
- **`image`** (string) - Image URL
- **`url`** (string) - Link to extension page
- **`status`** (string) - 'installed', 'available', or 'coming_soon'
- **`version`** (string) - Version number

### Example

```php
[
    'id' => 'extensions',
    'name' => 'Extensions',
    'icon' => 'fa-solid fa-puzzle-piece',
    'type' => 'extension_list_page',
    'extensions' => [
        [
            'name' => 'Premium Extension',
            'description' => 'Unlock premium features.',
            'image' => 'https://example.com/extension.png',
            'url' => 'https://example.com/buy',
            'status' => 'available',
            'version' => '1.0.0'
        ],
        [
            'name' => 'Pro Tools',
            'description' => 'Advanced tools for professionals.',
            'image' => 'https://example.com/pro.png',
            'url' => 'https://example.com/pro',
            'status' => 'installed',
            'version' => '2.1.0'
        ]
    ]
]
```

---

## Quick Reference Table

| Type | Purpose | Key Parameters |
|------|---------|----------------|
| (default) | Standard settings fields | `fields`, `subsections` |
| `list_table` | CRUD data table | `table_config`, `modal_config` |
| `form_builder` | Drag-drop form builder | `templates`, `nestable` |
| `action_page` | Single action page | `ajax_action`, `button_text` |
| `import_page` | File import processor | `ajax_action`, `accept_file_type` |
| `custom_page` | Custom HTML display | `html_content` or `ajax_content` |
| `tool_page` | Utility/maintenance tool | Same as `action_page` |
| `extension_list_page` | Extension showcase | `extensions` |

---

## AJAX Action Handlers

All AJAX actions must be handled in your settings class. Hook into:

```php
add_action('asf_execute_tool_' . $this->page_slug, [$this, 'handle_tool_action'], 10, 2);
```

Then switch on the action:

```php
public function handle_tool_action($tool_action, $post_data) {
    $data = json_decode(stripslashes($post_data['data']), true);

    switch ($tool_action) {
        case 'create_api_key':
            // Handle creation
            wp_send_json_success($result);
            break;

        case 'get_api_keys':
            // Return items
            wp_send_json_success(['items' => $items]);
            break;
    }
}
```

For progress-based actions, return `next_step` and `progress`:

```php
wp_send_json_success([
    'message' => 'Processing...',
    'progress' => 45,
    'next_step' => 1 // Continue to next step
]);
```

When complete, don't return `next_step`:

```php
wp_send_json_success([
    'message' => 'Complete!',
    'progress' => 100
]);
```
