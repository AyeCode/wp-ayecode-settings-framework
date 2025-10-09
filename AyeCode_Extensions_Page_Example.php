<?php
/**
 * AyeCode Extensions Page Example
 *
 * @package AyeCode\SettingsFramework
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AyeCode_Extensions_Page_Example extends \AyeCode\SettingsFramework\Settings_Framework {

	protected $option_name   = 'ayecode_extensions_page_settings';
	protected $page_slug     = 'ayecode-extensions';
	protected $plugin_name   = 'My Awesome Plugin';
	protected $menu_title    = 'Extensions';
	protected $page_title    = 'Extensions';
	protected $menu_icon     = 'dashicons-star-filled';
	protected $menu_position = 31;

	public function __construct() {
		parent::__construct();
		add_action( 'asf_execute_tool_' . $this->page_slug, [ $this, 'handle_custom_ajax_actions' ], 10, 2 );
	}

	private function is_localhost() {
		$host = ! empty( $_SERVER['HTTP_HOST'] ) ? $_SERVER['HTTP_HOST'] : 'localhost';
		$local_domains = [ '.localhost', '.test', 'localhost' ];
		foreach ( $local_domains as $domain ) {
			if ( substr( $host, -strlen( $domain ) ) === $domain ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Overrides the parent method to provide the specific logic for checking
	 * if a plugin is active or installed for this particular project.
	 */
	public function get_product_status( $product ) {
		$slug = isset( $product->info->slug ) ? $product->info->slug : '';
		if ( empty( $slug ) ) {
			return 'not_purchased';
		}

		// Construct the main plugin file path (e.g., 'my-plugin/my-plugin.php')
		$main_file = $slug . '/' . $slug . '.php';

		if ( function_exists('is_plugin_active') && is_plugin_active( $main_file ) ) {
			return 'active';
		}
		if ( file_exists( WP_PLUGIN_DIR . '/' . $main_file ) ) {
			return 'installed_not_active';
		}
		return 'not_purchased';
	}


	public function get_config() {
		$is_connected = function_exists('ayecode_connect_is_site_connected') && ayecode_connect_is_site_connected();
		return [
			'sections' => [
				[
					'id'    => 'addons',
					'name'  => 'Addons',
					'icon'  => 'fa-solid fa-puzzle-piece',
					'type'  => 'extension_list_page',
					'api_config' => [ 'category' => 'addons' ],
				],
				[
					'id'    => 'themes',
					'name'  => 'Themes',
					'icon'  => 'fa-solid fa-palette',
					'type'  => 'extension_list_page',
					'api_config' => [ 'category' => 'themes' ],
				],
				[
					'id'    => 'recommended',
					'name'  => 'Recommended',
					'icon'  => 'fa-solid fa-thumbs-up',
					'type'  => 'extension_list_page',
					'api_config' => [ 'category' => 'recommended_plugins' ],
				],
				[
					'id' => 'membership',
					'name' => 'Membership',
					'icon' => 'fa-solid fa-id-card',
					'type' => 'action_page',
					'button_text' => 'Save & Activate Key',
					'ajax_action' => 'save_membership_key',
					'fields' => [
						[
							'id'      => 'membership_key',
							'type'    => 'text',
							'label'   => __( 'Membership Key', 'ayecode-settings-framework' ),
							'description'    => __( 'Enter your membership key to enable one-click installations on local sites.', 'ayecode-settings-framework' ),
						]
					]
				]
			],
			'page_config' => [
				'api_url' => 'https://wpgeodirectory.com/edd-api/v2/products/',
				'connect_banner' => [
					'is_connected'   => $is_connected,
					'is_localhost'   => $this->is_localhost(),
					'connect_url'    => '#',
					'learn_more_url' => 'https://wpgeodirectory.com/docs-v2/addons/ayecode-connect/',
				],
			]
		];
	}

	public function handle_custom_ajax_actions( $tool_action, $post_data ) {
		if ( $tool_action === 'save_membership_key' ) {
			// Your logic for saving the key goes here
			sleep(1);
			wp_send_json_success( [ 'message' => 'Membership key saved!' ] );
		}
	}
}