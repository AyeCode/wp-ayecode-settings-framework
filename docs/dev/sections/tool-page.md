# `tool_page`

`tool_page` is an **alias of [`action_page`](action-page.md)** — same view, same parameters, same behaviour. Use whichever name reads better for your use case; `tool_page` simply signals a utility/maintenance tool rather than a data action.

[← Back to index](README.md)

## Parameters

Identical to [`action_page`](action-page.md#parameters):

- All [common parameters](README.md#common-section-parameters)
- **`type`** => `'tool_page'` (required)
- **`button_text`** (string, required)
- **`button_class`** (string, optional) — default `'btn-primary'`
- **`ajax_action`** (string, required)
- **`fields`** (array, optional)

## Example

```php
array(
    'id'           => 'cache_manager',
    'name'         => 'Cache Manager',
    'icon'         => 'fa-solid fa-broom',
    'type'         => 'tool_page',
    'description'  => 'Clear various caches.',
    'button_text'  => 'Clear All Caches',
    'button_class' => 'btn-danger',
    'ajax_action'  => 'clear_all_caches',
    'fields'       => array(),
)
```

The AJAX handling, progress reporting, and generated-files support are all the same as `action_page` — see [action-page.md](action-page.md) for the full handler examples.
