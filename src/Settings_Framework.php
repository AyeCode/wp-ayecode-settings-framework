<?php
/**
 * AyeCode Settings Framework - Abstract Base Class
 *
 * This abstract class serves as the foundation for creating new settings pages.
 * It handles the core WordPress integrations, script enqueueing, and AJAX handling flow.
 * To create a settings page, a new class must extend this one and implement the
 * get_config() method, as well as define the necessary protected properties.
 *
 * @package AyeCode\SettingsFramework
 * @version 1.1.0
 */

namespace AyeCode\SettingsFramework;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

abstract class Settings_Framework {

    /**
     * Framework version.
     */
    const VERSION = '1.1.0';

    // region Child Class Properties
    // These properties must be defined in the child class to configure the settings page.
    // ----------------------------------------------------------------------------------

    /**
     * The unique WordPress option name where settings are stored.
     *
     * @var string
     */
    protected $option_name;

    /**
     * The unique slug for the admin page.
     *
     * @var string
     */
    protected $page_slug;

    /**
     * The name of the plugin, displayed in the header.
     *
     * @var string
     */
    protected $plugin_name = 'Plugin Settings';

    /**
     * The title displayed in the <title> tag of the page.
     *
     * @var string
     */
    protected $page_title = 'Settings';

    /**
     * The text for the menu item.
     *
     * @var string
     */
    protected $menu_title = 'Settings';

    /**
     * The capability required to access this settings page.
     *
     * @var string
     */
    protected $capability = 'manage_options';

    /**
     * The icon for the admin menu. Can be a dashicon class or a URL.
     *
     * @var string
     */
    protected $menu_icon = 'dashicons-admin-generic';

    /**
     * The position of the menu item in the admin menu.
     *
     * @var int|null
     */
    protected $menu_position = null;

    /**
     * If set, creates a submenu under the given parent slug.
     *
     * @var string|null
     */
    protected $parent_slug = null;

    // endregion

    // region Internal Properties
    // These are used internally by the framework.
    // ----------------------------------------------------------------------------------

    /**
     * Holds the configuration array once loaded.
     * The config is lazy-loaded to avoid impacting performance on other admin pages.
     *
     * @var array|null
     */
    private $config = null;

    /**
     * The screen ID for the admin page, set by WordPress.
     *
     * @var string
     */
    protected $screen_id;

    /**
     * Instance of the Admin_Page renderer.
     *
     * @var Admin_Page
     */
    protected $admin_page;

    /**
     * Instance of the AJAX handler.
     *
     * @var Ajax_Handler
     */
    protected $ajax_handler;

    /**
     * Instance of the Field_Manager.
     *
     * @var Field_Manager
     */
    public $field_manager;

    // endregion

    /**
     * Abstract method for retrieving the settings configuration array.
     * This method MUST be implemented by the child class.
     *
     * @return array The settings configuration array.
     */
    abstract protected function get_config();

    /**
     * Constructor.
     *
     * Initializes the framework by validating the required child properties
     * and setting up the core WordPress hooks.
     */
    public function __construct() {
        // Ensure required properties are set by the child class.
        if ( empty( $this->option_name ) || empty( $this->page_slug ) ) {
            wp_die( 'Settings Framework: The extending class must define the protected properties "$option_name" and "$page_slug".' );
        }
        $this->init();
    }

    /**
     * Initializes the framework components and hooks into WordPress.
     */
    private function init() {
        if ( ! is_admin() ) {
            return;
        }

        $this->load_dependencies();

        // Instantiate core components, passing this framework instance to them.
        $this->field_manager = new Field_Manager( $this );
        $this->admin_page    = new Admin_Page( $this );
        $this->ajax_handler  = new Ajax_Handler( $this );

        // Register core hooks.
        add_action( 'admin_menu', [ $this, 'add_admin_menu' ] );
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );

