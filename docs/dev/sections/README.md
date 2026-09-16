# Section Types Reference

Sections are the top-level containers in the WP AyeCode Settings Framework. Each section becomes an item in the left-hand navigation and defines an entire page (or tab) in your admin interface.

Every section declares a `type` (except standard settings pages, where `type` is omitted). The `type` decides which view template renders the section's content.

## Section Type Index

| Type | Purpose | Doc |
|------|---------|-----|
| *(none)* | Standard settings fields | [standard.md](standard.md) |
| `list_table` | CRUD data table with modal editor | [list-table.md](list-table.md) |
| `form_builder` | Drag-and-drop form builder | [form-builder.md](form-builder.md) |
| `action_page` | Single server-side action | [action-page.md](action-page.md) |
| `tool_page` | Alias of `action_page` (utility tools) | [tool-page.md](tool-page.md) |
| `import_page` | File upload + import processor | [import-page.md](import-page.md) |
| `custom_page` | Arbitrary HTML (static or AJAX) | [custom-page.md](custom-page.md) |
| `dashboard` | Widget-based dashboard | [dashboard.md](dashboard.md) |
| `extension_list_page` | Install/manage add-ons | [extension-list-page.md](extension-list-page.md) |

## Common Section Parameters

These parameters are available for **all section types**:

- **`id`** (string, required) — Unique identifier for the section. Used as the navigation anchor and, for AJAX-driven types, sent to the server as `section_id`.
- **`name`** (string, required) — Display name shown in the navigation sidebar.
- **`page_title`** (string, optional) — Heading shown at the top of the content area. Falls back to `name` when omitted.
- **`icon`** (string, optional) — Font Awesome icon class shown next to the nav item.
  - Example: `'icon' => 'fa-solid fa-gear'`
  - This is admin output, so raw Font Awesome classes are correct here (do **not** use `ayecode_get_icon()` in admin pages).
- **`description`** (string, optional) — Description text rendered under the heading. Rendered with `x-html`, so inline HTML is allowed.
- **`searchable`** (array, optional) — Extra search terms that make the section discoverable in the settings search modal.
  - Example: `'searchable' => ['settings', 'configuration', 'options']`
- **`type`** (string, optional) — One of the types in the index above. Omit for a standard settings page.

## Where sections live

Sections are returned from your settings class's `get_config()` method under the `sections` key. A minimal config looks like:

```php
protected function get_config() {
    return array(
        'page_config' => array(
            // Global page config (used by extension_list_page, etc.)
        ),
        'sections' => array(
            array(
                'id'     => 'general',
                'name'   => 'General',
                'icon'   => 'fa-solid fa-gear',
                'fields' => array( /* ... */ ),
            ),
            array(
                'id'   => 'api_keys',
                'name' => 'API Keys',
                'type' => 'list_table',
                // ...
            ),
        ),
    );
}
```

You can also inject or modify sections for a specific page via the filter:

```php
add_filter( 'ayecode_settings_framework_sections_' . $page_slug, function ( $sections, $option_name, $page_slug ) {
    // Add, remove, or reorder $sections here.
    return $sections;
}, 10, 3 );
```

## Field-driven vs. non-field sections

- **Field-driven** sections (standard, `action_page`, `tool_page`, `import_page`, and the modal in `list_table`) reuse the framework's field renderer. See [../field-types.md](../field-types.md) for the full list of field types and parameters.
- **Non-field** sections (`custom_page`, `dashboard`, `extension_list_page`, `form_builder`) render their own layouts and pull data over AJAX.

Non-settings section types (`form_builder`, `custom_page`, `action_page`, `tool_page`, `import_page`, `extension_list_page`) are **excluded from the normal settings save**. Their data is either persisted by their own AJAX handlers or, for `form_builder`, saved under the section `id` key.

## AJAX action handlers

Interactive section types (`list_table`, `action_page`, `tool_page`, `import_page`, `dashboard`, `custom_page` with `ajax_content`, `extension_list_page`) call back to the server through the framework's tool AJAX endpoint. All of these are routed to a single hook in your settings class:

```php
add_action( 'asf_execute_tool_' . $this->page_slug, array( $this, 'handle_tool_action' ), 10, 2 );
```

Then switch on the action name:

```php
public function handle_tool_action( $tool_action, $post_data ) {
    // Most list_table / action payloads arrive JSON-encoded under 'data'.
    $data       = json_decode( wp_unslash( $post_data['data'] ?? '{}' ), true );
    $section_id = isset( $post_data['section_id'] ) ? sanitize_text_field( wp_unslash( $post_data['section_id'] ) ) : '';

    // Use $section_id to distinguish between multiple sections of the same type.
    switch ( $tool_action ) {
        case 'get_api_keys':
            wp_send_json_success( array( 'items' => $items ) );
            break;

        case 'create_api_key':
            // ...create...
            wp_send_json_success( $result );
            break;
    }
}
```

**`section_id`** is included on every `list_table` request, so a single handler can serve multiple tables on the same page by branching on it.

For progress-based (multi-step) actions, return `progress` and `next_step` until finished:

```php
// Continue:
wp_send_json_success( array( 'message' => 'Processing...', 'progress' => 45, 'next_step' => 1 ) );

// Final step (omit next_step):
wp_send_json_success( array( 'message' => 'Complete!', 'progress' => 100 ) );
```

### Content panes (`custom_page` with `ajax_content`)

Dynamic `custom_page` content is served through a separate hook:

```php
add_action( 'asf_render_content_pane_' . $this->page_slug, array( $this, 'render_content_pane' ), 10, 1 );
```

See [custom-page.md](custom-page.md) for details.

## Related docs

- [../field-types.md](../field-types.md) — every field type and its parameters
- [../default-settings.md](../default-settings.md) — how defaults are installed and normalized
- [../wizard-docs.md](../wizard-docs.md) — the `Setup_Wizard` subclass
