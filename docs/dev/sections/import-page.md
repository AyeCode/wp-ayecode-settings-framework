# `import_page`

A file upload and import processor with drag-and-drop, a temporary upload step, progress tracking, and a structured import summary. Ideal for CSV/JSON importers.

[← Back to index](README.md)

## Parameters

- All [common parameters](README.md#common-section-parameters)
- **`type`** => `'import_page'` (required)
- **`button_text`** (string, required) — Import button label. Defaults to "Run Action".
- **`button_class`** (string, optional) — Bootstrap button class. Defaults to `'btn-primary'`.
- **`ajax_action`** (string, required) — Tool action that processes the uploaded file.
- **`accept_file_type`** (string, optional) — Restricts the file picker and dropzone label. `'csv'` or `'json'`; omit for any file type.
- **`fields`** (array, optional) — Additional inputs. **Include one `hidden` field** — its `id` receives the uploaded temp filename so your processor can locate the file. Other fields (toggles, selects) act as import options.

## How the upload flow works

The page moves through distinct states, each with its own UI:

1. **idle** — Drag & drop or click to browse. The file is uploaded immediately to a temp location.
2. **uploading** — Progress spinner while the file transfers.
3. **selected** — File is staged; the hidden field now holds the temp filename. The Import button becomes enabled.
4. **processing** — The Import button fires `ajax_action`; progress bar advances.
5. **complete** — Shows a success/failure card and an import summary (created/updated/skipped/invalid + errors).

Temp files are stored under `{uploads}/ayecode-sf-import-temp/{page_slug}/` and cleaned up daily via WP-Cron. The framework handles the upload/delete endpoints (`asf_temp_file_upload_{page_slug}` / `asf_temp_file_delete_{page_slug}`) for you.

## Example

```php
array(
    'id'               => 'csv_importer',
    'name'             => 'CSV Importer',
    'icon'             => 'fa-solid fa-upload',
    'type'             => 'import_page',
    'description'      => 'Upload and process CSV files.',
    'button_text'      => 'Import CSV',
    'button_class'     => 'btn-primary',
    'ajax_action'      => 'process_csv_import',
    'accept_file_type' => 'csv',

    'fields' => array(
        array(
            'id'   => 'imported_file_name', // hidden field receives the temp filename
            'type' => 'hidden',
        ),
        array(
            'id'          => 'delete_existing',
            'type'        => 'toggle',
            'label'       => 'Delete Existing Records',
            'description' => 'Remove all existing records before import',
            'default'     => false,
        ),
    ),
)
```

## Handler

Locate the temp file via the hidden field, process it, and return a summary. Use `progress` / `next_step` for batched imports (same as [action_page](action-page.md#progress-multi-step-actions)).

```php
public function handle_tool_action( $tool_action, $post_data ) {
    if ( 'process_csv_import' !== $tool_action ) {
        return;
    }

    $data     = json_decode( wp_unslash( $post_data['data'] ?? '{}' ), true );
    $filename = sanitize_file_name( $data['imported_file_name'] ?? '' );
    $path     = wp_upload_dir()['basedir'] . '/ayecode-sf-import-temp/' . $this->page_slug . '/' . $filename;

    // ... parse $path and import rows ...

    wp_send_json_success( array(
        'message' => 'Import finished.',
        'summary' => array(
            'created' => 12,
            'updated' => 3,
            'skipped' => 1,
            'invalid' => 0,
            'errors'  => array(), // array of human-readable error strings
        ),
    ) );
}
```

The `summary` keys map directly to the completion card: **Records Created**, **Records Updated**, **Records Skipped**, **Invalid Records** (only shown when `> 0`), and an **Errors** list.
