# `form_builder`

A drag-and-drop form builder. The left column lists available field templates (grouped); the right column is the live form canvas where instances are added, reordered, nested, and configured. The built form is saved as an array under the section's `id`.

[← Back to index](README.md)

## Parameters

- All [common parameters](README.md#common-section-parameters)
- **`type`** => `'form_builder'` (required)
- **`unique_key_property`** (string) — The field property that must be unique across the form (e.g. `'key'` or `'slug'`). Duplicates are flagged in red.
- **`nestable`** (bool) — Allow parent/child nesting for all fields. (Individual templates can also opt in via `allowed_children`.)
- **`default_top`** (bool) — Mark the first field as the "default" option (shows a check icon).
- **`templates`** (array, required) — The palette of field templates, grouped.

## `templates` structure

An array of **groups**, each:

- **`group_title`** (string) — Heading shown above the group in the palette.
- **`options`** (array) — Field templates in that group.

Each option is either a **base template** or a **skeleton template**:

### Base template (full definition)

- **`id`** (string, required) — Template id.
- **`title`** (string) — Palette label.
- **`icon`** (string) — Font Awesome class.
- **`description`** (string, optional) — Tooltip help shown on the palette item.
- **`limit`** (int, optional) — Maximum instances allowed on the canvas (palette item dims when reached).
- **`hidden`** (bool, optional) — Hide the template from the palette.
- **`fields`** (array, required) — The schema of settings shown in the field's edit panel (uses standard [field types](../field-types.md)).

### Skeleton template (extends a base)

- **`id`** (string, required) — Skeleton id.
- **`title`** (string) — Palette label.
- **`icon`** (string) — Font Awesome class.
- **`base_id`** (string, required) — Id of the base template it extends (inherits its `fields` schema).
- **`limit`** (int, optional) — Max instances.
- **`defaults`** (array) — Default values applied to the new instance.
- **`nestable`** (bool, optional) — Whether this field can contain children.
- **`allowed_children`** (array, optional) — Template ids allowed as children; use `array( '*' )` for any.

## Runtime field properties

Instances on the canvas carry a few framework-managed properties you may see when saving/loading:

- **`_uid`** — Internal unique instance id (for sorting/editing).
- **`_is_default`** — A default field that cannot be deleted.
- **`is_active`** — When present and falsy, the field is flagged inactive (warning icon).
- **`conditions`** — When present and non-empty, an "has conditional logic" indicator is shown.

## Example

```php
array(
    'id'                  => 'form_builder',
    'name'                => 'Form Builder',
    'icon'                => 'fa-solid fa-edit',
    'type'                => 'form_builder',
    'unique_key_property' => 'key',
    'nestable'            => true,
    'default_top'         => true,

    'templates' => array(
        array(
            'group_title' => 'Standard Fields',
            'options'     => array(
                // Base template
                array(
                    'id'     => 'core_text',
                    'title'  => 'Text Field',
                    'icon'   => 'fa-solid fa-font',
                    'limit'  => 10,
                    'fields' => array(
                        array( 'id' => 'label', 'type' => 'text', 'label' => 'Label' ),
                        array( 'id' => 'key', 'type' => 'slug', 'label' => 'Field Key' ),
                        array( 'id' => 'is_required', 'type' => 'toggle', 'label' => 'Required' ),
                    ),
                ),
                array(
                    'id'     => 'core_select',
                    'title'  => 'Select',
                    'icon'   => 'fa-solid fa-list',
                    'fields' => array(
                        array( 'id' => 'label', 'type' => 'text', 'label' => 'Label' ),
                        array( 'id' => 'key', 'type' => 'slug', 'label' => 'Field Key' ),
                        array( 'id' => 'options', 'type' => 'textarea', 'label' => 'Options' ),
                    ),
                ),
            ),
        ),
        array(
            'group_title' => 'Predefined Fields',
            'options'     => array(
                // Skeleton extending core_text, limited to one instance
                array(
                    'id'       => 'title_field',
                    'title'    => 'Title',
                    'icon'     => 'fa-solid fa-heading',
                    'base_id'  => 'core_text',
                    'limit'    => 1,
                    'defaults' => array(
                        'label'       => 'Title',
                        'key'         => 'title',
                        'is_required' => true,
                    ),
                ),
                // Container skeleton that can hold any child
                array(
                    'id'               => 'fieldset',
                    'title'            => 'Fieldset',
                    'icon'             => 'fa-solid fa-folder',
                    'base_id'          => 'core_text',
                    'nestable'         => true,
                    'allowed_children' => array( '*' ),
                    'defaults'         => array(
                        'label' => 'Fieldset',
                        'type'  => 'group',
                    ),
                ),
            ),
        ),
    ),
)
```

## Saving

The form builder has its own save button ("Save Form") and tracks unsaved changes. The resulting array of field instances is stored under the section `id` key. Because `form_builder` is a non-settings type, it is not part of the standard settings save bar.
