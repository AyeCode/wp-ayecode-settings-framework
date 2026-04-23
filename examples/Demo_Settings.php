<?php

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * This is the new, recommended way to implement a settings page.
 *
 * This class extends the abstract Settings_Framework and provides all the
 * necessary configuration by defining properties and implementing the get_config() method.
 * It also contains its own handlers for its specific tool actions, keeping all related
 * logic perfectly encapsulated.
 */
class WP_AyeCode_Framework_Demo_Settings extends \AyeCode\SettingsFramework\Settings_Framework {

    // Define the properties to configure the admin page.
    protected $option_name   = 'ayecode_framework_demo_settings';
    protected $page_slug     = 'ayecode-framework-demo';
    protected $plugin_name   = 'AyeCode Settings Framework Demo';
    protected $menu_title    = 'Settings Demo';
    protected $page_title    = 'Settings Framework Demo';
    protected $menu_icon     = 'dashicons-admin-generic';
    protected $menu_position = 30;

    /**
     * Overrides the parent constructor to add its own action hooks for tools.
     */
    public function __construct() {
        parent::__construct(); // IMPORTANT: Always call the parent constructor!

        // Add hooks for this specific settings page's tools.
        // The hooks are dynamic based on the page_slug.
        add_action( 'asf_execute_tool_' . $this->page_slug, [ $this, 'handle_demo_tool_action' ], 10, 2 );
        add_action( 'asf_render_content_pane_' . $this->page_slug, [ $this, 'handle_demo_content_pane' ], 10, 1 );
    }

    /**
     * Helper function to get a list of users for select dropdowns.
     * @return array
     */
    public function get_user_options() {
        $users = get_users(['fields' => ['ID', 'display_name']]);
        $options = [];
        foreach ($users as $user) {
            $options[$user->ID] = $user->display_name;
        }
        return $options;
    }


