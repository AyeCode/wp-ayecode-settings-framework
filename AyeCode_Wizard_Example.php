<?php
/**
 * AyeCode Setup Wizard Example
 *
 * This example demonstrates how to create a multi-step wizard using the
 * AyeCode Settings Framework's Setup_Wizard class.
 *
 * @package AyeCode\SettingsFramework
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AyeCode_Wizard_Example extends \AyeCode\SettingsFramework\Setup_Wizard {

	protected $option_name   = 'ayecode_wizard_demo_settings';
	protected $page_slug     = 'ayecode-setup-wizard';
	protected $plugin_name   = 'GeoDirectory';
	protected $page_title    = 'Setup Wizard';
	protected $menu_title    = 'Setup Wizard';
	protected $menu_icon     = 'dashicons-welcome-learn-more';
	protected $menu_position = 32;

	/**
	 * Define the wizard configuration.
	 * This method specifies all steps, their content, and wizard-level settings.
	 *
	 * @return array Wizard configuration array.
	 */
	protected function get_config() {
		return [
			// Define the steps of the wizard
			'steps' => [
				// Step 1: Membership (uses built-in template)
				[
					'id'          => 'membership',
					'title'       => __( 'Get Pro Membership', 'ayecode-connect' ),
					'description' => __( 'Access all 30+ premium addons', 'ayecode-connect' ),
					'template'    => 'membership', // Use built-in membership template
					'features'    => [
						__( '✓ Advanced Search & Filters', 'ayecode-connect' ),
						__( '✓ Location Manager (multi-city)', 'ayecode-connect' ),
						__( '✓ Pricing Manager (monetization)', 'ayecode-connect' ),
						__( '✓ Claim Listings', 'ayecode-connect' ),
						__( '✓ Events Calendar', 'ayecode-connect' ),
						__( '✓ Custom Fields', 'ayecode-connect' ),
						__( '✓ Payment Gateway Integration', 'ayecode-connect' ),
						__( '✓ Reviews & Ratings', 'ayecode-connect' ),
						__( '✓ Multi-directory types', 'ayecode-connect' ),
						__( '✓ And 21+ more addons...', 'ayecode-connect' ),
					],
					'pricing_options' => [
						[
							'value'    => '4month',
							'duration' => __( '4 months', 'ayecode-connect' ),
							'savings'  => __( 'Save 10%', 'ayecode-connect' ),
						],
						[
							'value'    => '6month',
							'duration' => __( '6 months', 'ayecode-connect' ),
							'savings'  => __( 'Save 20%', 'ayecode-connect' ),
						],
						[
							'value'       => '12month',
							'duration'    => __( '12 months', 'ayecode-connect' ),
							'savings'     => __( 'Save 35%', 'ayecode-connect' ),
							'recommended' => true,
						],
					],
				],

				// Step 2: Directory Type (field-based step)
				[
					'id'          => 'type',
					'title'       => __( 'Choose Your Directory Type', 'ayecode-connect' ),
					'description' => __( 'What type of directory are you building?', 'ayecode-connect' ),
					'icon'        => '📁',
					'fields'      => [
						[
							'id'      => 'directory_type',
							'type'    => 'checkbox_group',
							'label'   => __( 'Directory Type', 'ayecode-connect' ),
							'options' => [
								'events'      => __( '🎭 Events - Concerts, festivals, activities', 'ayecode-connect' ),
								'realestate'  => __( '🏠 Real Estate - Properties & listings', 'ayecode-connect' ),
								'automotive'  => __( '🚗 Automotive - Cars, dealers, services', 'ayecode-connect' ),
								'healthcare'  => __( '🏥 Healthcare - Doctors & medical services', 'ayecode-connect' ),
								'restaurants' => __( '🍽️ Restaurants - Food & dining', 'ayecode-connect' ),
								'general'     => __( '📂 General - Multi-purpose directory', 'ayecode-connect' ),
							],
							'default' => [ 'general' ],
						],
						[
							'id'          => 'add_sample_data',
							'type'        => 'toggle',
							'label'       => __( 'Add sample listings', 'ayecode-connect' ),
							'description' => __( 'Get started quickly with example content', 'ayecode-connect' ),
							'default'     => true,
						],
					],
				],

				// Step 3: Location Setup (field-based step)
				[
					'id'          => 'location',
					'title'       => __( 'Set Your Default Location', 'ayecode-connect' ),
					'description' => __( 'Configure where your directory listings will be located.', 'ayecode-connect' ),
					'icon'        => '📍',
					'fields'      => [
						[
							'id'          => 'default_location',
							'type'        => 'text',
							'label'       => __( 'Default City/Town', 'ayecode-connect' ),
							'placeholder' => __( 'e.g., Austin, Texas', 'ayecode-connect' ),
							'description' => __( 'This will be the primary location for your directory', 'ayecode-connect' ),
							'default'     => '',
						],
						[
							'id'      => 'location_restriction',
							'type'    => 'radio',
							'label'   => __( 'Location Options', 'ayecode-connect' ),
							'options' => [
								'restricted' => __( 'Restrict to this location only', 'ayecode-connect' ),
								'anywhere'   => __( 'Allow listings from anywhere', 'ayecode-connect' ),
							],
							'default' => 'restricted',
						],
					],
				],

				// Step 4: Theme Selection (field-based step)
				[
					'id'          => 'theme',
					'title'       => __( 'Choose Your Theme', 'ayecode-connect' ),
					'description' => __( 'Select a theme optimized for your directory.', 'ayecode-connect' ),
					'icon'        => '🎨',
					'fields'      => [
						[
							'id'      => 'selected_theme',
							'type'    => 'radio',
							'label'   => __( 'Theme Selection', 'ayecode-connect' ),
							'options' => [
								'recommended' => __( 'Recommended Theme - Fully optimized with built-in features', 'ayecode-connect' ),
								'general'     => __( 'General Directory Theme - Multi-purpose directory layout', 'ayecode-connect' ),
								'current'     => __( 'Use My Current Theme - Keep your existing theme active', 'ayecode-connect' ),
							],
							'default' => 'recommended',
						],
					],
				],

				// Step 5: Complete (uses built-in template)
				[
					'id'          => 'complete',
					'title'       => __( 'Setup Complete!', 'ayecode-connect' ),
					'description' => __( 'Your directory is ready to go!', 'ayecode-connect' ),
					'template'    => 'complete', // Use built-in complete template
					'summary_items' => [
						__( 'Directory configured', 'ayecode-connect' ),
						__( 'Theme installed', 'ayecode-connect' ),
						__( 'Sample listings added', 'ayecode-connect' ),
					],
					'upsell_features' => [
						__( 'Advanced search filters', 'ayecode-connect' ),
						__( 'Multi-location support', 'ayecode-connect' ),
						__( 'Monetization features', 'ayecode-connect' ),
						__( 'And 26+ more addons', 'ayecode-connect' ),
					],
				],
			],

			// Wizard-level configuration
			'wizard_config' => [
				'product_name'   => 'DirectoryPro',
				'checkout_url'   => 'https://wpgeodirectory.com/downloads/membership/',
				'dashboard_url'  => admin_url(),
				'view_all_url'   => 'https://wpgeodirectory.com/downloads/',
			],
		];
	}

	/**
	 * Optionally override wizard strings for custom translations.
	 *
	 * @return array Custom wizard strings merged with defaults.
	 */
	protected function get_wizard_strings() {
		return array_merge(
			parent::get_wizard_strings(),
			[
				// Add any custom strings here
				'custom_message' => __( 'Welcome to the setup wizard!', 'ayecode-connect' ),
			]
		);
	}
}

// Initialize the example wizard
// Note: This would typically be done in your main plugin file
// new AyeCode_Wizard_Example();
