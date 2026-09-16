# `dashboard`

A widget-based dashboard. Widgets are laid out in a responsive grid and can render static HTML, quick-link lists, or data fetched over AJAX (stats, system status, RSS feeds, or your own custom widgets).

[← Back to index](README.md)

## Parameters

- All [common parameters](README.md#common-section-parameters)
- **`type`** => `'dashboard'` (required)
- **`widgets`** (array, required) — Array of widget definitions.

## Widget parameters

Every widget has:

- **`id`** (string, required) — Unique widget id (used as the loading/data key).
- **`title`** (string) — Card header title.
- **`width`** (string) — Grid width: `'full'` (12 cols), `'half'` (6 cols on large), or `'third'` (4 cols on large).
- **`type`** (string, required) — One of the widget types below.

### Widget types

| `type` | Data source | Extra keys |
|--------|-------------|------------|
| `custom_html` | static | `content` (HTML string) |
| `quick_links` | static | `links` (array — see below) |
| `stats` | AJAX | `ajax_action`, `params` |
| `system_status` | AJAX | `ajax_action`, `params` |
| `rss_feed` | AJAX | `ajax_action`, `feed_url` |

AJAX widgets (`stats`, `system_status`, `rss_feed`, and any custom widget with an `ajax_action`) show a spinner, then call your tool endpoint with `tool_action = ajax_action` and the widget's `params` (JSON). If the handler returns `{ error: '…' }`, the widget shows a warning.

### `quick_links` link object

- **`label`** (string) — Link text.
- **`icon`** (string) — Font Awesome class.
- **`url`** (string) — Destination URL.
- **`section`** (string, optional) — A section `id`; clicking navigates to that settings section instead of following `url`.
- **`external`** (bool, optional) — Open `url` in a new tab and show an external-link icon.

## Built-in AJAX widget actions

The framework ships handlers for three widget actions — just set `ajax_action` to one of these (no custom PHP needed):

- **`get_dashboard_stats`** — returns `stats`. `params.show` is an array of any of `'users'`, `'posts'`, `'pages'` (default `['users','posts']`).
- **`get_system_status`** — returns WordPress/PHP/memory/debug `status` rows. `params.php_version` and `params.wp_version` set the minimums used to flag warnings.
- **`get_plugin_news`** — returns the latest 5 items from the widget's `feed_url` for an `rss_feed` widget.

## Example

```php
array(
    'id'   => 'overview',
    'name' => 'Dashboard',
    'icon' => 'fa-solid fa-gauge',
    'type' => 'dashboard',

    'widgets' => array(
        array(
            'id'      => 'welcome',
            'title'   => 'Welcome',
            'width'   => 'full',
            'type'    => 'custom_html',
            'content' => '<p>Welcome to your plugin dashboard.</p>',
        ),
        array(
            'id'    => 'site_stats',
            'title' => 'At a Glance',
            'width' => 'half',
            'type'  => 'stats',
            'ajax_action' => 'get_dashboard_stats',
            'params'      => array( 'show' => array( 'users', 'posts', 'pages' ) ),
        ),
        array(
            'id'    => 'status',
            'title' => 'System Status',
            'width' => 'half',
            'type'  => 'system_status',
            'ajax_action' => 'get_system_status',
            'params'      => array( 'php_version' => '7.4' ),
        ),
        array(
            'id'    => 'news',
            'title' => 'Latest News',
            'width' => 'third',
            'type'  => 'rss_feed',
            'ajax_action' => 'get_plugin_news',
            'feed_url'    => 'https://example.com/feed/',
        ),
        array(
            'id'    => 'links',
            'title' => 'Quick Links',
            'width' => 'third',
            'type'  => 'quick_links',
            'links' => array(
                array( 'label' => 'General Settings', 'icon' => 'fa-solid fa-gear', 'section' => 'general' ),
                array( 'label' => 'Documentation', 'icon' => 'fa-solid fa-book', 'url' => 'https://example.com/docs', 'external' => true ),
            ),
        ),
    ),
)
```

## Custom AJAX widget

Use any `ajax_action` not handled by the built-ins and answer it in your `asf_execute_tool_{page_slug}` handler. The shape of the returned data must match the widget `type` you chose:

- `stats` → `array( 'stats' => array( array( 'label' => …, 'value' => …, 'icon' => … ), … ) )`
- `system_status` → `array( 'status' => array( array( 'label' => …, 'value' => …, 'status' => 'good|warning|error' ), … ) )`
- `rss_feed` → `array( 'items' => array( array( 'title' => …, 'url' => …, 'date' => …, 'image' => … ), … ) )`

```php
public function handle_tool_action( $tool_action, $post_data ) {
    if ( 'my_custom_stats' === $tool_action ) {
        $params = json_decode( wp_unslash( $post_data['params'] ?? '{}' ), true );
        wp_send_json_success( array(
            'stats' => array(
                array( 'label' => 'Orders Today', 'value' => 42, 'icon' => 'fa-solid fa-cart-shopping' ),
            ),
        ) );
    }
}
```