    /**
     * Provides the settings configuration array for this specific page.
     *
     * @return array The configuration array.
     */
    public function get_config() {
        $api_manager = new \AyeCode\SettingsFramework\AyeCode_API_Key_Manager();

        return [
                'sections' => [
                        [
                                'id'    => 'general',
                                'name'  => __( 'General Settings', 'ayecode-connect' ),
                                'icon'  => 'fa-solid fa-gear',
                                'fields' => [
                                        [
                                                'id'      => 'site_title',
                                                'type'    => 'text',
                                                'label'   => __( 'Site Title', 'ayecode-connect' ),
                                                'desc'    => __( 'Standard text field for a setting.', 'ayecode-connect' ),
                                                'default' => get_bloginfo( 'name' ),
                                        ],
                                        [
                                                'id'      => 'radio_example',
                                                'type'    => 'radio',
                                                'label'   => __( 'Radio', 'ayecode-connect' ),
                                                'desc'    => __( 'Radio buttons for single selection (vertical list).', 'ayecode-connect' ),
                                                'options' => [
                                                        'option_one' => __( 'Option One', 'ayecode-connect' ),
                                                        'option_two' => __( 'Option Two', 'ayecode-connect' ),
                                                ],
                                                'default' => 'option_two',
                                        ],
                                        [
                                                'id'      => 'radio_group_example',
                                                'type'    => 'radio_group',
                                                'label'   => __( 'Radio Group', 'ayecode-connect' ),
                                                'desc'    => __( 'Radio buttons displayed as button group.', 'ayecode-connect' ),
                                                'options' => [
                                                        'small' => __( 'Small', 'ayecode-connect' ),
                                                        'medium' => __( 'Medium', 'ayecode-connect' ),
                                                        'large' => __( 'Large', 'ayecode-connect' ),
                                                ],
                                                'default' => 'medium',
                                                'button_style' => 'outline-primary',
                                        ],
                                        [
                                                'id'      => 'radio_card_group_example',
                                                'type'    => 'radio_card_group',
                                                'label'   => __( 'Radio Card Group', 'ayecode-connect' ),
                                                'desc'    => __( 'Radio buttons displayed as cards with icons.', 'ayecode-connect' ),
                                                'options' => [
                                                        'basic' => [
                                                                'label' => __( 'Basic', 'ayecode-connect' ),
                                                                'icon' => 'fa-solid fa-user',
                                                                'description' => __( 'Basic plan features', 'ayecode-connect' ),
                                                        ],
                                                        'pro' => [
                                                                'label' => __( 'Pro', 'ayecode-connect' ),
                                                                'icon' => 'fa-solid fa-star',
                                                                'icon_color' => '#ffc107',
                                                                'description' => __( 'Pro plan features', 'ayecode-connect' ),
                                                        ],
                                                        'enterprise' => [
                                                                'label' => __( 'Enterprise', 'ayecode-connect' ),
                                                                'icon' => 'fa-solid fa-building',
                                                                'icon_color' => '#0d6efd',
                                                                'description' => __( 'Enterprise plan features', 'ayecode-connect' ),
                                                        ],
                                                ],
                                                'default' => 'pro',
                                        ],
                                        [
                                                'id'      => 'checkbox_example',
                                                'type'    => 'checkbox',
                                                'label'   => __( 'Checkbox', 'ayecode-connect' ),
                                                'desc'    => __( 'Single checkbox for yes/no options.', 'ayecode-connect' ),
                                                'default' => '1',
                                        ],
                                        [
                                                'id'      => 'checkbox_group_example',
                                                'type'    => 'checkbox_group',
                                                'label'   => __( 'Checkbox Group', 'ayecode-connect' ),
                                                'desc'    => __( 'Multiple checkboxes for multi-selection.', 'ayecode-connect' ),
                                                'options' => [
                                                        'option_1' => __( 'Option 1', 'ayecode-connect' ),
                                                        'option_2' => __( 'Option 2', 'ayecode-connect' ),
                                                        'option_3' => __( 'Option 3', 'ayecode-connect' ),
                                                ],
                                                'default' => ['option_1', 'option_2'],
                                        ],
                                        [
                                                'id'      => 'checkbox_card_group_example',
                                                'type'    => 'checkbox_card_group',
                                                'label'   => __( 'Checkbox Card Group', 'ayecode-connect' ),
                                                'desc'    => __( 'Multiple checkboxes displayed as cards.', 'ayecode-connect' ),
                                                'options' => [
                                                        'card_1' => __( 'Card 1', 'ayecode-connect' ),
                                                        'card_2' => __( 'Card 2', 'ayecode-connect' ),
                                                        'card_3' => __( 'Card 3', 'ayecode-connect' ),
                                                ],
                                                'default' => ['card_1'],
                                        ],
                                        array(
                                                'id'      => 'shortcodes_allowed_roles',
                                                'type'    => 'multiselect',
                                                'label'   => __( 'Allow shortcodes in description', 'ayecode-connect' ),
                                                'description' => __( 'Select user roles that are allowed to use shortcodes or blocks in the listing description field.', 'ayecode-connect' ),
                                                'options' => function_exists('geodir_user_roles') ? geodir_user_roles() : array(),
                                                'default' => array('administrator'),
                                                'class'   => 'aui-select2',
                                                'placeholder' => __('Select roles...', 'ayecode-connect'),
                                                'searchable' => array('shortcode', 'blocks', 'description', 'content', 'permissions'),
                                        )
                                ],
                        ],
                    // New Form Builder Section Added Here
                        [
                                'id'    => 'listing_form_builder', // This will be the key where the form structure is saved
                                'name'  => __( 'Listing Form Builder', 'ayecode-connect' ),
                                'icon'  => 'fa-solid fa-edit',
                                'type'  => 'form_builder',
                                'unique_key_property' => 'key', // <-- THIS IS THE NEW CONFIGURATION KEY
                                'nestable' => true,
                                'default_top' => true,
                                'templates' => [
                                        [
                                                'group_title' => 'Standard Fields',
                                                'options' => [
                                                    // These are the "real" field types. They have a full 'fields' schema
                                                    // and serve as the base for the predefined skeletons.
                                                        [
                                                                'id'      => 'core_text',
                                                                'title'   => 'Text',
                                                                'icon'    => 'fa-solid fa-font',
                                                                'limit'   => 5,
                                                                'fields'  => [
                                                                        [ 'id' => 'type', 'type' => 'hidden', 'default' => 'text' ],
                                                                        [ 'id' => '_is_default', 'type' => 'hidden', 'default' => false ],
                                                                        [ 'id' => 'label', 'type' => 'text', 'label' => 'Label', 'default' => 'New Text Field' ],
                                                                        [ 'id' => 'key', 'type' => 'text', 'label' => 'Field Key', 'default' => 'new_text_field' ],
                                                                        [ 'id' => 'icon', 'type' => 'icon', 'label' => 'Icon', 'default' => 'fa-solid fa-font' ],
                                                                        [ 'id' => 'description', 'type' => 'textarea', 'label' => 'Description', 'rows' => 2 ],
                                                                        [ 'id' => 'placeholder', 'type' => 'text', 'label' => 'Placeholder', 'show_if' => "[%is_required%] > 0" ],
                                                                        [ 'id' => 'is_required', 'type' => 'toggle', 'label' => 'Is Required' ],
                                                                        [ 'id' => 'is_active', 'type' => 'toggle', 'label' => 'Is Active', 'default' => true ],
                                                                        [
                                                                                'id' => 'conditions_wrapper',
                                                                                'type' => 'accordion',
                                                                                'fields' => [
                                                                                        [
                                                                                                'id' => 'conditions_panel',
                                                                                                'label' => 'Conditional Fields',
                                                                                                'description' => 'Setup conditional logic to show/hide this field based on other fields value or conditions.',
                                                                                                'fields' => [
                                                                                                        [
                                                                                                                'id' => 'conditions',
                                                                                                                'type' => 'conditions',
                                                                                                                'warning_key' => 'htmlvar_name',
                                                                                                                'warning_fields' => ['post_title', 'post_category', 'address'],
                                                                                                        ]
                                                                                                ]
                                                                                        ]
                                                                                ]
                                                                        ]
                                                                ]
                                                        ],
                                                        [
                                                                'id'      => 'core_textarea',
                                                                'title'   => 'Textarea',
                                                                'icon'    => 'fa-solid fa-paragraph',
                                                                'fields'  => [
                                                                        [ 'id' => 'type', 'type' => 'hidden', 'default' => 'textarea' ],
                                                                        [ 'id' => '_is_default', 'type' => 'hidden', 'default' => false ],
                                                                        [ 'id' => 'label', 'type' => 'text', 'label' => 'Label', 'default' => 'New Textarea' ],
                                                                        [ 'id' => 'key', 'type' => 'text', 'label' => 'Field Key', 'default' => 'new_textarea' ],
                                                                        [ 'id' => 'icon', 'type' => 'icon', 'label' => 'Icon', 'default' => 'fa-solid fa-paragraph' ],
                                                                        [ 'id' => 'description', 'type' => 'textarea', 'label' => 'Description', 'rows' => 2 ],
                                                                        [ 'id' => 'is_required', 'type' => 'toggle', 'label' => 'Is Required' ],
                                                                        [ 'id' => 'is_active', 'type' => 'toggle', 'label' => 'Is Active', 'default' => true ],
                                                                ]
                                                        ],
                                                        [
                                                                'id'      => 'core_select',
                                                                'title'   => 'Select',
                                                                'icon'    => 'fa-solid fa-list-ul',
                                                                'fields'  => [
                                                                        [ 'id' => 'type', 'type' => 'hidden', 'default' => 'select' ],
                                                                        [ 'id' => '_is_default', 'type' => 'hidden', 'default' => false ],
                                                                        [ 'id' => 'label', 'type' => 'text', 'label' => 'Label', 'default' => 'New Select' ],
                                                                        [ 'id' => 'key', 'type' => 'text', 'label' => 'Field Key', 'default' => 'new_select' ],
                                                                        [ 'id' => 'icon', 'type' => 'icon', 'label' => 'Icon', 'default' => 'fa-solid fa-list-ul' ],
                                                                        [ 'id' => 'description', 'type' => 'textarea', 'label' => 'Description', 'rows' => 2 ],
                                                                        [ 'id' => 'options', 'type' => 'textarea', 'label' => 'Options', 'description' => 'Enter one option per line in `key : value` format.', 'default' => 'opt1 : Option 1' ],
                                                                        [ 'id' => 'is_required', 'type' => 'toggle', 'label' => 'Is Required' ],
                                                                        [ 'id' => 'is_active', 'type' => 'toggle', 'label' => 'Is Active', 'default' => true ],
                                                                ]
                                                        ],
                                                ]
                                        ],
                                        [
                                                'group_title' => 'Predefined Fields',
                                                'options' => [
                                                    // This is a "skeleton". It has no 'fields' array. It creates a 'core_text'
                                                    // field and applies the specified defaults.
                                                        [
                                                                'id'       => 'custom_title_skeleton',
                                                                'title'    => 'Listing Title',
                                                                'icon'     => 'fa-solid fa-heading',
                                                                'limit'    => 1,
                                                                'base_id'  => 'core_text', // <-- The actual field type to create.
                                                                'nestable' => true, // Make this field a container
                                                                'allowed_children' => [ // Define what it can contain
                                                                        'core_text',
                                                                        'core_textarea'
                                                                ],
                                                                'defaults' => [           // <-- The values to apply to the new instance.
                                                                        'label'       => 'Listing Title',
                                                                        'key'         => 'listing_title',
                                                                        '_is_default' => true,
                                                                        'description' => 'The main title for the listing.',
                                                                        'is_required' => true,
                                                                ]
                                                        ],
                                                        [
                                                                'id'      => 'custom_location_group_skeleton',
                                                                'title'   => 'Location Group',
                                                                'icon'    => 'fa-solid fa-map-marker-alt',
                                                                'base_id' => 'core_text', // This could extend any field, here as an example
                                                                'nestable' => true, // Make this field a container too
                                                                'allowed_children' => [ // But this one can only hold select fields
                                                                        'core_select'
                                                                ],
                                                                'defaults'  => [
                                                                        'label' => 'Location Details',
                                                                        'key'   => 'location_details',
                                                                        'type'  => 'group', // Overriding the type itself
                                                                        '_is_default' => true,
                                                                        'icon'  => 'fa-solid fa-map-marker-alt',
                                                                ]
                                                        ],
                                                ]
                                        ]
                                ]
                        ],

                    // NEW: API Keys List Table Section
                        [
                                'id'    => 'api_keys',
                                'name'  => __( 'API Keys', 'ayecode-connect' ),
                                'icon'  => 'fa-solid fa-key',
                                'type'  => 'list_table',

                                'table_config' => [
                                        'singular' => 'API Key',
                                        'plural'   => 'API Keys',
                                        'ajax_action_get' => 'get_api_keys',
                                        'ajax_action_bulk' => 'bulk_api_key_action',

                                        'columns' => [
                                                'description'   => [ 'label' => 'Description' ],
                                                'truncated_key' => [ 'label' => 'Key Ending In' ],
                                                'permissions'   => [ 'label' => 'Permissions' ],
                                                'last_access'   => [ 'label' => 'Last Access' ],
                                        ],

                                        'statuses' => [
                                                'status_key' => 'permissions',
                                                'labels' => [
                                                        'read' => 'Read Only',
                                                        'write' => 'Write Only',
                                                        'read_write' => 'Read/Write',
                                                ],
                                                'default_status' => 'all',
                                        ],
                                        'filters' => [
                                                [
                                                        'id' => 'permissions',
                                                        'placeholder' => 'All Permissions',
                                                        'options' => [
                                                                'read' => 'Read',
                                                                'write' => 'Write',
                                                                'read_write' => 'Read/Write',
                                                        ],
                                                ],
                                        ],
                                        'bulk_actions' => [
                                                'delete' => 'Delete',
                                        ],

                                        // Example: Custom row actions (commented out by default)
                                        // 'row_actions' => [
                                        //         'edit' => [
                                        //                 'label' => 'Edit',
                                        //                 'icon' => 'fa-solid fa-pencil',
                                        //                 'action' => 'edit'
                                        //         ],
                                        //         'delete' => [
                                        //                 'label' => 'Delete',
                                        //                 'icon' => 'fa-solid fa-trash-can',
                                        //                 'action' => 'delete',
                                        //                 'show_if' => "item.permissions !== 'read_write'" // Example: hide delete for read_write keys
                                        //         ],
                                        //         'regenerate' => [
                                        //                 'label' => 'Regenerate',
                                        //                 'icon' => 'fa-solid fa-rotate',
                                        //                 'ajax_action' => 'regenerate_api_key',
                                        //                 'confirm' => true, // Show confirmation dialog
                                        //                 'confirm_message' => 'Regenerate this API key? The old key will stop working.'
                                        //         ],
                                        //         'view_logs' => [
                                        //                 'label' => 'View Logs',
                                        //                 'icon' => 'fa-solid fa-file-lines',
                                        //                 'link' => 'admin.php?page=logs&key_id={{id}}', // Use {{property}} placeholders
                                        //                 'target' => '_blank' // Open in new tab
                                        //         ]
                                        // ],
                                ],

                                'modal_config' => [
                                        'title_add'  => 'Add New API Key',
                                        'title_edit' => 'Edit API Key',
                                        'ajax_action_create' => 'create_api_key',
                                        'ajax_action_update' => 'update_api_key',
                                        'ajax_action_delete' => 'delete_api_key',

                                        'fields' => [
                                                [
                                                        'id'      => 'description',
                                                        'type'    => 'text',
                                                        'label'   => __( 'Description', 'ayecode-connect' ),
                                                        'extra_attributes' => ['required' => true]
                                                ],
                                                [
                                                        'id'      => 'user_id',
                                                        'type'    => 'select',
                                                        'label'   => __( 'User', 'ayecode-connect' ),
                                                        'options' => $this->get_user_options()
                                                ],
                                                [
                                                        'id'      => 'permissions',
                                                        'type'    => 'select',
                                                        'label'   => __( 'Permissions', 'ayecode-connect' ),
                                                        'options' => ['read' => 'Read', 'write' => 'Write', 'read_write' => 'Read/Write'],
                                                        'default' => 'read_write'
                                                ]
                                        ]
                                ],
                                'post_create_view' => [
                                        'title'   => 'API Key Generated Successfully',
                                        'message' => 'Please copy your Consumer Key and Consumer Secret. You will not be shown the secret key again.',
                                        'fields'  => [
                                                [ 'id' => 'consumer_key', 'type' => 'text', 'label' => 'Consumer Key', 'extra_attributes' => ['readonly' => true, 'onclick' => 'this.select();'] ],
                                                [ 'id' => 'consumer_secret', 'type' => 'text', 'label' => 'Consumer Secret', 'extra_attributes' => ['readonly' => true, 'onclick' => 'this.select();'] ],
                                        ]
                                ]
                        ],
                        [
                                'id' => 'accordion_demo',
                                'name' => __('Accordion Demo', 'ayecode-connect'),
                                'icon' => 'fa-solid fa-layer-group',
                                'fields' => [
                                        [
                                                'id' => 'my_accordion_container',
                                                'type' => 'accordion',
                                                'default_open' => 'my_accordion_container1',
                                                'fields' => [
                                                        [
                                                                'label' => 'First Panel',
                                                                'id' => 'my_accordion_container1',
                                                                'description' => 'This is the first collapsible panel.',
                                                                'fields' => [
                                                                        [
                                                                                'id' => 'accordion_field_one',
                                                                                'type' => 'text',
                                                                                'label' => 'Text Field Inside Accordion',
                                                                                'default' => 'Hello World'
                                                                        ],
                                                                        [
                                                                                'id' => 'accordion_field_two',
                                                                                'type' => 'toggle',
                                                                                'label' => 'Toggle Inside Accordion',
                                                                                'default' => true
                                                                        ],
                                                                ]
                                                        ],
                                                        [
                                                                'label' => 'Second Panel (Open by Default)',
                                                                'id' => 'my_accordion_container2',
                                                                'description' => 'This one starts in an open state.',
                                                                'open' => true, // Add this to make a panel open by default
                                                                'fields' => [
                                                                        [
                                                                                'id' => 'accordion_field_three',
                                                                                'type' => 'color',
                                                                                'label' => 'Color Picker',
                                                                                'default' => '#0055ff'
                                                                        ],
                                                                        array(
                                                                                'id'      => 'shortcodes_allowed_roles',
                                                                                'type'    => 'multiselect',
                                                                                'label'   => __( 'Allow shortcodes in description', 'ayecode-connect' ),
                                                                                'description' => __( 'Select user roles that are allowed to use shortcodes or blocks in the listing description field.', 'ayecode-connect' ),
                                                                                'options' => function_exists('geodir_user_roles') ? geodir_user_roles() : array(),
                                                                                'default' => array('administrator'),
                                                                                'class'   => 'aui-select2',
                                                                                'placeholder' => __('Select roles...', 'ayecode-connect'),
                                                                                'searchable' => array('shortcode', 'blocks', 'description', 'content', 'permissions'),
                                                                        )
                                                                ]
                                                        ],
                                                ]
                                        ]
                                ]
                        ],
                        [
                                'id'    => 'tools',
                                'name'  => __( 'Simple Tools', 'ayecode-connect' ),
                                'icon'  => 'fa-solid fa-screwdriver-wrench',
                                'fields' => [
                                        [
                                                'id'           => 'tool_clear_cache_success',
                                                'type'         => 'action_button',
                                                'label'        => __( 'Clear Cache (Success Example)', 'ayecode-connect' ),
                                                'description'  => __( 'This button will simulate a successful background task.', 'ayecode-connect' ),
                                                'button_text'  => __( 'Clear Cache', 'ayecode-connect' ),
                                                'button_class' => 'btn-primary',
                                                'ajax_action'  => 'demo_clear_cache_success', // The unique ID for this action.
                                        ],
                                        [
                                                'id'           => 'tool_regenerate_thumbnails_progress',
                                                'type'         => 'action_button',
                                                'label'        => __( 'Regenerate Thumbnails (Progress Example)', 'ayecode-connect' ),
                                                'description'  => __( 'This button will simulate a task that reports progress.', 'ayecode-connect' ),
                                                'button_text'  => __( 'Regenerate' ),
                                                'button_class' => 'btn-secondary',
                                                'ajax_action'  => 'demo_regen_thumbs_progress', // The unique ID for this action.
                                        ],
                                ],
                        ],
                        [
                                'id'             => 'importer_tool',
                                'name'           => __( 'Action Page Demo', 'ayecode-connect' ),
                                'description'    => __( 'This entire page is an action page. The main save bar is hidden, and all inputs are sent with the single action button below.', 'ayecode-connect'),
                                'icon'           => 'fa-solid fa-bolt',
                                'type'           => 'action_page', // The new page type
                                'button_text'    => __( 'Run Importer', 'ayecode-connect' ),
                                'button_class'   => 'btn-success',
                                'ajax_action'    => 'run_importer_action', // The unique ID for this page's action
                                'fields' => [
                                        [
                                                'id'      => 'import_source_url',
                                                'type'    => 'url',
                                                'label'   => __( 'Source URL', 'ayecode-connect' ),
                                                'desc'    => __( 'Enter the URL of the data file to import.', 'ayecode-connect' ),
                                        ],
                                        [
                                                'id'      => 'overwrite_existing',
                                                'type'    => 'toggle',
                                                'label'   => __( 'Overwrite Existing Data', 'ayecode-connect' ),
                                                'desc'    => __( 'Enable to replace existing entries with imported ones.', 'ayecode-connect' ),
                                                'default' => 0,
                                        ],
                                ],
                        ],
                        [
                                'id'           => 'preloaded_tool',
                                'name'         => __( 'System Status', 'ayecode-connect' ),
                                'icon'         => 'fa-solid fa-server',
                                'type'         => 'custom_page',
                                'html_content' => $this->get_system_status_html(),
                        ],
                        [
                                'id'           => 'ajax_importer',
                                'name'         => __( 'Data Importer (AJAX)', 'ayecode-connect' ),
                                'icon'         => 'fa-solid fa-upload',
                                'type'         => 'import_page', // Use the new import_page type
                                'description'  => __( 'Upload a file and process it. The file is uploaded automatically when selected.', 'ayecode-connect' ),
                                'button_text'  => __( 'Run Import', 'ayecode-connect' ),
                                'button_class' => 'btn-primary',
                                'ajax_action'  => 'run_ajax_importer', // The action for the final import step
                                'fields'       => [
                                        [
                                                'id'    => 'imported_file_name', // Hidden field to store the uploaded filename
                                                'type'  => 'hidden',
                                        ],
                                        [
                                                'id'      => 'import_delete_records',
                                                'type'    => 'toggle',
                                                'label'   => __( 'Delete Existing Records', 'ayecode-connect' ),
                                                'desc'    => __( 'Enable to delete all existing records before importing.', 'ayecode-connect' ),
                                                'default' => 0,
                                        ],
                                ],
                        ],
                ],
        ];
    }
    /**
     * Central handler for all tool actions on this page.
     *
     * @param string $tool_action The 'ajax_action' from the field config.
     * @param array  $post_data   The full $_POST data from the request.
     */
    public function handle_demo_tool_action( $tool_action, $post_data ) {
        $api_manager = new \AyeCode\SettingsFramework\AyeCode_API_Key_Manager();
        $data = isset($post_data['data']) ? json_decode( wp_unslash( $post_data['data'] ), true) : [];
        $section_id = isset($post_data['section_id']) ? sanitize_text_field($post_data['section_id']) : '';
        $status = isset($post_data['status']) ? sanitize_text_field($post_data['status']) : 'all';
        $filters = isset($post_data['filters']) ? json_decode( wp_unslash( $post_data['filters'] ), true) : [];

        // You can use $section_id to distinguish between multiple list_table sections
        // For example: if ($section_id === 'api_keys') { ... }

        switch ( $tool_action ) {
            // API Key Actions
            case 'get_api_keys':
                $items = $api_manager->get_keys( $status, $filters );
                $response = ['items' => $items];

                // Only add counts if statuses are configured for this table
                $config = $this->get_config();
                $table_uses_statuses = false;
                foreach ($config['sections'] as $section) {
                    if ($section['id'] === 'api_keys' && isset($section['table_config']['statuses']['status_key'])) {
                        $table_uses_statuses = true;
                        break;
                    }
                }

                if ($table_uses_statuses) {
                    $response['counts'] = $api_manager->get_status_counts();
                }

                wp_send_json_success($response);
                break;
            case 'create_api_key':
                $result = $api_manager->create_key( $data['user_id'], $data['description'], $data['permissions'] );
                wp_send_json_success( $result );
                break;
            case 'update_api_key':
                $result = $api_manager->update_key( $data['id'], $data['description'], $data['permissions'] );
                wp_send_json_success( [
                        'updated_key' => $result,
                ] );
                break;
            case 'delete_api_key':
                $api_manager->revoke_key( $data['id'] );
                wp_send_json_success( [
                        'message' => 'API Key revoked.',
                ] );
                break;
            case 'bulk_api_key_action':
                $item_ids = isset($data['item_ids']) ? $data['item_ids'] : [];
                $action = isset($data['action']) ? $data['action'] : '';

                if ($action === 'delete') {
                    foreach ($item_ids as $id) {
                        $api_manager->revoke_key(absint($id));
                    }
                }

                wp_send_json_success([
                        'message' => 'Bulk action completed successfully.',
                ]);
                break;

            // Existing Tool Actions
            case 'demo_clear_cache_success':
                $this->handle_clear_cache();
                break;
            case 'demo_regen_thumbs_progress':
                $this->handle_regen_thumbs( $post_data );
                break;
            case 'run_importer_action':
                $this->handle_importer_action( $post_data );
                break;
            case 'run_ajax_importer':
                $this->handle_ajax_importer( $post_data );
                break;
        }
    }

