<?php
/**
 * AyeCode Settings Framework
 *
 * Modern WordPress settings framework with Alpine.js and Bootstrap 5
 *
 * @package AyeCode\SettingsFramework
 * @version 1.0.0
 */

namespace AyeCode\SettingsFramework;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class Settings_Framework {

    /**
     * Framework version
     */
    const VERSION = '1.0.0';

    /**
     * Settings configuration
     * @var array
     */
    private $config;

    /**
     * WordPress option name for storing settings
     * @var string
     */
    private $option_name;

    /**
     * Admin page slug
     * @var string
     */
    private $page_slug;

    /**
     * Plugin/theme name for display
     * @var string
     */
    private $plugin_name;

    /**
     * Admin page screen ID
     * @var string
     */
    private $screen_id;

    /**
     * Admin page instance
     * @var Admin_Page
     */
    private $admin_page;

    /**
     * AJAX handler instance
     * @var Ajax_Handler
     */
    private $ajax_handler;

    /**
     * Framework arguments
     * @var array
     */
    public $args;

    /**
     * Constructor
     *
     * @param array  $config      Settings configuration array
     * @param string $option_name WordPress option name for storing settings
     * @param array  $args        Additional arguments
     */
    public function __construct($config, $option_name, $args = array()) {

        // Validate required parameters
        if (empty($config) || empty($option_name)) {
            wp_die('Settings Framework: Configuration and option name are required.');
        }

        $this->config = $config;
        $this->option_name = sanitize_key($option_name);

        // Parse arguments with defaults
        $defaults = array(
            'page_slug'    => $this->option_name,
            'plugin_name'  => 'Plugin Settings',
            'menu_title'   => 'Settings',
            'page_title'   => 'Settings',
            'capability'   => 'manage_options',
            'menu_icon'    => 'dashicons-admin-generic',
            'menu_position' => null,
            'parent_slug'  => null // If set, creates submenu instead of top-level menu
        );

        $args = wp_parse_args($args, $defaults);

        $this->page_slug = sanitize_key($args['page_slug']);
        $this->plugin_name = wp_kses_post($args['plugin_name']);

        // Store args for later use
        $this->args = $args;

        // Initialize the framework
        $this->init();
    }

    /**
     * Initialize the framework
     */
    private function init() {

        // Only run in admin
        if (!is_admin()) {
            return;
        }

        // Load required classes
        $this->load_dependencies();

        // Initialize components
        $this->admin_page = new Admin_Page($this);
        $this->ajax_handler = new Ajax_Handler($this);

        // Hook into WordPress
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_assets'));

        // Add AJAX hooks
        add_action('wp_ajax_' . $this->get_ajax_action(), array($this->ajax_handler, 'handle_save'));
        add_action('wp_ajax_' . $this->get_ajax_action() . '_reset', array($this->ajax_handler, 'handle_reset'));

        // Add settings link to plugins page if this is a plugin
        add_filter('plugin_action_links_' . plugin_basename($this->get_calling_file()), array($this, 'add_settings_link'));

        // Add AyeCode UI
        add_filter('aui_screen_ids', array($this, 'add_aui_screens'));

        // Load translations when ready
        add_action('init', array($this, 'load_textdomain'));
    }

    /**
     * Load textdomain for translations
     */
    public function load_textdomain() {
        // This can be overridden by the calling plugin if needed
        // For now, we'll use basic English strings since this is a framework
    }

    /**
     * Load required dependencies
     */
    private function load_dependencies() {

        $base_path = dirname(__FILE__);

        require_once $base_path . '/Admin_Page.php';
        require_once $base_path . '/Ajax_Handler.php';
        require_once $base_path . '/Field_Renderer.php';
    }

