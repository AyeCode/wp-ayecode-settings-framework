<?php
/**
 * Plugin Name: WP AyeCode Settings Framework
 * Plugin URI: https://github.com/AyeCode/wp-ayecode-settings-framework
 * Description: Modern WordPress settings framework with Alpine.js and Bootstrap 5. This plugin provides a demo and testing interface for the framework.
 * Version: 1.1.0
 * Author: AyeCode Ltd
 * Author URI: https://ayecode.io
 * License: GPL v3 or later
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain: wp-ayecode-settings-framework
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.5
 * Requires PHP: 7.4
 * Network: false
 *
 * @package WP_AyeCode_Settings_Framework
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('WP_AYECODE_SETTINGS_FRAMEWORK_VERSION', '1.1.0');
define('WP_AYECODE_SETTINGS_FRAMEWORK_PLUGIN_FILE', __FILE__);
define('WP_AYECODE_SETTINGS_FRAMEWORK_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('WP_AYECODE_SETTINGS_FRAMEWORK_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Main plugin class
 */
class WP_AyeCode_Settings_Framework {

    /**
     * Single instance of the class
     */
    private static $instance = null;

    /**
     * Framework instance
     */
    private $framework = null;

    /**
     * Get single instance
     */
    public static function instance() {

        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {

        // added to make it work in GD whule not in vendor folder @todo remove
        add_action( 'plugins_loaded', function () {
            $this->load_framework();
        },1 );


        add_action('init', array($this, 'init'));
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }

    /**
     * Initialize the plugin
     */
    public function init() {

        // Load text domain
        load_plugin_textdomain(
            'wp-ayecode-settings-framework',
            false,
            dirname(plugin_basename(__FILE__)) . '/languages'
        );

        // Load the framework
        $this->load_framework();

        // Initialize demo settings
        $this->init_demo_settings();

        // Add admin notices
        add_action('admin_notices', array($this, 'admin_notices'));

        // Add hooks for tool actions and content panes
        $this->add_tool_hooks();
    }

    /**
     * Load the settings framework
     */
    private function load_framework() {

        // Check if Composer autoloader exists
        $autoloader = WP_AYECODE_SETTINGS_FRAMEWORK_PLUGIN_DIR . 'vendor/autoload.php';

        if (file_exists($autoloader)) {
            require_once $autoloader;
        } else {
            // Load framework manually if no Composer
            require_once WP_AYECODE_SETTINGS_FRAMEWORK_PLUGIN_DIR . 'src/Settings_Framework.php';
            require_once WP_AYECODE_SETTINGS_FRAMEWORK_PLUGIN_DIR . 'src/Admin_Page.php';
            require_once WP_AYECODE_SETTINGS_FRAMEWORK_PLUGIN_DIR . 'src/Ajax_Handler.php';
            require_once WP_AYECODE_SETTINGS_FRAMEWORK_PLUGIN_DIR . 'src/Field_Renderer.php';
        }
    }

    /**
     * Initialize demo settings
     */
    private function init_demo_settings() {

        // Only initialize if the framework class exists
        if (!class_exists('AyeCode\SettingsFramework\Settings_Framework')) {
            return;
        }


        // Initialize the framework
        $this->framework = new \AyeCode\SettingsFramework\Settings_Framework(
            function() {
                return $this->get_demo_config();
            },
            'ayecode_framework_demo_settings',
            array(
                'plugin_name' => __('AyeCode Settings Framework Demo', 'wp-ayecode-settings-framework'),
                'menu_title' => __('Settings Demo', 'wp-ayecode-settings-framework'),
                'page_title' => __('Settings Framework Demo', 'wp-ayecode-settings-framework'),
                'menu_icon' => 'dashicons-admin-generic',
                'menu_position' => 30
            )
        );
    }

    /**
     * Get demo configuration
     */
    private function get_demo_config() {
        return array(
            'sections' => array(
                array(
                    'id' => 'general',
                    'name' => __('General Settings', 'wp-ayecode-settings-framework'),
                    'icon' => 'fa-solid fa-gear',
                    'fields' => array(
                        array(
                            'id' => 'site_title',
                            'type' => 'text',
                            'label' => __('Site Title', 'wp-ayecode-settings-framework'),
                            'description' => __('Standard text field for a setting.'),
                            'default' => get_bloginfo('name'),
                        ),
                    )
                ),
                array(
                    'id' => 'tools',
                    'name' => __('Simple Tools', 'wp-ayecode-settings-framework'),
                    'icon' => 'fa-solid fa-screwdriver-wrench',
                    'fields' => array(
                        array(
                            'id'          => 'tool_clear_cache_success',
                            'type'        => 'action_button',
                            'label'       => __('Clear Cache (Success Example)', 'wp-ayecode-settings-framework'),
                            'description' => __('This button will simulate a successful background task.'),
                            'button_text' => __('Clear Cache'),
                            'button_class'=> 'btn-primary',
                            'ajax_action' => 'demo_clear_cache_success'
                        ),
                        array(
                            'id'          => 'tool_regenerate_thumbnails_progress',
                            'type'        => 'action_button',
                            'label'       => __('Regenerate Thumbnails (Progress Example)', 'wp-ayecode-settings-framework'),
                            'description' => __('This button will simulate a task that reports progress.'),
                            'button_text' => __('Regenerate'),
                            'button_class'=> 'btn-secondary',
                            'ajax_action' => 'demo_regen_thumbs_progress'
                        ),
                    )
                ),
                array(
                    'id'             => 'preloaded_tool',
                    'name'           => __('System Status', 'wp-ayecode-settings-framework'),
                    'icon'           => 'fa-solid fa-server',
                    'type'           => 'custom_page',
                    'html_content'   => $this->get_system_status_html(),
                ),
                array(
                    'id'           => 'ajax_tool',
                    'name'         => __('Data Importer (AJAX)', 'wp-ayecode-settings-framework'),
                    'icon'           => 'fa-solid fa-upload',
                    'type'           => 'custom_page',
                    'ajax_content' => 'importer_ui',
                ),
            )
        );
    }

    /**
     * Add hooks for tool actions and content panes.
     */
    public function add_tool_hooks() {
        add_action('asf_execute_tool_demo_clear_cache_success', array($this, 'handle_clear_cache'));
        add_action('asf_execute_tool_demo_regen_thumbs_progress', array($this, 'handle_regen_thumbs'));
        add_action('asf_render_content_pane_ayecode_framework_demo_settings_importer_ui', array($this, 'render_importer_ui_html'));
    }

    /**
     * Handle the 'Clear Cache' action button.
     */
    public function handle_clear_cache() {
        sleep(1); // Simulate work
        wp_send_json_success(array(
            'message'  => __('Cache cleared successfully!'),
            'progress' => 100
        ));
    }

    /**
     * Handle the 'Regenerate Thumbnails' action using a stateless, chained-request model.
     */
    public function handle_regen_thumbs() {
        // Get the current step from the AJAX request, defaulting to 0 if not present.
        $current_step = isset($_POST['step']) ? absint($_POST['step']) : 0;

        // Simulate doing work based on the current step.
        $new_progress = $current_step + 15;
        $message = '';
        $next_step = null;

        sleep(2);
        if ($new_progress >= 100) {
            $new_progress = 100;
            // The job is done, so next_step remains null to stop the chain.
            $message = __('Thumbnails regenerated successfully!');
        } else {
            // The job is not done, so set the next_step to the new progress value.
            $next_step = $new_progress;
            $message = sprintf(__('%d%% complete...'), $new_progress);
        }

        // Send the updated status, including the next_step, back to the browser.
        wp_send_json_success(array(
            'message'  => $message,
            'progress' => $new_progress,
            'next_step' => $next_step
        ));
    }

    /**
     * Get the HTML for the pre-loaded System Status tool.
     */
    public function get_system_status_html() {
        global $wp_version;
        $html = '<h4>System Status</h4>';
        $html .= '<p>This content was generated via a PHP function during the initial page load.</p>';
        $html .= '<ul class="list-group">';
        $html .= '<li class="list-group-item d-flex justify-content-between align-items-center">WordPress Version <span class="badge bg-primary rounded-pill">' . esc_html($wp_version) . '</span></li>';
        $html .= '<li class="list-group-item d-flex justify-content-between align-items-center">PHP Version <span class="badge bg-primary rounded-pill">' . esc_html(PHP_VERSION) . '</span></li>';
        $html .= '</ul>';
        return $html;
    }

    /**
     * Render the HTML for the AJAX-loaded Importer tool.
     */
    public function render_importer_ui_html() {
        sleep(1); // Simulate loading delay
        $html = '
            <h4>Import Data from CSV</h4>
            <p>This UI was loaded via an AJAX request when you clicked the tab.</p>
            <form id="my-importer-form" method="post" enctype="multipart/form-data">
                <div class="mb-3"><label for="import_file" class="form-label">CSV File</label><input class="form-control" type="file" id="import_file" name="import_file" accept=".csv"></div>
                <button type="submit" class="btn btn-primary">Upload and Preview</button>
            </form>';
        wp_send_json_success(array('html' => $html));
    }


    /**
     * Plugin activation
     */
    public function activate() {

        // Set default options
        $defaults = array(
            'site_title' => get_bloginfo('name'),
        );

        add_option('ayecode_framework_demo_settings', $defaults);

        // Clear any caches
        if (function_exists('wp_cache_flush')) {
            wp_cache_flush();
        }
    }

    /**
     * Plugin deactivation
     */
    public function deactivate() {

        // Clear any caches
        if (function_exists('wp_cache_flush')) {
            wp_cache_flush();
        }

        // Don't delete settings on deactivation - only on uninstall
    }

    /**
     * Admin notices
     */
    public function admin_notices() {

        // Show notice if framework classes are missing
        if (!class_exists('AyeCode\SettingsFramework\Settings_Framework')) {
            ?>
            <div class="notice notice-error">
                <p>
                    <strong><?php _e('WP AyeCode Settings Framework:', 'wp-ayecode-settings-framework'); ?></strong>
                    <?php _e('Framework classes not found. Please run <code>composer install</code> or ensure all files are uploaded correctly.', 'wp-ayecode-settings-framework'); ?>
                </p>
            </div>
            <?php
        }
    }

    /**
     * Get framework instance (for developers)
     */
    public function get_framework() {
        return $this->framework;
    }

    /**
     * Get plugin version
     */
    public function get_version() {
        return WP_AYECODE_SETTINGS_FRAMEWORK_VERSION;
    }
}

/**
 * Initialize the plugin
 */
function wp_ayecode_settings_framework() {
    return WP_AyeCode_Settings_Framework::instance();
}

// Initialize
wp_ayecode_settings_framework();