    /**
     * Central handler for all AJAX content panes on this page.
     *
     * @param string $content_action The 'ajax_content' from the section config.
     */
    public function handle_demo_content_pane( $content_action ) {
        // This is no longer used for the importer, but kept for other potential uses.
    }

    // --- Specific Tool/Content Implementations ---

    private function handle_clear_cache() {
        sleep( 1 );
        wp_send_json_success( [
                'message'  => __( 'Cache cleared successfully!', 'ayecode-connect' ),
                'progress' => 100,
        ] );
    }

    private function handle_regen_thumbs( $post_data ) {
        $current_step = isset( $post_data['step'] ) ? absint( $post_data['step'] ) : 0;
        $new_progress = $current_step + 15;
        sleep( 1 ); // Simulate work.

        if ( $new_progress >= 100 ) {
            wp_send_json_success( [
                    'message'   => __( 'Thumbnails regenerated successfully!', 'ayecode-connect' ),
                    'progress'  => 100,
                    'next_step' => null, // Signal completion.
            ] );
        } else {
            wp_send_json_success( [
                    'message'   => sprintf( __( '%d%% complete...', 'ayecode-connect' ), $new_progress ),
                    'progress'  => $new_progress,
                    'next_step' => $new_progress, // Signal to continue.
            ] );
        }
    }

