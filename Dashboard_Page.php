<?php
/**
 * Adds a Dashboard submenu page to the main plugin menu.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class WP_AyeCode_Framework_Demo_Dashboard_Page extends \AyeCode\SettingsFramework\Settings_Framework {

	// Define the properties to configure the admin page.
	protected $option_name   = 'ayecode_framework_dashboard_demo_settings';
	protected $page_slug     = 'ayecode-framework-dashboard-demo';
	protected $plugin_name   = 'ASF Dashboard Demo';
	protected $menu_title    = 'Dashboard Demo';
	protected $page_title    = 'Settings Framework Demo';
	protected $menu_icon     = 'dashicons-admin-generic';
	protected $menu_position = 30;

	// This property makes the dashboard a submenu item of the main settings page.
	protected $parent_slug   = 'ayecode-framework-demo';

	/**
	 * Provides the configuration for the dashboard page.
	 * The AJAX actions listed here are handled automatically by the parent framework.
	 */
	public function get_config() {
		return [
			'sections' => [
				[
					'id'      => 'dashboard',
					'name'    => 'Dashboard',
					'type'    => 'dashboard',
					'widgets' => [
						[
							'id'      => 'welcome_widget',
							'type'    => 'custom_html',
							'width'   => 'full',
							'title'   => __( 'Welcome!', 'ayecode-connect' ),
							'content' => '<p>' . __( 'These widgets are powered by the core framework. This class only needs to declare them in the configuration.', 'ayecode-connect' ) . '</p>',
						],
						[
							'id'          => 'stats_widget',
							'type'        => 'stats',
							'width'       => 'half',
							'title'       => __( 'Site Statistics', 'ayecode-connect' ),
							'ajax_action' => 'get_dashboard_stats',
							'params'      => [ 'show' => ['users', 'posts'] ],
						],
						[
							'id'          => 'system_status_widget',
							'type'        => 'system_status',
							'width'       => 'half',
							'title'       => __( 'System Status', 'ayecode-connect' ),
							'ajax_action' => 'get_system_status',
							'params'      => [ 'php_version' => '7.4' ],
						],
						[
							'id'          => 'news_feed_widget',
							'type'        => 'rss_feed',
							'width'       => 'half',
							'title'       => __( 'Latest News from GeoDirectory', 'ayecode-connect' ),
							'ajax_action' => 'get_plugin_news',
							'feed_url'    => 'https://wpgeodirectory.com/feed/',
						],
						[
							'id'      => 'quick_links_widget',
							'type'    => 'quick_links',
							'width'   => 'half',
							'title'   => __( 'Quick Links', 'ayecode-connect' ),
							'links'   => [
								[
									'label'   => __( 'Go to General Settings', 'ayecode-connect' ),
									'icon'    => 'fa-solid fa-sliders',
									'section' => 'general',
								],
								[
									'label'   => __( 'Manage API Keys', 'ayecode-connect' ),
									'icon'    => 'fa-solid fa-key',
									'section' => 'api_keys',
								],
								[
									'label'    => __( 'Read the Documentation', 'ayecode-connect' ),
									'icon'     => 'fa-solid fa-book',
									'url'      => 'https://github.com/AyeCode/wp-ayecode-settings-framework',
									'external' => true,
								],
							],
						],
						[
							'id'      => 'promo_widget',
							'type'    => 'custom_html',
							'width'   => 'full',
							'title'   => __( 'Go Pro!', 'ayecode-connect' ),
							'content' => '
                                <div class="text-center p-3">
                                    <h5 class="h6">Unlock More Powerful Features</h5>
                                    <p class="text-muted small">Upgrade to our Pro version to get access to advanced features, premium support, and more!</p>
                                    <a href="#" class="btn btn-sm btn-success">Learn More About Pro</a>
                                </div>
                            ',
						],
					],
				],
			],
		];
	}
}