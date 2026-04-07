<?php
/**
 * Simple Example - WP AyeCode Settings Framework
 *
 * This is a basic example showing how to create a simple settings page
 * with common field types, without API keys, extensions, wizards, or dashboard features.
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Load the framework's abstract class.
require_once __DIR__ . '/src/Settings_Framework.php';

/**
 * Simple Settings Page Example
 *
 * This class extends the Settings_Framework and provides a basic configuration
 * with common field types and simple tools.
 */
class Simple_Settings_Example extends \AyeCode\SettingsFramework\Settings_Framework {

	// Basic configuration properties
	protected $option_name   = 'simple_example_settings';
	protected $page_slug     = 'simple-example';
	protected $plugin_name   = 'Simple Settings Example';
	protected $menu_title    = 'Simple Example';
	protected $page_title    = 'Simple Settings Example';
	protected $menu_icon     = 'dashicons-admin-settings';
	protected $menu_position = 30;

	/**
	 * Constructor - set up action hooks if needed
	 */
	public function __construct() {
		parent::__construct(); // Always call parent constructor!

		// Hook for handling tool actions
		add_action( 'asf_execute_tool_' . $this->page_slug, [ $this, 'handle_tool_action' ], 10, 2 );
	}

	/**
	 * Get the settings configuration
	 *
	 * @return array Configuration array with sections and fields
	 */
	public function get_config() {
		return [
			'sections' => [
				// General Settings Section
				[
					'id'    => 'general',
					'name'  => __( 'General Settings', 'simple-example' ),
					'icon'  => 'fa-solid fa-gear',
					'fields' => [
						[
							'id'      => 'site_name',
							'type'    => 'text',
							'label'   => __( 'Site Name', 'simple-example' ),
							'desc'    => __( 'Enter your site name.', 'simple-example' ),
							'default' => get_bloginfo( 'name' ),
						],
						[
							'id'      => 'site_description',
							'type'    => 'textarea',
							'label'   => __( 'Site Description', 'simple-example' ),
							'desc'    => __( 'Brief description of your site.', 'simple-example' ),
							'rows'    => 3,
						],
						[
							'id'      => 'enable_feature',
							'type'    => 'toggle',
							'label'   => __( 'Enable Feature', 'simple-example' ),
							'desc'    => __( 'Toggle to enable or disable this feature.', 'simple-example' ),
							'default' => true,
						],
					],
				],

				// Appearance Section
				[
					'id'    => 'appearance',
					'name'  => __( 'Appearance', 'simple-example' ),
					'icon'  => 'fa-solid fa-palette',
					'fields' => [
						[
							'id'      => 'primary_color',
							'type'    => 'color',
							'label'   => __( 'Primary Color', 'simple-example' ),
							'desc'    => __( 'Choose your primary brand color.', 'simple-example' ),
							'default' => '#0073aa',
						],
						[
							'id'      => 'layout_style',
							'type'    => 'select',
							'label'   => __( 'Layout Style', 'simple-example' ),
							'desc'    => __( 'Select your preferred layout style.', 'simple-example' ),
							'options' => [
								'wide'   => __( 'Wide', 'simple-example' ),
								'boxed'  => __( 'Boxed', 'simple-example' ),
								'fluid'  => __( 'Fluid', 'simple-example' ),
							],
							'default' => 'wide',
						],
						[
							'id'      => 'show_elements',
							'type'    => 'checkbox_group',
							'label'   => __( 'Show Elements', 'simple-example' ),
							'desc'    => __( 'Select which elements to display.', 'simple-example' ),
							'options' => [
								'header'  => __( 'Header', 'simple-example' ),
								'footer'  => __( 'Footer', 'simple-example' ),
								'sidebar' => __( 'Sidebar', 'simple-example' ),
							],
							'default' => [ 'header', 'footer' ],
						],
					],
				],

				// Tools Section
				[
					'id'    => 'tools',
					'name'  => __( 'Tools', 'simple-example' ),
					'icon'  => 'fa-solid fa-wrench',
					'fields' => [
						[
							'id'           => 'clear_cache',
							'type'         => 'action_button',
							'label'        => __( 'Clear Cache', 'simple-example' ),
							'description'  => __( 'Click to clear all cached data.', 'simple-example' ),
							'button_text'  => __( 'Clear Cache', 'simple-example' ),
							'button_class' => 'btn-primary',
							'ajax_action'  => 'simple_clear_cache',
						],
					],
				],
			],
		];
	}

	/**
	 * Handle tool actions
	 *
	 * @param string $tool_action The action name from ajax_action
	 * @param array  $post_data   The POST data from the request
	 */
	public function handle_tool_action( $tool_action, $post_data ) {
		switch ( $tool_action ) {
			case 'simple_clear_cache':
				// Simulate cache clearing
				sleep( 1 );

				// In a real plugin, you would clear actual cache here
				// wp_cache_flush();
				// delete_transient( 'my_transient' );

				wp_send_json_success( [
					'message'  => __( 'Cache cleared successfully!', 'simple-example' ),
					'progress' => 100,
				] );
				break;
		}
	}
}

// Initialize the settings page
add_action( 'plugins_loaded', function() {
	if ( is_admin() ) {
		new Simple_Settings_Example();
	}
} );