    /**
     * Add admin menu page
     */
    public function add_admin_menu() {

        $args = $this->args;

        if (!empty($args['parent_slug'])) {
            // Add submenu page
            $this->screen_id = add_submenu_page(
                $args['parent_slug'],
                $args['page_title'],
                $args['menu_title'],
                $args['capability'],
                $this->page_slug,
                array($this->admin_page, 'render')
            );
        } else {
            // Add top-level menu page
            $this->screen_id = add_menu_page(
                $args['page_title'],
                $args['menu_title'],
                $args['capability'],
                $this->page_slug,
                array($this->admin_page, 'render'),
                $args['menu_icon'],
                $args['menu_position']
            );
        }

        // Hook into admin_head for this specific screen
        add_action('admin_head-' . $this->screen_id, array($this, 'admin_head'));

        // Allow hooking after screen ID is set
        do_action('ayecode_settings_framework_screen_id_set', $this->screen_id, $this);
    }

    /**
     * Enqueue CSS and JavaScript assets
     *
     * @param string $hook Current admin page hook
     */
    public function enqueue_assets($hook) {

        // Only load on our settings page
        if (!$this->is_settings_page($hook)) {
            return;
        }

        $assets_url = $this->get_assets_url();
        $version = self::VERSION;

        // Enqueue Alpine.js (local file)
        wp_enqueue_script(
            'alpine-js',
            $assets_url . 'js/alpine.min.js',
            array(),
            '3.14.9',
            true
        );

        // Add defer attribute to Alpine.js
        add_filter('script_loader_tag', array($this, 'add_defer_to_alpine'), 10, 2);


        // ✨ 1. Enqueue the new Field Renderer script
        wp_enqueue_script(
            'ayecode-settings-framework-renderer',
            $assets_url . 'js/field-renderer.js',
            array(), // No dependencies
            $version,
            true
        );

        // ✨ 2. Enqueue main admin script, making it dependent on the renderer
        wp_enqueue_script(
            'ayecode-settings-framework-admin',
            $assets_url . 'js/admin.js',
            array('ayecode-settings-framework-renderer'), // Dependency added
            $version,
            true
        );


        // IMAGE PREVIEW LOGIC
        $settings = $this->get_settings();
        $all_fields = $this->get_field_map();
        $image_previews = [];

        foreach ($all_fields as $field_id => $field_config) {
            // Check if the field is an image type and has a value saved
            if (isset($field_config['type']) && $field_config['type'] === 'image' && !empty($settings[$field_id])) {
                $image_id = absint($settings[$field_id]);
                if ($image_id) {
                    // Get the 'thumbnail' size URL for the preview
                    $preview_url = wp_get_attachment_image_url($image_id, 'thumbnail');
                    if ($preview_url) {
                        $image_previews[$field_id] = $preview_url;
                    }
                }
            }
        }


        // Localize script with configuration and current settings
        wp_localize_script(
            'ayecode-settings-framework-admin',
            'ayecodeSettingsFramework',
            array(
                'config' => $this->config,
                'settings' => $settings,
                'image_previews' => $image_previews,
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce($this->get_ajax_action()),
                'action' => $this->get_ajax_action(),
                'strings' => array(
                    'saving' => __('Saving...', 'ayecode-settings-framework'),
                    'saved' => __('Settings saved successfully!', 'ayecode-settings-framework'),
                    'error' => __('Error saving settings. Please try again.', 'ayecode-settings-framework'),
                    'unsaved_changes' => __('You have unsaved changes', 'ayecode-settings-framework'),
                    'confirm_discard' => __('Are you sure you want to discard your changes?', 'ayecode-settings-framework'),
                    'search_placeholder' => __('Quick search...', 'ayecode-settings-framework'),
                    'no_results' => __('No settings found', 'ayecode-settings-framework'),
                    'clear_search' => __('Clear search', 'ayecode-settings-framework')
                )
            )
        );






    }

    /**
     * Add defer attribute to Alpine.js script tag
     *
     * @param string $tag    Script tag HTML
     * @param string $handle Script handle
     * @return string Modified script tag
     */
    public function add_defer_to_alpine($tag, $handle) {
        if ('alpine-js' === $handle) {
            return str_replace(' src', ' defer src', $tag);
        }
        return $tag;
    }

    /**
     * Check if current page is our settings page
     *
     * @param string $hook Current page hook
     * @return bool
     */
    private function is_settings_page($hook) {
        return $hook === $this->screen_id;
    }

