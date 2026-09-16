# `list_table`

A full CRUD interface: a searchable, sortable data table with an optional modal editor, status tabs, filter dropdowns, bulk actions, and per-row actions. All data flows over AJAX — the framework renders the shell and calls back to your handler for items and mutations.

[← Back to index](README.md)

## Contents

- [Parameters](#parameters)
  - [`table_config`](#table_config)
  - [`modal_config`](#modal_config)
  - [`post_create_view`](#post_create_view)
- [The item shape (what your `get` handler returns)](#the-item-shape)
- [Server handler contract](#server-handler-contract)
- [Full example](#full-example)
- [Removing the "Add New" button but keeping edit](#removing-the-add-new-button-but-keeping-edit)
- [Telling add and edit apart (`show_if`)](#telling-add-and-edit-apart-show_if)
- [Row actions in depth](#row-actions-in-depth)
- [Multiple tables on one page](#multiple-tables-on-one-page)

## Parameters

- All [common parameters](README.md#common-section-parameters)
- **`type`** => `'list_table'` (required)
- **`table_config`** (array, required) — The table itself (columns, data source, filters, actions).
- **`modal_config`** (array, optional) — The add/edit modal form. **Omit it entirely for a read-only table** (no Add button, no Edit modal, no per-row edit).
- **`post_create_view`** (array, optional) — A success screen shown after a *new* item is created.

### `table_config`

- **`singular`** (string) — Singular item name, e.g. `'API Key'`. Used in the Add button and empty state.
- **`plural`** (string) — Plural item name, e.g. `'API Keys'`. Used in the "No … found" empty state.
- **`ajax_action_get`** (string, required) — Tool action your handler answers to return the list of items.
- **`ajax_action_bulk`** (string, required if `bulk_actions` is set) — Tool action for bulk operations.
- **`can_create`** (bool, optional, default `true`) — Set to `false` to hide the **Add New** button and the empty-state "Create your first…" button while keeping the edit modal fully functional. See [Removing the "Add New" button but keeping edit](#removing-the-add-new-button-but-keeping-edit).
- **`columns`** (array, required) — Column definitions, keyed by the item property to display:
  - Format: `'property_key' => array( 'label' => 'Column Label' )`
  - Cell values are rendered with `x-html`, so your handler may return HTML (badges, links, formatted dates).
  - Columns are sortable client-side by clicking the header.
- **`statuses`** (array, optional) — Status tabs above the table:
  - `status_key` (string) — The item property that holds the status.
  - `labels` (array) — `status_value => 'Tab Label'` map.
  - `default_status` (string) — Which tab is selected on load (`'all'` for the All tab).
  - `counts` — **You** supply per-status counts in the `get` response (`array( 'all' => 12, 'active' => 8, ... )`); the framework displays them next to each tab.
- **`filters`** (array, optional) — Extra filter dropdowns, each:
  - `id` (string) — Filter key (sent to the server under `filters`).
  - `placeholder` (string) — The "all/none" option label.
  - `options` (array) — `value => label` map.
- **`bulk_actions`** (array, optional) — `action_key => 'Action Label'`. Shows the bulk selector + checkboxes.
- **`row_actions`** (array, optional) — Custom per-row action buttons. If omitted, each row shows the built-in **Edit** (opens the modal) and **Delete** buttons. See [Row actions in depth](#row-actions-in-depth).

> The current status and all active filter values are sent with **every** `table_config` and `modal_config` AJAX request (`status` and `filters` keys), including the `get`, create, update, and delete calls — so your handler can scope results and mutations accordingly.

### `modal_config`

Present this to enable the add/edit modal. Omit it for a read-only table.

- **`title_add`** (string) — Modal title when adding.
- **`title_edit`** (string) — Modal title when editing.
- **`ajax_action_create`** (string, required) — Tool action to create a new item.
- **`ajax_action_update`** (string, required) — Tool action to update an existing item.
- **`ajax_action_delete`** (string, required) — Tool action to delete an item (used by the built-in Delete button and `delete` row action).
- **`fields`** (array, required) — Form fields, same format as standard [field types](../field-types.md). Fields support `show_if`, `required` (via `extra_attributes`), `file`/`image` uploads, and per-field default values.

Behaviour notes:

- **Required validation** runs client-side before save: a field marked `'extra_attributes' => array( 'required' => true )` blocks the save if empty — *unless* it's hidden by `show_if`, in which case it is skipped.
- **Defaults on add**: when opening the modal to add, each field's `default` is pre-filled. A `select` with no `default` auto-selects its first option.
- **File/image fields**: if any modal field is `type => 'file'` or `type => 'image'`, the save is sent as `multipart/form-data` and files arrive in `$_FILES` keyed by the field `id`. Otherwise the payload is JSON under `data`.

### `post_create_view`

An optional success screen shown **only after creating a new item** (never after an edit). Handy for one-time reveals like a generated API secret.

- **`title`** (string) — Success screen heading.
- **`message`** (string) — Success message (rendered as an alert).
- **`fields`** (array) — Read-only fields to display. Values come from the `wp_send_json_success( $data )` your **create** handler returned.

## The item shape

Your `ajax_action_get` handler returns an array of item objects. **Each item must include an `id`** — it is the row key, the value passed to update/delete, and the token the modal uses to detect edit mode.

Return either shape; the framework accepts both:

```php
wp_send_json_success( array(
    'items'  => $items,                 // array of item arrays, each with an 'id'
    'counts' => array( 'all' => 12, 'read' => 4, 'write' => 8 ), // optional, for status tabs
) );

// or simply:
wp_send_json_success( $items );
```

Any property named in `columns` is shown in that column (HTML allowed). Properties used by `statuses.status_key` or `filters[].id` are used for tab/filter matching.

## Server handler contract

All actions land in your `asf_execute_tool_{page_slug}` handler. The `data` payload is JSON-encoded; `section_id` identifies the table.

```php
public function handle_tool_action( $tool_action, $post_data ) {
    $data       = json_decode( wp_unslash( $post_data['data'] ?? '{}' ), true );
    $section_id = sanitize_text_field( wp_unslash( $post_data['section_id'] ?? '' ) );
    $status     = sanitize_key( wp_unslash( $post_data['status'] ?? 'all' ) );
    $filters    = json_decode( wp_unslash( $post_data['filters'] ?? '{}' ), true );

    switch ( $tool_action ) {
        case 'get_api_keys':
            // Use $status / $filters to scope the query.
            wp_send_json_success( array( 'items' => $this->query_keys( $status, $filters ), 'counts' => $this->key_counts() ) );

        case 'create_api_key':
            $new = $this->create_key( $data );           // $data has NO 'id'
            wp_send_json_success( $new );                 // returned data feeds post_create_view

        case 'update_api_key':
            $this->update_key( (int) $data['id'], $data ); // $data HAS an 'id'
            wp_send_json_success( array( 'message' => 'Saved.' ) );

        case 'delete_api_key':
            $this->delete_key( (int) $data['id'] );        // delete payload is { id: ... }
            wp_send_json_success( array( 'message' => 'Deleted.' ) );

        case 'bulk_api_key_action':
            // Bulk payload: { action: 'delete', item_ids: [1,2,3] }
            $this->bulk( $data['action'], $data['item_ids'] );
            wp_send_json_success( array( 'message' => 'Applied.' ) );
    }
}
```

**Create vs. update — how the server tells them apart:** they are *different tool actions* (`ajax_action_create` vs `ajax_action_update`). The framework picks which to call based on whether the modal was opened for an existing item. On create, `data` has no `id`; on update, `data` includes the item's `id`.

## Full example

```php
array(
    'id'   => 'api_keys',
    'name' => 'API Keys',
    'icon' => 'fa-solid fa-key',
    'type' => 'list_table',

    'table_config' => array(
        'singular'         => 'API Key',
        'plural'           => 'API Keys',
        'ajax_action_get'  => 'get_api_keys',
        'ajax_action_bulk' => 'bulk_api_key_action',

        'columns' => array(
            'description' => array( 'label' => 'Description' ),
            'key'         => array( 'label' => 'Key' ),
            'permissions' => array( 'label' => 'Permissions' ),
            'last_access' => array( 'label' => 'Last Access' ),
        ),

        'statuses' => array(
            'status_key'     => 'permissions',
            'labels'         => array(
                'read'       => 'Read Only',
                'write'      => 'Write Only',
                'read_write' => 'Read/Write',
            ),
            'default_status' => 'all',
        ),

        'filters' => array(
            array(
                'id'          => 'permissions',
                'placeholder' => 'All Permissions',
                'options'     => array(
                    'read'       => 'Read',
                    'write'      => 'Write',
                    'read_write' => 'Read/Write',
                ),
            ),
        ),

        'bulk_actions' => array(
            'delete' => 'Delete',
        ),
    ),

    'modal_config' => array(
        'title_add'          => 'Add New API Key',
        'title_edit'         => 'Edit API Key',
        'ajax_action_create' => 'create_api_key',
        'ajax_action_update' => 'update_api_key',
        'ajax_action_delete' => 'delete_api_key',

        'fields' => array(
            array(
                'id'               => 'description',
                'type'             => 'text',
                'label'            => 'Description',
                'extra_attributes' => array( 'required' => true ),
            ),
            array(
                'id'      => 'permissions',
                'type'    => 'select',
                'label'   => 'Permissions',
                'options' => array(
                    'read'       => 'Read',
                    'write'      => 'Write',
                    'read_write' => 'Read/Write',
                ),
                'default' => 'read_write',
            ),
        ),
    ),

    'post_create_view' => array(
        'title'   => 'API Key Generated',
        'message' => 'Please copy your key now. You will not see it again.',
        'fields'  => array(
            array(
                'id'               => 'consumer_secret',
                'type'             => 'text',
                'label'            => 'Consumer Secret',
                'extra_attributes' => array( 'readonly' => true, 'onclick' => 'this.select();' ),
            ),
        ),
    ),
)
```

## Removing the "Add New" button but keeping edit

A common need is an **edit-only** table: users may edit (or act on) existing rows, but cannot create new ones — for example a list of orders, subscriptions, or synced records that are created elsewhere.

Set **`table_config.can_create => false`**. This hides both the top **Add {singular}** button and the empty-state **Create Your First {singular}** button, while the edit modal, the built-in **Edit** row button, `open_modal(item)`, and update/delete all keep working:

```php
'table_config' => array(
    'singular'        => 'Order',
    'plural'          => 'Orders',
    'ajax_action_get' => 'get_orders',
    'can_create'      => false, // hide "Add New"; editing still works
    'columns'         => array( /* ... */ ),
),

'modal_config' => array(
    'title_edit'         => 'Edit Order',
    'ajax_action_update' => 'update_order',
    'ajax_action_delete' => 'delete_order',
    // ajax_action_create can be omitted — creation is disabled anyway.
    'fields'             => array( /* ... */ ),
),
```

Why a dedicated flag: the Add button and the Edit modal are otherwise both gated on `modal_config` existing. Removing `modal_config` to hide Add would also remove the ability to edit. `can_create` separates the two.

Related options for trimming what users can do per row:

- **Edit-only, no delete:** define [`row_actions`](#row-actions-in-depth) with just an `edit` action (this replaces the default Edit+Delete pair).
- **Fully read-only table:** omit `modal_config` entirely (and `row_actions`) — no Add, no Edit, no Delete.

## Telling add and edit apart (`show_if`)

Inside the modal you often want a field to appear only when **editing** an existing item, or only when **adding** a new one. The modal's fields are bound to the `editingItem` object:

- **Adding** → `editingItem` starts empty (only field defaults), so it has **no `id`**.
- **Editing** → `editingItem` is a copy of the row, so it **has an `id`**.

Use `show_if` with the `[%id%]` placeholder to branch on that. Placeholders are replaced with the current value from `editingItem` (a missing property resolves to `null`):

```php
// Show ONLY in edit mode (item already has an id):
array(
    'id'      => 'created_at',
    'type'    => 'text',
    'label'   => 'Created',
    'extra_attributes' => array( 'readonly' => true ),
    'show_if' => "[%id%] != null && [%id%] != ''",
),

// Show ONLY in add mode (no id yet) — e.g. a "generate on create" toggle:
array(
    'id'      => 'auto_generate',
    'type'    => 'toggle',
    'label'   => 'Auto-generate value',
    'show_if' => "[%id%] == null || [%id%] == ''",
),
```

Notes:

- Hidden-by-`show_if` fields are **skipped by required validation**, so an edit-only required field won't block an add.
- The same `[%field_id%]` mechanism works for any field, not just `id` — e.g. `show_if => "[%permissions%] == 'read_write'"` reveals a field only for a given selection.
- Operators supported: `==`, `!=`, `>`, `<`, `>=`, `<=`, combined with `&&`, `||`, and parentheses.

## Row actions in depth

`table_config.row_actions` replaces the default Edit/Delete buttons with your own set. Each entry is keyed by an arbitrary action key:

```php
'row_actions' => array(
    'edit' => array(
        'label'  => 'Edit',
        'icon'   => 'fa-solid fa-pencil',
        'action' => 'edit',            // built-in: opens the modal
    ),
    'delete' => array(
        'label'   => 'Delete',
        'icon'    => 'fa-solid fa-trash-can',
        'action'  => 'delete',         // built-in: deletes with confirmation
        'show_if' => "item.status !== 'protected'",
    ),
    'activate' => array(
        'label'           => 'Activate',
        'icon'            => 'fa-solid fa-check',
        'ajax_action'     => 'activate_key',   // custom server action
        'show_if'         => "item.status === 'inactive'",
        'confirm'         => true,             // default true for ajax_action
        'confirm_message' => 'Activate this key?',
    ),
    'view_item' => array(
        'label'  => 'View on Site',
        'icon'   => 'fa-solid fa-eye',
        'link'   => 'https://example.com/item/{{slug}}', // {{prop}} → item value
        'target' => '_blank',
    ),
    'edit_external' => array(
        'label'           => 'Edit Externally',
        'icon'            => 'fa-solid fa-external-link',
        'link'            => 'admin.php?page=editor&id={{id}}',
        'confirm'         => true,             // default false for links
        'confirm_message' => 'Open the external editor?',
    ),
),
```

**Action types:**

| Type | Config | Behaviour |
|------|--------|-----------|
| Built-in edit | `'action' => 'edit'` | Opens the modal for the row (`open_modal(item)`). |
| Built-in delete | `'action' => 'delete'` | Confirms, then calls `modal_config.ajax_action_delete` with `{ id }`. |
| Custom AJAX | `'ajax_action' => '…'` | Calls your handler with `{ id, item }`. Confirmation **on by default** (`'confirm' => false` to skip). |
| Link | `'link' => '…'` | Navigates to a URL. `{{property}}` tokens are replaced with item values. `'target' => '_blank'` opens a new tab. Confirmation **off by default**. |

> **Note on the three "edit types":** `list_table` distinguishes three ways to edit a row — (1) the **built-in modal edit** (`action => 'edit'`), which uses `modal_config` + `ajax_action_update`; (2) a **custom AJAX action** (`ajax_action`), which posts `{ id, item }` to your handler without opening the modal — good for inline state changes like activate/deactivate; and (3) a **link edit** (`link`), which sends the user to an external/other editor screen. On the server, distinguish them by the tool action name (`ajax_action_update` vs your custom `ajax_action`); links never hit AJAX.

- **`show_if`** on a row action is a JavaScript expression evaluated with the row's `item` in scope (e.g. `"item.status === 'active'"`). Note this differs from the modal field `show_if`, which uses `[%id%]` placeholder syntax against `editingItem`.

## Multiple tables on one page

You can place several `list_table` sections on the same settings page. Every AJAX request carries the section's `id` as `section_id`, so a single `handle_tool_action` can branch on it (or you can simply use distinct `ajax_action_*` names per table). Table state (search, sort, filters, status) is reset automatically when the user switches between tables.
