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
					'source' => 'static', // Flag this section as having a static list
					'static_items' => [
						[
							'info'   => [
								'slug'            => 'ayecode-connect',
								'source'          => 'wp.org',
								'link'            => 'https://wordpress.org/plugins/ayecode-connect/',
								'title'           => 'AyeCode Connect',
								'excerpt'         => 'AyeCode Connect is a service plugin, allowing us to provide extra services to your site such as live documentation search and submission of support tickets.',
								'thumbnail'       => 'https://ps.w.org/ayecode-connect/assets/icon-256x256.png',
								'price'           => 0,
								'is_new'          => false,
								'is_subscription' => false,
							],
						],
						[
							'info'   => [
								'slug'            => 'userswp',
								'source'          => 'wp.org',
								'link'            => 'https://wordpress.org/plugins/userswp/',
								'title'           => 'UsersWP',
								'excerpt'         => 'Front-end login form, User Registration, User Profile & Members Directory plugin for WP.',
								'thumbnail'       => 'https://ps.w.org/userswp/assets/icon-256x256.png',
								'price'           => 0,
								'is_new'          => false,
								'is_subscription' => false,
							],
						],
						[
							'info'   => [
								'slug'            => 'invoicing',
								'source'          => 'wp.org',
								'link'            => 'https://wordpress.org/plugins/invoicing/',
								'title'           => 'GetPaid',
								'excerpt'         => 'Payment forms, Buy now buttons, and Invoicing System | GetPaid',
								'thumbnail'       => 'https://ps.w.org/invoicing/assets/icon-256x256.png',
								'price'           => 0,
								'is_new'          => false,
								'is_subscription' => false,
							],
						],

					]
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