    /**
     * Get assets URL
     *
     * @return string Assets URL with trailing slash
     */
    private function get_assets_url() {

        // Get the URL of the directory containing this framework file
        $framework_url = plugin_dir_url(__FILE__);

        // Assets are in the same directory structure, go up one level from src/ to assets/
        return trailingslashit($framework_url . '../assets');
    }

    /**
     * Get the file that instantiated this framework
     *
     * @return string File path
     */
    private function get_calling_file() {

        $backtrace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS);

        // Look for the first file outside of this framework
        foreach ($backtrace as $trace) {
            if (isset($trace['file']) && strpos($trace['file'], 'settings-framework') === false) {
                return $trace['file'];
            }
        }

        // Fallback to current file
        return __FILE__;
    }

    /**
     * Get current settings from database
     *
     * @return array Current settings
     */
    public function get_settings() {
        return get_option($this->option_name, array());
    }

    /**
     * Save settings to database using a "whitelist" approach.
     *
     * This method only updates settings that are explicitly defined in the
     * framework's configuration, preserving all other legacy settings.
     *
     * @param array $new_settings Settings to save from the form.
     * @return bool Success
     */
    public function save_settings($new_settings) {
        // 1. Get the full array of existing settings from the database.
        $current_settings = $this->get_settings();
//        print_r($current_settings);
        // 2. Get the "whitelist" of all valid field IDs defined in the UI config.
        $field_map = $this->get_field_map();

        // 3. Loop through the whitelist of allowed fields.
        foreach ($field_map as $key => $field_config) {

            // Check if a new value for this key was submitted from the form.
            if (isset($new_settings[$key])) {
                // If yes, sanitize it and update it in our settings array.
                $current_settings[$key] = $this->sanitize_field_value($new_settings[$key], $field_config['type']);
            } else {
                // If the key is not in the submitted data, it could be an unchecked box.
                // We must set it to a "false" or empty value to ensure it's saved as "off".
                $type = $field_config['type'];
                if ($type === 'checkbox' || $type === 'toggle') {
                    $current_settings[$key] = 0;
                } elseif ($type === 'multiselect' || $type === 'checkbox_group') {
                    $current_settings[$key] = array();
                }
            }
        }

//        print_r($current_settings);
//        exit;

        // 4. Save the modified array back to the database. Legacy keys are untouched.
        $result = update_option($this->option_name, $current_settings);

        // 5. Fire action after settings are saved.
        do_action('ayecode_settings_framework_saved', $current_settings, $this->option_name);

        return $result;
    }

    /**
     * Reset settings to defaults
     *
     * @return bool Success
     */
    public function reset_settings() {

        $defaults = $this->get_default_settings();
        $result = update_option($this->option_name, $defaults);

        // Fire action after settings are reset
        do_action('ayecode_settings_framework_reset', $defaults, $this->option_name);

        return $result;
    }

    /**
     * Get default settings from configuration
     *
     * @return array Default settings
     */
    private function get_default_settings() {

        $defaults = array();
        $field_map = $this->get_field_map();

        foreach ($field_map as $field_id => $field) {
            if (isset($field['default'])) {
                $defaults[$field_id] = $field['default'];
            }
        }

        return $defaults;
    }

    /**
     * Sanitize settings based on field types
     *
     * @param array $settings Raw settings
     * @return array Sanitized settings
     */
    private function sanitize_settings($settings) {

        if (!is_array($settings)) {
            return array();
        }

        $sanitized = array();
        $field_map = $this->get_field_map();

        foreach ($settings as $key => $value) {

            $key = sanitize_key($key);

            if (isset($field_map[$key])) {
                $field_type = $field_map[$key]['type'];
                $sanitized[$key] = $this->sanitize_field_value($value, $field_type);
            } else {
                // Default sanitization for unknown fields
                $sanitized[$key] = sanitize_text_field($value);
            }
        }

        return $sanitized;
    }

    /**
     * Sanitize individual field value based on type
     *
     * @param mixed  $value      Field value
     * @param string $field_type Field type
     * @return mixed Sanitized value
     */
    private function sanitize_field_value($value, $field_type) {

        switch ($field_type) {
            case 'text':
            case 'password':
            case 'hidden':
                return sanitize_text_field($value);

            case 'textarea':
                return sanitize_textarea_field($value);

            case 'email':
                return sanitize_email($value);

            case 'url':
                return esc_url_raw($value);

            case 'number':
            case 'range':
                return is_numeric($value) ? (float) $value : 0;

            case 'checkbox':
            case 'toggle':
                return !empty($value) ? 1 : 0;

            case 'select':
            case 'radio':
                return sanitize_text_field($value);

            case 'multiselect':
            case 'checkbox_group':
                if (is_array($value)) {
                    return array_map('sanitize_text_field', $value);
                }
                return array();

            case 'color':
                return sanitize_hex_color($value);

            case 'file':
                return esc_url_raw($value);
            case 'image':
                return absint($value); // Sanitize as an absolute integer

            default:
                return sanitize_text_field($value);
        }
    }

    /**
     * Build field map for sanitization
     *
     * @return array Field ID => field config map
     */
    private function get_field_map() {
        $field_map = [];
        if (empty($this->config['sections']) || !is_array($this->config['sections'])) {
            return $field_map;
        }

        foreach ($this->config['sections'] as $section) {
            // Fields directly under a section
            if (!empty($section['fields']) && is_array($section['fields'])) {
                $this->extract_fields_from_array($section['fields'], $field_map);
            }
            // Fields within subsections
            if (!empty($section['subsections']) && is_array($section['subsections'])) {
                foreach ($section['subsections'] as $subsection) {
                    if (!empty($subsection['fields']) && is_array($subsection['fields'])) {
                        $this->extract_fields_from_array($subsection['fields'], $field_map);
                    }
                }
            }
        }
        return $field_map;
    }

    /**
     * Helper function to recursively extract fields from config arrays.
     *
     * @param array $fields_array The array of fields to process.
     * @param array $field_map    The map to add fields to (passed by reference).
     */
    private function extract_fields_from_array($fields_array, &$field_map) {
        foreach ($fields_array as $field) {
            if (isset($field['type']) && $field['type'] === 'group' && !empty($field['fields'])) {
                // Recursively extract from groups
                $this->extract_fields_from_array($field['fields'], $field_map);
            } elseif (!empty($field['id'])) {
                $field_map[$field['id']] = $field;
            }
        }
    }

    /**
     * Get AJAX action name
     *
     * @return string AJAX action
     */
    public function get_ajax_action() {
        return 'save_' . $this->option_name;
    }

    /**
     * Add settings link to plugin actions
     *
     * @param array $links Existing links
     * @return array Modified links
     */
    public function add_settings_link($links) {

        $settings_link = sprintf(
            '<a href="%s">%s</a>',
            admin_url('admin.php?page=' . $this->page_slug),
            __('Settings', 'ayecode-settings-framework')
        );

        array_unshift($links, $settings_link);

        return $links;
    }

    /**
     * Get framework configuration
     *
     * @return array Configuration
     */
    public function get_config() {
        return $this->config;
    }

    /**
     * Get option name
     *
     * @return string Option name
     */
    public function get_option_name() {
        return $this->option_name;
    }

    /**
     * Get page slug
     *
     * @return string Page slug
     */
    public function get_page_slug() {
        return $this->page_slug;
    }

    /**
     * Get plugin name
     *
     * @return string Plugin name
     */
    public function get_plugin_name() {
        return $this->plugin_name;
    }

    /**
     * Admin head hook for our page
     */
    public function admin_head() {
        // Hook for custom admin head content on settings page
        do_action('ayecode_settings_framework_admin_head', $this);
    }

    /**
     * Get the screen ID for this settings page
     *
     * @return string|null Screen ID or null if not set yet
     */
    public function get_screen_id() {
        return $this->screen_id;
    }

    /**
     * Add AUI screen support (if using AyeCode UI)
     *
     * @param array $screen_ids Existing screen IDs
     * @return array Modified screen IDs
     */
    public function add_aui_screens($screen_ids) {
        if ($this->screen_id) {
            $screen_ids[] = $this->screen_id;
        }
        return $screen_ids;
    }
}