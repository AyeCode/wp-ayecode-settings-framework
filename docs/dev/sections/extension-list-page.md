# `extension_list_page`

A storefront-style grid of extensions/add-ons (plugins or themes) with search, price filtering, and per-item install/activate/deactivate toggles. Items can be a static list you define, or fetched from a remote AyeCode products API. Includes an optional "Connect your site" banner and a purchase modal for premium items.

[← Back to index](README.md)

## Parameters

- All [common parameters](README.md#common-section-parameters)
- **`type`** => `'extension_list_page'` (required)
- **`source`** (string) — `'static'` to use `static_items`, or omit/other to fetch from the API via `api_config`.
- **`static_items`** (array) — Items to display when `source => 'static'` (each must follow the [item shape](#item-shape)).
- **`api_config`** (array) — Sent to the `get_extension_data` handler when fetching remotely:
  - `category` (string) — Product category to fetch (required for API mode).
  - `item_type` (string) — `'plugin'` (default) or `'theme'`; applied to items missing a `type`.

Some behaviour is driven by the **global** `page_config` block (a top-level key of `get_config()`, not the section):

- **`api_url`** (string) — Base URL of the products API (required for API mode).
- **`membership_url`** (string) — Link used by the purchase modal's "View Membership Plans" button.
- **`connect_banner`** (array) — Controls the connect banner:
  - `is_connected` (bool) — Hide the banner when already connected.
  - `is_localhost` (bool) — Show the localhost-specific message (connect is unavailable locally).
  - `learn_more_url` (string) — "Learn more" link target.

## Item shape

Each item (static or returned by the API) is structured as:

```php
array(
    'info' => array(
        'slug'            => 'my-addon',
        'title'           => 'My Add-on',
        'excerpt'         => 'Short description.',
        'thumbnail'       => 'https://example.com/addon.png',
        'link'            => 'https://example.com/addon',
        'source'          => 'example.com', // 'wp.org' opens the wp.org info modal
        'price'           => 0,             // 0 or '0.00' renders as "Free"
        'is_new'          => 0,             // shows a NEW badge when truthy
        'is_subscription' => 0,             // appends "/ year" to the price
    ),
    'status' => 'not_installed', // not_installed | installed | active
    'type'   => 'plugin',        // plugin | theme
)
```

Status drives the toggle: `not_installed` → install & activate, `installed` → activate, `active` → (plugins) deactivate. Active themes cannot be toggled off — the user activates a different theme to switch.

## Static example

```php
'page_config' => array(
    'membership_url' => 'https://example.com/membership/',
    'connect_banner' => array( 'is_connected' => true ),
),
'sections' => array(
    array(
        'id'     => 'extensions',
        'name'   => 'Extensions',
        'icon'   => 'fa-solid fa-puzzle-piece',
        'type'   => 'extension_list_page',
        'source' => 'static',
        'static_items' => array(
            array(
                'info' => array(
                    'slug'      => 'pro-tools',
                    'title'     => 'Pro Tools',
                    'excerpt'   => 'Advanced tools for professionals.',
                    'thumbnail' => 'https://example.com/pro.png',
                    'link'      => 'https://example.com/pro',
                    'source'    => 'example.com',
                    'price'     => 49,
                ),
                'status' => 'not_installed',
                'type'   => 'plugin',
            ),
        ),
    ),
),
```

## API-driven example

```php
'page_config' => array(
    'api_url'        => 'https://example.com/edd-api/products/',
    'membership_url' => 'https://example.com/membership/',
    'connect_banner' => array(
        'is_connected'   => false,
        'is_localhost'   => false,
        'learn_more_url' => 'https://example.com/connect/',
    ),
),
'sections' => array(
    array(
        'id'         => 'extensions',
        'name'       => 'Extensions',
        'icon'       => 'fa-solid fa-puzzle-piece',
        'type'       => 'extension_list_page',
        'api_config' => array(
            'category'  => 'addons',
            'item_type' => 'plugin',
        ),
    ),
),
```

In API mode the framework's built-in `get_extension_data` handler fetches and curates the products for the given `category` (using `page_config.api_url`), attaching `status` and `type` to each item.

## Install / activate actions

The install, activate, deactivate, and connect actions are handled by the framework's `Extensions_Manager` — you do **not** implement these yourself. The following tool actions are routed to it automatically:

- `install_and_activate_item`
- `install_wp_org_item`
- `activate_item`
- `deactivate_item`
- `connect_site`
- `get_connect_url`

When an install requires a membership the user doesn't have, the server returns `guidance_needed`, and the page opens the purchase modal (using `page_config.membership_url`).
