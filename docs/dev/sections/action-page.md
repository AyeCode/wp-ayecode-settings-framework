# `action_page`

A full page built around a single server-side action. It renders any input fields you define, then a primary button that fires one AJAX action. The standard settings save bar is hidden — the button *is* the action. Supports progress reporting and returning generated files for download.

[← Back to index](README.md)

## Parameters

- All [common parameters](README.md#common-section-parameters)
- **`type`** => `'action_page'` (required)
- **`button_text`** (string, required) — Action button label. Defaults to "Run Action".
- **`button_class`** (string, optional) — Bootstrap button class (e.g. `'btn-success'`, `'btn-danger'`). Defaults to `'btn-primary'`.
- **`ajax_action`** (string, required) — Tool action fired when the button is clicked.
- **`fields`** (array, optional) — Input fields for the action, same format as standard [field types](../field-types.md). Fields support `show_if`.

> `tool_page` is an alias of `action_page` with identical behaviour and parameters — see [tool-page.md](tool-page.md).

## Behaviour

- Clicking the button calls your `asf_execute_tool_{page_slug}` handler with the field values.
- While running, the button shows a spinner and "Processing…", and is disabled.
- A success/error message and an optional progress bar render next to the button.
- These sections are **excluded from the normal settings save** — persist anything you need from within the AJAX handler.

## Example

```php
array(
    'id'           => 'importer_tool',
    'name'         => 'Data Importer',
    'description'  => 'Import data from an external source.',
    'icon'         => 'fa-solid fa-bolt',
    'type'         => 'action_page',
    'button_text'  => 'Run Import',
    'button_class' => 'btn-success',
    'ajax_action'  => 'run_importer_action',

    'fields' => array(
        array(
            'id'          => 'import_source_url',
            'type'        => 'url',
            'label'       => 'Source URL',
            'description' => 'URL of the data to import',
        ),
        array(
            'id'      => 'overwrite_existing',
            'type'    => 'toggle',
            'label'   => 'Overwrite Existing',
            'default' => false,
        ),
    ),
)
```

## Handler

```php
public function handle_tool_action( $tool_action, $post_data ) {
    if ( 'run_importer_action' !== $tool_action ) {
        return;
    }

    $data = json_decode( wp_unslash( $post_data['data'] ?? '{}' ), true );
    $url  = esc_url_raw( $data['import_source_url'] ?? '' );

    // ... do the work ...

    wp_send_json_success( array( 'message' => 'Import complete.' ) );
}
```

## Progress (multi-step actions)

Return `progress` and `next_step` to keep the action running; the button stays in its processing state and the progress bar advances. Omit `next_step` on the final step to finish:

```php
// Intermediate step:
wp_send_json_success( array( 'message' => 'Processing batch 2…', 'progress' => 40, 'next_step' => 2 ) );

// Final step:
wp_send_json_success( array( 'message' => 'Done!', 'progress' => 100 ) );
```

## Returning generated files

If your action produces downloadable files (exports, reports), return them under `exported_files` and the page renders a "Generated Files" list with download links:

```php
wp_send_json_success( array(
    'message'        => 'Export complete.',
    'progress'       => 100,
    'exported_files' => array(
        array(
            'name' => 'export-2026-07-01.csv',
            'size' => '12 KB',
            'url'  => $download_url,
        ),
    ),
) );
```
