# Standard Section (Settings Fields)

The default section type. Omit `type` entirely and the framework renders a normal settings page: a heading, an optional description, and a stack of form fields. Values are collected and persisted by the framework's save bar into the single option row (`get_option( $option_name )`).

[← Back to index](README.md)

## Parameters

- All [common parameters](README.md#common-section-parameters)
- **`fields`** (array, required unless using `subsections`) — Array of field configurations. See [../field-types.md](../field-types.md).
- **`subsections`** (array, optional) — Groups of fields, each with its own `id`, `name`, and `fields`. Useful for splitting a long page into labelled groups.

There is **no** `type` key on a standard section — that is what makes it standard.

## How values are saved

Standard sections participate in the normal save flow:

1. The user edits fields and clicks **Save** in the sticky save bar.
2. All field values are collected and sent to `save_{option_name}`.
3. `Field_Manager` sanitizes each value based on its field `type`, then stores the whole set under `$option_name`.

Normalization notes:

- `toggle` / `checkbox` fields are stored as `1` / `0`.
- `number` fields are stored as real PHP numbers, not strings.
- A field's `default` is used when no saved value exists.

## Basic example

```php
array(
    'id'         => 'general',
    'name'       => 'General Settings',
    'icon'       => 'fa-solid fa-gear',
    'searchable' => array( 'settings', 'configuration' ),
    'fields'     => array(
        array(
            'id'      => 'site_title',
            'type'    => 'text',
            'label'   => 'Site Title',
            'default' => 'My Site',
        ),
        array(
            'id'    => 'enable_feature',
            'type'  => 'toggle',
            'label' => 'Enable Feature',
        ),
    ),
)
```

## With subsections

Subsections render labelled groups within the same page:

```php
array(
    'id'          => 'advanced',
    'name'        => 'Advanced Settings',
    'icon'        => 'fa-solid fa-sliders',
    'subsections' => array(
        array(
            'id'     => 'performance',
            'name'   => 'Performance',
            'fields' => array(
                array( 'id' => 'cache_enabled', 'type' => 'toggle', 'label' => 'Enable Cache' ),
            ),
        ),
        array(
            'id'     => 'security',
            'name'   => 'Security',
            'fields' => array(
                array( 'id' => 'ssl_required', 'type' => 'toggle', 'label' => 'Require SSL' ),
            ),
        ),
    ),
)
```

## Conditional fields (`show_if`)

Any field can be shown or hidden reactively based on other field values using `show_if`. Placeholders in the form `[%field_id%]` are replaced with the current value of that field before the expression is evaluated:

```php
array(
    'id'    => 'cache_ttl',
    'type'  => 'number',
    'label' => 'Cache TTL (seconds)',
    // Only show this field when the cache toggle is on.
    'show_if' => "[%cache_enabled%] == true",
),
```

Supported operators: `==`, `!=`, `>`, `<`, `>=`, `<=`, combined with `&&`, `||`, and parentheses. See [list-table.md](list-table.md#telling-add-and-edit-apart-show_if) for a detailed treatment of `show_if`, including how to detect add-vs-edit mode inside a modal.

## Reacting to saves

After a standard save completes, the framework fires:

```php
add_action( 'ayecode_settings_framework_saved', function ( $settings, $option_name ) {
    // Flush caches, sync external services, etc.
}, 10, 2 );
```

Related: `ayecode_settings_framework_reset` (after a reset) and `ayecode_settings_framework_defaults_installed` (after defaults are installed).
