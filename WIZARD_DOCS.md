# Setup Wizard Documentation

The AyeCode Settings Framework includes a powerful Setup Wizard system that extends the base Settings Framework to provide full-page, multi-step guided setup experiences.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Membership Status System](#membership-status-system)
- [Step Configuration](#step-configuration)
- [Conditional Visibility](#conditional-visibility)
- [Built-in Templates](#built-in-templates)
- [Field-Based Steps](#field-based-steps)
- [JavaScript API](#javascript-api)
- [Complete Examples](#complete-examples)

---

## Overview

The Setup Wizard provides:
- ✅ Full-page wizard UI optimized for onboarding
- ✅ Multi-step navigation with progress tracking
- ✅ Built-in membership/connection step
- ✅ Conditional step and field visibility
- ✅ Reuses all framework field types
- ✅ Bootstrap 5.3+ styling with dark mode
- ✅ Alpine.js reactive state management

---

## Getting Started

### 1. Create Your Wizard Class

Extend `Setup_Wizard` and define your configuration:

```php
<?php
class My_Product_Setup_Wizard extends \AyeCode\SettingsFramework\Setup_Wizard {

    protected $option_name   = 'my_product_wizard_settings';
    protected $page_slug     = 'my-product-setup';
    protected $plugin_name   = 'My Product';
    protected $page_title    = 'Setup Wizard';
    protected $menu_title    = 'Setup';
    protected $menu_icon     = 'dashicons-admin-generic';

    /**
     * Define wizard steps and configuration
     */
    protected function get_config() {
        return [
            'steps' => [
                // Your steps here
            ],
            'wizard_config' => [
                'product_name'   => 'My Product',
                'checkout_url'   => 'https://example.com/checkout/',
                'dashboard_url'  => admin_url(),
            ],
        ];
    }
}

// Initialize
new My_Product_Setup_Wizard();
```

### 2. Define Membership Domain (Optional)

If your product uses AyeCode Connect licensing:

```php
protected function get_membership_domain() {
    return 'example.com';
}
```

---

## Membership Status System

The wizard tracks **two distinct states**:

### Connection vs. Membership

| State | Description | Check Method |
|-------|-------------|--------------|
| **Connected** | Site registered with AyeCode Connect | `is_connected()` |
| **Member Active** | Has active paid license | `is_member_active()` |
| **Paid User** | Both connected AND active | `isPaidUser` (JS) |

### Status Checks in PHP

```php
// Check if site is connected
if ( $this->is_connected() ) {
    // Site has AyeCode Connect active and registered
}

// Check if user has active membership
if ( $this->is_member_active() ) {
    // User has active license for your product
}

// Check both (recommended for premium features)
if ( $this->is_connected() && $this->is_member_active() ) {
    // User is fully authenticated with active membership
}
```

### Membership Step Behavior

The built-in membership step automatically shows different UI based on status:

| Status | UI Shown |
|--------|----------|
| **Not connected** | "I have a membership, Log in" button |
| **Connected + Active** | Step is automatically skipped |
| **Connected + No active license** | "Refresh Status" button |
| **Localhost** | Manual license key input field |

---

## Step Configuration

### Step Types

There are three types of steps:

#### 1. Built-in Template Steps

Use pre-built templates for common scenarios:

```php
[
    'id'       => 'membership',
    'title'    => __('Get Pro Membership', 'textdomain'),
    'template' => 'membership', // Use built-in template
    'features' => [
        __('Feature 1', 'textdomain'),
        __('Feature 2', 'textdomain'),
    ],
    'pricing_options' => [
        [
            'value'       => '12month',
            'duration'    => __('12 months', 'textdomain'),
            'savings'     => __('Save 35%', 'textdomain'),
            'recommended' => true,
        ],
    ],
]
```

Available templates: `membership`, `complete`

#### 2. Field-Based Steps

Steps with form fields (uses all framework field types):

```php
[
    'id'          => 'configuration',
    'title'       => __('Configure Settings', 'textdomain'),
    'description' => __('Customize your setup', 'textdomain'),
    'icon'        => '⚙️',
    'fields'      => [
        [
            'id'      => 'site_name',
            'type'    => 'text',
            'label'   => __('Site Name', 'textdomain'),
            'default' => '',
        ],
        [
            'id'      => 'enable_feature',
            'type'    => 'toggle',
            'label'   => __('Enable Advanced Features', 'textdomain'),
            'default' => false,
        ],
    ],
]
```

#### 3. Custom HTML Steps

For completely custom content:

```php
[
    'id'           => 'custom',
    'content_html' => '<div class="custom-content">Your HTML here</div>',
]
```

---

## Conditional Visibility

### Step-Level Visibility

Control which steps appear based on membership status:

```php
// Show only to paid users (connected + active membership)
[
    'id'           => 'premium_features',
    'show_if_paid' => true,
    'fields'       => [/* ... */],
]

// Show only to free users
[
    'id'            => 'upgrade_reminder',
    'show_if_free'  => true,
    'fields'        => [/* ... */],
]
```

### Field-Level Visibility

Use `show_if` conditions for granular control:

#### Available Fields in wizardData

```javascript
{
    user_membership_status: 'paid' | 'free',  // paid = connected + active
    is_connected: true | false,                // Site registered
    is_member_active: true | false             // Has active license
}
```

#### Example: Show Only to Paid Users

```php
[
    'id'      => 'premium_feature',
    'type'    => 'toggle',
    'label'   => __('Premium Feature', 'textdomain'),
    'show_if' => [
        'field'      => 'user_membership_status',
        'value'      => 'paid',
        'comparison' => '===',
    ],
]
```

#### Example: Show Only When Active

```php
[
    'id'      => 'advanced_setting',
    'type'    => 'select',
    'show_if' => [
        'field'      => 'is_member_active',
        'value'      => true,
        'comparison' => '===',
    ],
]
```

#### Example: Show to Connected Users Without Active License

```php
[
    'id'      => 'renew_prompt',
    'type'    => 'info',
    'label'   => __('Renew Your Membership', 'textdomain'),
    'show_if' => [
        [
            'field'      => 'is_connected',
            'value'      => true,
            'comparison' => '===',
        ],
        [
            'field'      => 'is_member_active',
            'value'      => false,
            'comparison' => '===',
        ],
    ],
]
```

### Conditional Visibility Matrix

| Condition | `is_connected` | `is_member_active` | `user_membership_status` |
|-----------|----------------|-------------------|-------------------------|
| Not connected | `false` | `false` | `'free'` |
| Connected, no license | `true` | `false` | `'free'` |
| Connected + Active | `true` | `true` | `'paid'` |

---

## Built-in Templates

### Membership Template

Shows pricing options and connection UI:

```php
[
    'id'          => 'membership',
    'title'       => __('Get Pro Membership', 'textdomain'),
    'description' => __('Access premium features', 'textdomain'),
    'template'    => 'membership',
    'features'    => [
        __('Feature 1', 'textdomain'),
        __('Feature 2', 'textdomain'),
    ],
    'pricing_options' => [
        [
            'value'       => '6month',
            'duration'    => __('6 months', 'textdomain'),
            'savings'     => __('Save 20%', 'textdomain'),
        ],
        [
            'value'       => '12month',
            'duration'    => __('12 months', 'textdomain'),
            'savings'     => __('Save 35%', 'textdomain'),
            'recommended' => true,
        ],
    ],
]
```

### Complete Template

Shows success message and optional upsell:

```php
[
    'id'          => 'complete',
    'title'       => __('Setup Complete!', 'textdomain'),
    'description' => __('You\'re all set!', 'textdomain'),
    'template'    => 'complete',
    'summary_items' => [
        __('Feature configured', 'textdomain'),
        __('Settings saved', 'textdomain'),
    ],
    'upsell_features' => [
        __('Premium feature 1', 'textdomain'),
        __('Premium feature 2', 'textdomain'),
    ],
]
```

---

## Field-Based Steps

Field-based steps support **all framework field types**:

- `text`, `textarea`, `number`, `email`, `url`
- `select`, `multiselect`, `radio`, `checkbox`, `checkbox_group`
- `toggle`, `color`, `date`, `time`, `datetime`
- `file`, `image`, `gallery`
- `repeater`, `wysiwyg`, `code`
- And more...

### Example with Multiple Field Types

```php
[
    'id'     => 'settings',
    'title'  => __('Configure Your Site', 'textdomain'),
    'fields' => [
        [
            'id'      => 'site_mode',
            'type'    => 'radio',
            'label'   => __('Site Mode', 'textdomain'),
            'options' => [
                'production' => __('Production', 'textdomain'),
                'staging'    => __('Staging', 'textdomain'),
            ],
            'default' => 'production',
        ],
        [
            'id'          => 'features',
            'type'        => 'checkbox_group',
            'label'       => __('Enable Features', 'textdomain'),
            'options'     => [
                'analytics' => __('Analytics', 'textdomain'),
                'cache'     => __('Caching', 'textdomain'),
                'cdn'       => __('CDN', 'textdomain'),
            ],
        ],
        [
            'id'          => 'api_key',
            'type'        => 'text',
            'label'       => __('API Key', 'textdomain'),
            'description' => __('Enter your API key', 'textdomain'),
            'placeholder' => __('sk_live_...', 'textdomain'),
        ],
    ],
]
```

---

## JavaScript API

### Accessing Wizard State

```javascript
// In Alpine.js components
this.isConnected        // Boolean: Site is connected
this.isMemberActive     // Boolean: Has active membership
this.isPaidUser         // Boolean: Connected AND active
this.wizardData         // Object: All form data
this.currentStep        // Object: Current step config
this.currentStepIndex   // Number: Current step index
```

### Wizard Methods

```javascript
// Navigation
this.nextStep()         // Go to next step
this.prevStep()         // Go to previous step
this.goToStep(index)    // Jump to specific step

// Actions
this.connectSite()              // Connect via AyeCode Connect
this.refreshMembershipStatus()  // Refresh license status
this.completeWizard()          // Complete and save
this.continueFree()            // Skip to next step as free user

// Utilities
this.shouldShowField(field)    // Check if field should be visible
this.renderField(field)        // Render a field's HTML
this.showNotification(msg, type) // Show notification
```

### Custom JavaScript in Steps

Add custom behavior using Alpine.js:

```php
[
    'id'     => 'custom_step',
    'fields' => [
        [
            'id'   => 'custom_field',
            'type' => 'text',
        ],
    ],
    // Add custom Alpine directives
    'x-init' => 'console.log("Step loaded!")',
]
```

---

## Complete Examples

### Example 1: Simple 3-Step Wizard

```php
protected function get_config() {
    return [
        'steps' => [
            // Step 1: Welcome
            [
                'id'    => 'welcome',
                'title' => __('Welcome!', 'textdomain'),
                'fields' => [
                    [
                        'id'      => 'site_name',
                        'type'    => 'text',
                        'label'   => __('Site Name', 'textdomain'),
                        'default' => get_bloginfo('name'),
                    ],
                ],
            ],

            // Step 2: Settings
            [
                'id'     => 'settings',
                'title'  => __('Configure', 'textdomain'),
                'fields' => [
                    [
                        'id'      => 'enable_features',
                        'type'    => 'checkbox_group',
                        'label'   => __('Features', 'textdomain'),
                        'options' => [
                            'feature1' => __('Feature 1', 'textdomain'),
                            'feature2' => __('Feature 2', 'textdomain'),
                        ],
                    ],
                ],
            ],

            // Step 3: Complete
            [
                'id'       => 'done',
                'template' => 'complete',
            ],
        ],

        'wizard_config' => [
            'product_name'  => 'My Product',
            'dashboard_url' => admin_url(),
        ],
    ];
}
```

### Example 2: Wizard with Membership Step

```php
protected function get_config() {
    return [
        'steps' => [
            // Step 1: Membership
            [
                'id'       => 'membership',
                'template' => 'membership',
                'features' => [
                    __('Premium Feature 1', 'textdomain'),
                    __('Premium Feature 2', 'textdomain'),
                ],
                'pricing_options' => [
                    [
                        'value'       => '12month',
                        'duration'    => __('12 months', 'textdomain'),
                        'savings'     => __('Save 35%', 'textdomain'),
                        'recommended' => true,
                    ],
                ],
            ],

            // Step 2: Basic Setup (everyone)
            [
                'id'     => 'basic',
                'title'  => __('Basic Setup', 'textdomain'),
                'fields' => [
                    [
                        'id'    => 'site_type',
                        'type'  => 'select',
                        'label' => __('Site Type', 'textdomain'),
                        'options' => [
                            'blog'      => __('Blog', 'textdomain'),
                            'business'  => __('Business', 'textdomain'),
                            'ecommerce' => __('E-commerce', 'textdomain'),
                        ],
                    ],
                ],
            ],

            // Step 3: Premium Features (paid only)
            [
                'id'           => 'premium',
                'title'        => __('Premium Features', 'textdomain'),
                'show_if_paid' => true,
                'fields'       => [
                    [
                        'id'      => 'advanced_analytics',
                        'type'    => 'toggle',
                        'label'   => __('Advanced Analytics', 'textdomain'),
                        'default' => true,
                    ],
                ],
            ],

            // Step 4: Complete
            [
                'id'       => 'complete',
                'template' => 'complete',
                'summary_items' => [
                    __('Site configured', 'textdomain'),
                    __('Features enabled', 'textdomain'),
                ],
            ],
        ],

        'wizard_config' => [
            'product_name'  => 'My Product',
            'checkout_url'  => 'https://example.com/checkout/',
            'dashboard_url' => admin_url(),
        ],
    ];
}

protected function get_membership_domain() {
    return 'example.com';
}
```

### Example 3: Testing with Forced Membership Status

```php
// Override methods for testing
protected function is_connected() {
    return true; // Force connected for testing
    // return parent::is_connected(); // Uncomment for production
}

protected function is_member_active( $domain = null ) {
    return true; // Force active for testing
    // return parent::is_member_active( $domain ); // Uncomment for production
}
```

---

## Customization

### Custom Strings

Override wizard strings:

```php
protected function get_wizard_strings() {
    return array_merge(
        parent::get_wizard_strings(),
        [
            'continue'      => __('Next Step', 'textdomain'),
            'complete_setup' => __('Finish', 'textdomain'),
            // Add custom strings
            'custom_message' => __('Custom text', 'textdomain'),
        ]
    );
}
```

### Wizard Configuration

```php
'wizard_config' => [
    'product_name'   => 'My Product',           // Product display name
    'checkout_url'   => 'https://...',          // Where to buy
    'dashboard_url'  => admin_url(),            // Where to go after
    'view_all_url'   => 'https://...',          // View all features link
],
```

---

## Best Practices

1. **Always check both connection and membership status** for premium features
2. **Use `show_if_paid` for premium-only steps** to automatically hide them from free users
3. **Provide clear upsell messaging** for free users without being intrusive
4. **Test all conditional visibility combinations** (not connected, connected+inactive, connected+active)
5. **Override membership methods temporarily** for testing with forced values
6. **Keep steps focused** - each step should have a single clear purpose
7. **Use built-in templates** when possible for consistency

---

## Troubleshooting

### Fields Not Showing Based on Membership

1. Verify methods are being called:
   ```php
   protected function is_member_active( $domain = null ) {
       error_log('Checking membership for: ' . $this->get_membership_domain());
       return parent::is_member_active( $domain );
   }
   ```

2. Check browser console for:
   - "Membership Status Initialized" log
   - "Field visibility check" logs
   - Verify `isMemberActive` and `isConnected` are booleans, not strings

3. Ensure JavaScript is rebuilt after changes:
   ```bash
   npm run build
   ```

### Membership Step Not Being Skipped

The membership step auto-skips when BOTH conditions are true:
- `is_connected() === true`
- `is_member_active() === true`

Verify both in PHP error logs or by adding debug output.

### License Check Returning False

1. Check the domain is correct: `get_membership_domain()` should return your product domain
2. Verify the license data exists: `get_option('exup_keys')` contains your domain
3. Check status value: `$keys['yourdomain.com']->status === 'active'`

---

## Additional Resources

- See `AyeCode_Wizard_Example.php` for a complete working example
- All framework field types work in wizard steps
- Wizard uses same AJAX handlers as settings pages
- Dark mode is automatically handled via theme toggle

---

**Need help?** Check the main [Settings Framework documentation](README.md) for field types and general configuration.