        // Register AJAX actions. The handlers are in the Ajax_Handler class.
        add_action( 'wp_ajax_save_' . $this->option_name, [ $this->ajax_handler, 'handle_save' ] );
        add_action( 'wp_ajax_reset_' . $this->option_name, [ $this->ajax_handler, 'handle_reset' ] );

        // Generic AJAX handlers for tools and content panes.
        // These hooks are designed to be used by multiple framework instances.
        // The specific tool/content action is identified in the POST data.
        add_action( 'wp_ajax_ayecode_settings_framework_execute_action_' .  $this->page_slug, [ $this, 'handle_tool_action' ] );
        add_action( 'wp_ajax_ayecode_settings_framework_load_content_pane_' .  $this->page_slug, [ $this, 'handle_load_content_pane' ] );

        // Add settings link to the plugins page.
        add_filter( 'plugin_action_links_' . plugin_basename( $this->get_calling_file() ), [ $this, 'add_settings_link' ] );

        // Integrate with AyeCode UI if present.
        add_filter( 'aui_screen_ids', [ $this, 'add_aui_screens' ] );
    }

    /**
     * Loads the framework's dependent class files.
     */
    private function load_dependencies() {
        $base_path = dirname( __FILE__ );
        require_once $base_path . '/Admin_Page.php';
        require_once $base_path . '/Ajax_Handler.php';
        require_once $base_path . '/Field_Renderer.php'; // Kept for static helpers.
        require_once $base_path . '/Field_Manager.php';   // The new decoupled field manager.
    }

    /**
     * Adds the settings page to the WordPress admin menu.
     */
    public function add_admin_menu() {
        $render_callback = [ $this->admin_page, 'render' ];

        if ( ! empty( $this->parent_slug ) ) {
            $this->screen_id = add_submenu_page(
                $this->parent_slug,
                $this->page_title,
                $this->menu_title,
                $this->capability,
                $this->page_slug,
                $render_callback
            );
        } else {
            $this->screen_id = add_menu_page(
                $this->page_title,
                $this->menu_title,
                $this->capability,
                $this->page_slug,
                $render_callback,
                $this->menu_icon,
                $this->menu_position
            );
        }
    }

    /**
     * Enqueues CSS and JavaScript assets for the settings page.
     * This function is hooked into `admin_enqueue_scripts` and will only
     * load assets on the correct admin page to maintain performance.
     *
     * @param string $hook The current admin page hook.
     */
    public function enqueue_assets( $hook ) {
        if ( $hook !== $this->screen_id ) {
            return;
        }

        // Enqueue all WordPress and framework scripts from this central method.
        wp_enqueue_media();
        wp_enqueue_script( 'iconpicker' );

        wp_enqueue_style( 'flatpickr' );
        wp_enqueue_script( 'flatpickr' );

        $assets_url = plugin_dir_url( __DIR__ ) . 'assets/';
        $version    = self::VERSION;

        // Enqueue Alpine.js and add the 'defer' attribute.
        wp_enqueue_script( 'alpine-js', $assets_url . 'js/alpine.min.js', [], '3.14.9', true );
        add_filter( 'script_loader_tag', [ $this, 'add_defer_to_alpine' ], 10, 2 );

        // Enqueue the field renderer and the main admin script.
        wp_enqueue_script( 'ayecode-settings-framework-renderer', $assets_url . 'js/field-renderer.js', [], $version, true );
        wp_enqueue_script( 'ayecode-settings-framework-admin', $assets_url . 'js/admin.js', [ 'ayecode-settings-framework-renderer' ], $version, true );

        // Localize the main script with all necessary data.
        wp_localize_script(
            'ayecode-settings-framework-admin',
            'ayecodeSettingsFramework',
            [
                'config'         => $this->get_config_with_preloads(),
                'settings'       => $this->get_settings(),
                'image_previews' => $this->get_image_previews(),
                'ajax_url'       => admin_url( 'admin-ajax.php' ),
                'nonce'          => wp_create_nonce( 'save_' . $this->option_name ),
                'tool_nonce'     => wp_create_nonce( 'asf_tool_action' ),
                'action'         => 'save_' . $this->option_name, // The base action for save/reset.
                'tool_ajax_action' => 'ayecode_settings_framework_execute_action_' . $this->page_slug,
                'content_pane_ajax_action' => 'ayecode_settings_framework_load_content_pane_' . $this->page_slug,
                'strings'        => [
                    'saving'            => __( 'Saving...', 'ayecode-settings-framework' ),
                    'saved'             => __( 'Settings saved successfully!', 'ayecode-settings-framework' ),
                    'error'             => __( 'Error saving settings. Please try again.', 'ayecode-settings-framework' ),
                    'unsaved_changes'   => __( 'You have unsaved changes', 'ayecode-settings-framework' ),
                    'confirm_discard'   => __( 'Are you sure you want to discard your changes?', 'ayecode-settings-framework' ),
                    'search_placeholder' => __( 'Quick search...', 'ayecode-settings-framework' ),
                    'no_results'        => __( 'No settings found', 'ayecode-settings-framework' ),
                    'clear_search'      => __( 'Clear search', 'ayecode-settings-framework' ),
                ],
            ]
        );
    }

    /**
     * Gets the full settings configuration array, loading it if necessary.
     * This is the "lazy-load" getter for the config.
     *
     * @return array The configuration array.
     */
    public function get_config_raw() {
        if ( is_null( $this->config ) ) {
            // call_user_func is used to call the abstract method implemented in the child.
            $this->config = call_user_func( [ $this, 'get_config' ] );
        }

        return $this->config;
    }

    /**
     * Retrieves settings from the database.
     *
     * @return array Current settings.
     */
    public function get_settings() {
        return get_option( $this->option_name, [] );
    }

    /**
     * Saves settings to the database. It delegates the sanitization
     * and processing to the Field_Manager.
     *
     * @param array $new_settings The raw settings data from the AJAX request.
     * @return bool True on success, false on failure.
     */
    public function save_settings( $new_settings ) {
        $current_settings = $this->get_settings();
        $sanitized        = $this->field_manager->sanitize_and_prepare_settings( $new_settings, $current_settings );

        $result = update_option( $this->option_name, $sanitized );

        do_action( 'ayecode_settings_framework_saved', $sanitized, $this->option_name );

        return $result;
    }

    /**
     * Resets all settings to their default values as defined in the config.
     *
     * @return bool True on success, false on failure.
     */
    public function reset_settings() {
        $defaults = $this->field_manager->get_default_settings();
        $result   = update_option( $this->option_name, $defaults );

        do_action( 'ayecode_settings_framework_reset', $defaults, $this->option_name );

        return $result;
    }

    /**
     * Generic handler for "Action Buttons". It fires a dynamic hook
     * that a specific settings implementation can listen for.
     */
    public function handle_tool_action() {
        check_ajax_referer( 'asf_tool_action', 'nonce' );
        if ( ! current_user_can( $this->capability ) ) {
            wp_send_json_error( [ 'message' => 'Permission denied.' ] );
        }

        $tool_action = isset( $_POST['tool_action'] ) ? sanitize_key( $_POST['tool_action'] ) : '';
        if ( empty( $tool_action ) ) {
            wp_send_json_error( [ 'message' => 'No tool action specified.' ] );
        }

        // Fire a hook specific to this settings page instance and the action.
        // Example: asf_execute_tool_my_plugin_settings_page_my_tool_id
//        echo '###'.'asf_execute_tool_' . $this->page_slug;
        do_action( 'asf_execute_tool_' . $this->page_slug, $tool_action, $_POST );
    }

    /**
     * Generic handler for loading "Custom Content Panes" via AJAX.
     */
    public function handle_load_content_pane() {
        check_ajax_referer( 'asf_tool_action', 'nonce' );
        if ( ! current_user_can( $this->capability ) ) {
            wp_send_json_error( [ 'message' => 'Permission denied.' ] );
        }

        $content_action = isset( $_POST['content_action'] ) ? sanitize_key( $_POST['content_action'] ) : '';
        if ( empty( $content_action ) ) {
            wp_send_json_error( [ 'message' => 'No content action specified.' ] );
        }

        // Fire a hook specific to this settings page instance and the content pane ID.
        do_action( 'asf_render_content_pane_' . $this->page_slug, $content_action );
    }

    /**
     * Adds a "Settings" link to the plugin's action links on the plugins page.
     *
     * @param array $links Existing links.
     * @return array Modified links.
     */
    public function add_settings_link( $links ) {
        $settings_link = sprintf(
            '<a href="%s">%s</a>',
            admin_url( 'admin.php?page=' . $this->page_slug ),
            __( 'Settings', 'ayecode-settings-framework' )
        );
        array_unshift( $links, $settings_link );

        return $links;
    }

    /**
     * Adds the 'defer' attribute to the Alpine.js script tag for better performance.
     *
     * @param string $tag    The original script tag HTML.
     * @param string $handle The script's handle.
     * @return string The modified script tag.
     */
    public function add_defer_to_alpine( $tag, $handle ) {
        if ( 'alpine-js' === $handle ) {
            return str_replace( ' src', ' defer src', $tag );
        }

        return $tag;
    }

    /**
     * Pre-processes the config to include content for 'custom_page' sections
     * that use 'html_content', so it's available on page load.
     *
     * @return array The processed configuration.
     */
    private function get_config_with_preloads() {
        $config = $this->get_config_raw();
        if ( isset( $config['sections'] ) ) {
            foreach ( $config['sections'] as &$section ) {
                if ( isset( $section['type'], $section['html_content'] ) && $section['type'] === 'custom_page' ) {
                    // The content is directly embedded for the frontend.
                    $section['content_html'] = $section['html_content'];
                    unset( $section['html_content'] ); // Avoid sending it twice.
                }
            }
        }

        return $config;
    }

    /**
     * Generates preview URLs for all 'image' type fields that have a value.
     *
     * @return array An associative array of [field_id => preview_url].
     */
    private function get_image_previews() {
        $settings       = $this->get_settings();
        $all_fields     = $this->field_manager->get_field_map();
        $image_previews = [];

        foreach ( $all_fields as $field_id => $field_config ) {
            if ( isset( $field_config['type'] ) && $field_config['type'] === 'image' && ! empty( $settings[ $field_id ] ) ) {
                $image_id = absint( $settings[ $field_id ] );
                if ( $image_id > 0 ) {
                    $preview_url = wp_get_attachment_image_url( $image_id, 'thumbnail' );
                    if ( $preview_url ) {
                        $image_previews[ $field_id ] = $preview_url;
                    }
                }
            }
        }

        return $image_previews;
    }

    /**
     * Helper function to find the file that instantiated the child class.
     * Used for the 'plugin_action_links' filter.
     *
     * @return string The file path of the calling plugin.
     */
    private function get_calling_file() {
        $backtrace = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS );
        foreach ( $backtrace as $trace ) {
            if ( isset( $trace['file'] ) && strpos( $trace['file'], 'wp-ayecode-settings-framework' ) === false ) {
                return $trace['file'];
            }
        }

        return __FILE__; // Fallback
    }

    /**
     * Adds this page's screen ID to the list for AyeCode UI components.
     *
     * @param array $screen_ids Existing screen IDs.
     * @return array Modified screen IDs.
     */
    public function add_aui_screens( $screen_ids ) {
        if ( $this->screen_id ) {
            $screen_ids[] = $this->screen_id;
        }

        return $screen_ids;
    }

    // region Public Getters
    // Provides controlled access to protected properties for other classes.

    public function get_page_slug() {
        return $this->page_slug;
    }

    public function get_plugin_name() {
        return $this->plugin_name;
    }

    public function get_option_name() {
        return $this->option_name;
    }

    public function get_page_title() {
        return $this->page_title;
    }

    // endregion
}