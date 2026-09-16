# Section Types Reference

> This reference has been split into one document per section type under [`sections/`](sections/). Start at the **[sections index](sections/README.md)**.

Sections are the top-level containers in the WP AyeCode Settings Framework. Each section becomes an item in the left-hand navigation and defines an entire page (or tab) in your admin interface. Every section declares a `type` (except standard settings pages, where `type` is omitted) which decides how it renders.

## Section Type Index

| Type | Purpose | Doc |
|------|---------|-----|
| *(none)* | Standard settings fields | [sections/standard.md](sections/standard.md) |
| `list_table` | CRUD data table with modal editor | [sections/list-table.md](sections/list-table.md) |
| `form_builder` | Drag-and-drop form builder | [sections/form-builder.md](sections/form-builder.md) |
| `action_page` | Single server-side action | [sections/action-page.md](sections/action-page.md) |
| `tool_page` | Alias of `action_page` (utility tools) | [sections/tool-page.md](sections/tool-page.md) |
| `import_page` | File upload + import processor | [sections/import-page.md](sections/import-page.md) |
| `custom_page` | Arbitrary HTML (static or AJAX) | [sections/custom-page.md](sections/custom-page.md) |
| `dashboard` | Widget-based dashboard | [sections/dashboard.md](sections/dashboard.md) |
| `extension_list_page` | Install/manage add-ons | [sections/extension-list-page.md](sections/extension-list-page.md) |

## Common material

- [Common section parameters](sections/README.md#common-section-parameters) — `id`, `name`, `page_title`, `icon`, `description`, `searchable`, `type`.
- [AJAX action handlers](sections/README.md#ajax-action-handlers) — the `asf_execute_tool_{page_slug}` router, `section_id`, progress steps, and content panes.

See also [field-types.md](field-types.md) for the field configuration used by field-driven sections.
