# `custom_page`

Renders arbitrary HTML in the content area. Use it for read-only information screens, embedded reports, or any bespoke markup. Content can be static (baked into the config) or loaded dynamically over AJAX.

[← Back to index](README.md)

## Parameters

- All [common parameters](README.md#common-section-parameters)
- **`type`** => `'custom_page'` (required)
- **`content_html`** (string, optional) — Static HTML to render. Output with `x-html`.
- **`ajax_content`** (string, optional) — A content-pane action name; the HTML is fetched on load. Use this **instead of** `content_html` for dynamic content.

Provide one of `content_html` or `ajax_content`.

> The config key for static HTML is **`content_html`** (matching the view). Older notes referring to `html_content` are out of date.

## Static HTML example

```php
array(
    'id'           => 'system_status',
    'name'         => 'System Status',
    'icon'         => 'fa-solid fa-server',
    'type'         => 'custom_page',
    'content_html' => '<div class="card"><div class="card-body">'
                    . '<h3>System Status</h3><p>All systems operational.</p>'
                    . '</div></div>',
)
```

Since this is admin output, raw Font Awesome `<i>` tags and Bootstrap 5 utility classes are fine here.

## Dynamic (AJAX) content example

```php
array(
    'id'           => 'system_info',
    'name'         => 'System Info',
    'icon'         => 'fa-solid fa-info-circle',
    'type'         => 'custom_page',
    'ajax_content' => 'load_system_info',
)
```

Dynamic content uses a **separate hook** from the tool actions — `asf_render_content_pane_{page_slug}`:

```php
add_action( 'asf_render_content_pane_' . $this->page_slug, function ( $content_action ) {
    if ( 'load_system_info' === $content_action ) {
        $html = '<div class="card"><div class="card-body">Dynamic content here…</div></div>';
        wp_send_json_success( array( 'html' => $html ) );
    }
}, 10, 1 );
```

While the request is in flight the pane shows a spinner; the returned `html` is then injected. Loaded content is cached per section for the page session.
