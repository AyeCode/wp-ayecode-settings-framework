<?php
/**
 * Plugin Name: WP AyeCode Settings Framework
 * Plugin URI: https://github.com/AyeCode/wp-ayecode-settings-framework
 * Description: Modern WordPress settings framework with Alpine.js and Bootstrap 5. This plugin provides a demo and testing interface for the framework.
 * Version: 1.0.0
 * Author: AyeCode Ltd
 * Author URI: https://ayecode.io
 * License: GPL v3 or later
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain: wp-ayecode-settings-framework
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
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
define('WP_AYECODE_SETTINGS_FRAMEWORK_VERSION', '1.0.0');
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

        // Demo configuration
        $config = $this->get_demo_config();

        // Initialize the framework
        $this->framework = new AyeCode\SettingsFramework\Settings_Framework(
            $config,
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



        // testing
//        $settings =  GeoDir_Admin_Settings::get_settings_new();
//        return  $settings;


        return array(
            'sections' => array(

                // General Settings Section with Subsections
                array(
                    'id' => 'general',
                    'name' => __('General Settings', 'wp-ayecode-settings-framework'),
                    'icon' => 'fa-solid fa-gear',
                    'description' => __('Basic plugin configuration and behavior', 'wp-ayecode-settings-framework'),
                    'searchableFields' => array('site settings', 'basic options', 'general configuration'),
                    'subsections' => array(
                        array(
                            'id' => 'basic',
                            'name' => __('Basic Settings', 'wp-ayecode-settings-framework'),
                            'icon' => 'fa-solid fa-sliders',
                            'description' => __('Core plugin configuration', 'wp-ayecode-settings-framework'),
                            'fields' => array(
                                array(
                                    'id' => 'site_title',
                                    'type' => 'text',
                                    'label' => __('Site Title', 'wp-ayecode-settings-framework'),
                                    'description' => __('Enter your site title', 'wp-ayecode-settings-framework'),
                                    'default' => get_bloginfo('name'),
                                    'searchable' => array('title', 'site name', 'heading')
                                ),
                                array(
                                    'id' => 'site_description',
                                    'type' => 'textarea',
                                    'label' => __('Site Description', 'wp-ayecode-settings-framework'),
                                    'description' => __('Brief description of your site', 'wp-ayecode-settings-framework'),
                                    'default' => get_bloginfo('description'),
                                    'rows' => 3,
                                    'searchable' => array('description', 'tagline', 'summary')
                                ),
                                // ✨ --- ADDED IMAGE FIELD 1 --- ✨
                                array(
                                    'id'          => 'site_logo',
                                    'type'        => 'image',
                                    'label'       => __('Site Logo', 'wp-ayecode-settings-framework'),
                                    'description' => __('Upload or select a logo from the media library.', 'wp-ayecode-settings-framework'),
                                    'default'     => '',
                                ),
                                array(
                                    'id' => 'enable_features',
                                    'type' => 'toggle',
                                    'label' => __('Enable Advanced Features', 'wp-ayecode-settings-framework'),
                                    'description' => __('Turn on advanced functionality', 'wp-ayecode-settings-framework'),
                                    'default' => true,
                                    'searchable' => array('features', 'advanced', 'enable', 'functionality')
                                )
                            )
                        ),
                        array(
                            'id' => 'display',
                            'name' => __('Display Options', 'wp-ayecode-settings-framework'),
                            'icon' => 'fa-solid fa-eye',
                            'description' => __('Control how content is displayed', 'wp-ayecode-settings-framework'),
                            'fields' => array(
                                array(
                                    'id' => 'items_per_page',
                                    'type' => 'number',
                                    'label' => __('Items Per Page', 'wp-ayecode-settings-framework'),
                                    'description' => __('Number of items to show per page', 'wp-ayecode-settings-framework'),
                                    'default' => 10,
                                    'min' => 1,
                                    'max' => 100,
                                    'searchable' => array('pagination', 'items', 'per page', 'limit')
                                ),
                                array(
                                    'id' => 'show_thumbnails',
                                    'type' => 'toggle',
                                    'label' => __('Show Thumbnails', 'wp-ayecode-settings-framework'),
                                    'description' => __('Display thumbnail images', 'wp-ayecode-settings-framework'),
                                    'default' => true,
                                    'searchable' => array('thumbnails', 'images', 'preview')
                                )
                            )
                        )
                    )
                ),

                // Design Settings Section
                array(
                    'id' => 'design',
                    'name' => __('Design & Styling', 'wp-ayecode-settings-framework'),
                    'icon' => 'fa-solid fa-paintbrush',
                    'description' => __('Customize the appearance and styling', 'wp-ayecode-settings-framework'),
                    'searchableFields' => array('design', 'styling', 'appearance', 'colors', 'theme'),
                    'fields' => array(
                        array(
                            'id' => 'theme_style',
                            'type' => 'select',
                            'label' => __('Theme Style', 'wp-ayecode-settings-framework'),
                            'description' => __('Choose your preferred theme style', 'wp-ayecode-settings-framework'),
                            'options' => array(
                                'default' => __('Default', 'wp-ayecode-settings-framework'),
                                'modern' => __('Modern', 'wp-ayecode-settings-framework'),
                                'classic' => __('Classic', 'wp-ayecode-settings-framework'),
                                'minimal' => __('Minimal', 'wp-ayecode-settings-framework')
                            ),
                            'default' => 'default',
                            'searchable' => array('theme', 'style', 'template', 'design')
                        ),
                        // ✨ --- ADDED IMAGE FIELD 2 --- ✨
                        array(
                            'id'          => 'default_banner_image',
                            'type'        => 'image',
                            'label'       => __('Default Banner Image', 'wp-ayecode-settings-framework'),
                            'description' => __('Set a default banner for pages and posts.', 'wp-ayecode-settings-framework'),
                            'default'     => '',
                        ),
                        array(
                            'id' => 'primary_color',
                            'type' => 'color',
                            'label' => __('Primary Color', 'wp-ayecode-settings-framework'),
                            'description' => __('Main brand color for your site', 'wp-ayecode-settings-framework'),
                            'default' => '#0073aa',
                            'searchable' => array('color', 'brand', 'primary', 'theme color')
                        ),
                        array(
                            'id' => 'secondary_color',
                            'type' => 'color',
                            'label' => __('Secondary Color', 'wp-ayecode-settings-framework'),
                            'description' => __('Secondary accent color', 'wp-ayecode-settings-framework'),
                            'default' => '#666666',
                            'searchable' => array('secondary', 'accent', 'color')
                        ),
                        array(
                            'id' => 'font_size',
                            'type' => 'range',
                            'label' => __('Base Font Size', 'wp-ayecode-settings-framework'),
                            'description' => __('Base font size in pixels', 'wp-ayecode-settings-framework'),
                            'default' => 16,
                            'min' => 12,
                            'max' => 24,
                            'step' => 1,
                            'searchable' => array('font', 'text', 'size', 'typography')
                        )
                    )
                ),

                // Email Settings Section - MODIFIED WITH GROUPS
                array(
                    'id' => 'email',
                    'name' => __('Email Notifications', 'wp-ayecode-settings-framework'),
                    'icon' => 'fa-solid fa-envelope',
                    'description' => __('Configure email notifications and templates', 'wp-ayecode-settings-framework'),
                    'searchableFields' => array('email', 'notifications', 'mail', 'messages'),
                    'fields' => array(
                        // Group 1: Notification Settings
                        array(
                            'type'        => 'group',
                            'label'       => __('Notification Settings', 'wp-ayecode-settings-framework'),
                            'description' => __('Configure who receives notifications and for what events.', 'wp-ayecode-settings-framework'),
                            'fields'      => array(
                                array(
                                    'id' => 'admin_email',
                                    'type' => 'email',
                                    'label' => __('Admin Email', 'wp-ayecode-settings-framework'),
                                    'description' => __('The primary contact for all admin-facing notifications.', 'wp-ayecode-settings-framework'),
                                    'default' => get_option('admin_email'),
                                    'required' => true,
                                    'searchable' => array('admin', 'email', 'notifications', 'contact')
                                ),
                                array(
                                    'id' => 'notification_types',
                                    'type' => 'checkbox_group',
                                    'label' => __('Enabled Notifications', 'wp-ayecode-settings-framework'),
                                    'description' => __('Select which system notifications to send.', 'wp-ayecode-settings-framework'),
                                    'options' => array(
                                        'new_user' => __('New user registrations', 'wp-ayecode-settings-framework'),
                                        'new_post' => __('New post submissions', 'wp-ayecode-settings-framework'),
                                        'new_comment' => __('New comments', 'wp-ayecode-settings-framework'),
                                        'system_updates' => __('System updates', 'wp-ayecode-settings-framework')
                                    ),
                                    'default' => array('new_user', 'system_updates'),
                                    'searchable' => array('notifications', 'email types', 'alerts')
                                ),
                            ),
                        ),
                        // Group 2: Delivery Schedule
                        array(
                            'type'        => 'group',
                            'label'       => __('Delivery Schedule', 'wp-ayecode-settings-framework'),
                            'description' => __('Set the timing for email delivery.', 'wp-ayecode-settings-framework'),
                            'fields'      => array(
                                array(
                                    'id' => 'email_frequency',
                                    'type' => 'radio',
                                    'label' => __('Email Frequency', 'wp-ayecode-settings-framework'),
                                    'description' => __('Choose how often to send summary or digest emails.', 'wp-ayecode-settings-framework'),
                                    'options' => array(
                                        'immediate' => __('Immediate', 'wp-ayecode-settings-framework'),
                                        'daily' => __('Daily digest', 'wp-ayecode-settings-framework'),
                                        'weekly' => __('Weekly digest', 'wp-ayecode-settings-framework')
                                    ),
                                    'default' => 'immediate',
                                    'searchable' => array('frequency', 'timing', 'schedule', 'digest')
                                )
                            )
                        )
                    )
                ),

                // API Settings Section
                array(
                    'id' => 'api',
                    'name' => __('API & Integrations', 'wp-ayecode-settings-framework'),
                    'icon' => 'fa-solid fa-plug',
                    'description' => __('Configure API keys and third-party integrations', 'wp-ayecode-settings-framework'),
                    'searchableFields' => array('api', 'integrations', 'keys', 'external services'),
                    'fields' => array(
                        array(
                            'id' => 'Maps_api_key',
                            'type' => 'password',
                            'label' => __('Google Maps API Key', 'wp-ayecode-settings-framework'),
                            'description' => __('API key for Google Maps integration', 'wp-ayecode-settings-framework'),
                            'searchable' => array('google', 'maps', 'api', 'key', 'location')
                        ),
                        array(
                            'id' => 'enable_rest_api',
                            'type' => 'toggle',
                            'label' => __('Enable REST API', 'wp-ayecode-settings-framework'),
                            'description' => __('Allow external access via REST API', 'wp-ayecode-settings-framework'),
                            'default' => false,
                            'searchable' => array('rest', 'api', 'external', 'access')
                        ),
                        array(
                            'id' => 'api_rate_limit',
                            'type' => 'number',
                            'label' => __('API Rate Limit', 'wp-ayecode-settings-framework'),
                            'description' => __('Maximum API requests per hour', 'wp-ayecode-settings-framework'),
                            'default' => 1000,
                            'min' => 100,
                            'max' => 10000,
                            'searchable' => array('rate limit', 'throttle', 'requests', 'hour')
                        )
                    )
                ),

                // Advanced Settings Section
                array(
                    'id' => 'advanced',
                    'name' => __('Advanced Settings', 'wp-ayecode-settings-framework'),
                    'icon' => 'fa-solid fa-screwdriver-wrench',
                    'description' => __('Advanced configuration for power users', 'wp-ayecode-settings-framework'),
                    'searchableFields' => array('advanced', 'debug', 'development', 'cache', 'performance'),
                    'fields' => array(
                        array(
                            'id' => 'debug_mode',
                            'type' => 'toggle',
                            'label' => __('Debug Mode', 'wp-ayecode-settings-framework'),
                            'description' => __('Enable debug logging and error reporting', 'wp-ayecode-settings-framework'),
                            'default' => false,
                            'searchable' => array('debug', 'logging', 'errors', 'development')
                        ),
                        array(
                            'id' => 'cache_duration',
                            'type' => 'select',
                            'label' => __('Cache Duration', 'wp-ayecode-settings-framework'),
                            'description' => __('How long to cache data', 'wp-ayecode-settings-framework'),
                            'options' => array(
                                '0' => __('No caching', 'wp-ayecode-settings-framework'),
                                '3600' => __('1 hour', 'wp-ayecode-settings-framework'),
                                '21600' => __('6 hours', 'wp-ayecode-settings-framework'),
                                '86400' => __('24 hours', 'wp-ayecode-settings-framework'),
                                '604800' => __('1 week', 'wp-ayecode-settings-framework')
                            ),
                            'default' => '21600',
                            'searchable' => array('cache', 'performance', 'speed', 'duration')
                        ),
                        array(
                            'id' => 'custom_css',
                            'type' => 'textarea',
                            'label' => __('Custom CSS', 'wp-ayecode-settings-framework'),
                            'description' => __('Add custom CSS styles', 'wp-ayecode-settings-framework'),
                            'rows' => 10,
                            'searchable' => array('css', 'styles', 'custom', 'design')
                        )
                    )
                )
            )
        );
    }

    /**
     * Plugin activation
     */
    public function activate() {

        // Set default options
        $defaults = array(
            'site_title' => get_bloginfo('name'),
            'site_description' => get_bloginfo('description'),
            'enable_features' => true,
            'items_per_page' => 10,
            'show_thumbnails' => true,
            'theme_style' => 'default',
            'primary_color' => '#0073aa',
            'secondary_color' => '#666666',
            'font_size' => 16,
            'admin_email' => get_option('admin_email'),
            'notification_types' => array('new_user', 'system_updates'),
            'email_frequency' => 'immediate',
            'enable_rest_api' => false,
            'api_rate_limit' => 1000,
            'debug_mode' => false,
            'cache_duration' => '21600',
            // ✨ --- ADDED DEFAULTS FOR IMAGE FIELDS --- ✨
            'site_logo' => '',
            'default_banner_image' => '',
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