    private function handle_importer_action( $post_data ) {
        $input_data = isset( $post_data['input_data'] ) ? json_decode( wp_unslash( $post_data['input_data'] ), true ) : [];

        $source_url = isset($input_data['import_source_url']) ? esc_url_raw( $input_data['import_source_url'] ) : '';
        $overwrite = isset($input_data['overwrite_existing']) ? filter_var( $input_data['overwrite_existing'], FILTER_VALIDATE_BOOLEAN ) : false;

        // Simulate some work...
        sleep(2);

        if ( empty($source_url) ) {
            wp_send_json_error([
                    'message' => 'Error: Source URL cannot be empty.'
            ]);
        }

        // Send a success response.
        wp_send_json_success( [
                'message'  => sprintf('Import completed! Overwrite was %s.', $overwrite ? 'ON' : 'OFF'),
                'progress' => 100,
        ] );
    }

    private function handle_ajax_importer( $post_data ) {
        $input_data = isset( $post_data['input_data'] ) ? json_decode( wp_unslash( $post_data['input_data'] ), true ) : [];
        $filename   = isset( $input_data['imported_file_name'] ) ? sanitize_file_name( $input_data['imported_file_name'] ) : '';
        $delete     = isset( $input_data['import_delete_records'] ) ? filter_var( $input_data['import_delete_records'], FILTER_VALIDATE_BOOLEAN ) : false;

        if ( empty( $filename ) ) {
            wp_send_json_error( [ 'message' => 'Error: No file was imported.' ] );
        }

        // Construct the full path to the temporary file.
        $file_path = self::AYECODE_SF_IMPORT_TEMP_DIR . $this->page_slug . '/' . $filename;

        if ( ! file_exists( $file_path ) ) {
            wp_send_json_error( [ 'message' => 'Error: Imported file not found on server.' ] );
        }

        // Simulate processing the file.
        sleep( 2 );

        // Here you would typically read the file (e.g., fgetcsv) and process the data.
        // For this demo, we'll just confirm we received it.

        // Clean up the temp file after processing.
        wp_delete_file( $file_path );

        wp_send_json_success( [
                'message'  => sprintf( 'Successfully processed %s. Delete records was %s.', esc_html( $filename ), $delete ? 'ON' : 'OFF' ),
                'progress' => 100,
        ] );
    }


    private function get_system_status_html() {
        global $wp_version;
        ob_start();
        ?>
        <h4>System Status</h4>
        <p>This content was generated via a PHP function during the initial page load.</p>
        <ul class="list-group">
            <li class="list-group-item d-flex justify-content-between align-items-center">WordPress Version <span class="badge bg-primary rounded-pill"><?php echo esc_html( $wp_version ); ?></span></li>
            <li class="list-group-item d-flex justify-content-between align-items-center">PHP Version <span class="badge bg-primary rounded-pill"><?php echo esc_html( PHP_VERSION ); ?></span></li>
        </ul>
        <?php
        return ob_get_clean();
    }
}
