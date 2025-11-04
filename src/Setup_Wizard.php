<?php
/**
 * Setup Wizard Abstract Class
 *
 * This abstract class extends the Settings Framework to provide a full-page,
 * multi-step wizard experience. It leverages the framework's existing infrastructure
 * while providing a distinct UI optimized for guided setup flows.
 *
 * @package AyeCode\SettingsFramework
 */

namespace AyeCode\SettingsFramework;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Setup_Wizard extends Settings_Framework {

	/**
	 * Override parent to register wizard page.
	 * Wizards typically don't need parent_slug as they're standalone experiences.
	 */
	public function add_admin_menu() {
		$render_callback = [ $this, 'render_wizard_page' ];

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
	 * Renders the wizard page using a dedicated full-page layout.
	 * This replaces the standard admin page rendering.
	 */
	public function render_wizard_page() {
		if ( ! current_user_can( $this->capability ) ) {
			wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'ayecode-connect' ) );
		}

		$templates_dir = dirname( __FILE__ ) . '/templates/wizard/';
		include $templates_dir . 'layout.php';
	}

	/**
	 * Processes the wizard configuration for JavaScript consumption.
	 * Adds connection status and other runtime data.
	 *
	 * @return array The processed wizard configuration.
	 */
	public function get_wizard_config_for_js() {
		$config = $this->get_config_raw();

		// Add connection and membership status - ensure boolean values
		$config['is_connected']    = (bool) $this->is_connected();
		$config['is_member_active'] = (bool) $this->is_member_active();
		$config['is_localhost']     = (bool) $this->is_localhost();

		// Add wizard-specific metadata
		if ( ! isset( $config['wizard_config'] ) ) {
			$config['wizard_config'] = [];
		}

		// Ensure product_name is set (fallback to plugin_name)
		if ( ! isset( $config['wizard_config']['product_name'] ) ) {
			$config['wizard_config']['product_name'] = $this->plugin_name;
		}

		// Add default URLs if not set
		if ( ! isset( $config['wizard_config']['dashboard_url'] ) ) {
			$config['wizard_config']['dashboard_url'] = admin_url();
		}

		// Filter steps based on user membership status
		if ( isset( $config['steps'] ) && is_array( $config['steps'] ) ) {
			$config['steps'] = $this->filter_steps_by_membership( $config['steps'], $config['is_connected'], $config['is_member_active'] );
		}

		return $config;
	}

	/**
	 * Filters wizard steps based on membership status.
	 * Removes steps that should only be shown to paid or free users.
	 * Skips membership step entirely if user is connected AND has active membership.
	 *
	 * @param array $steps           The wizard steps configuration.
	 * @param bool  $is_connected    Whether the site is connected via AyeCode Connect.
	 * @param bool  $is_member_active Whether the user has an active paid membership.
	 * @return array Filtered steps array.
	 */
	protected function filter_steps_by_membership( $steps, $is_connected, $is_member_active ) {
		return array_values( array_filter( $steps, function( $step ) use ( $is_connected, $is_member_active ) {
			// Skip membership step if user is connected AND has active membership
			if ( ! empty( $step['template'] ) && 'membership' === $step['template'] && $is_connected && $is_member_active ) {
				return false;
			}

			// Show step only to paid users (connected + active membership)
			if ( ! empty( $step['show_if_paid'] ) && ! ( $is_connected && $is_member_active ) ) {
				return false;
			}

			// Show step only to free users (not connected OR no active membership)
			if ( ! empty( $step['show_if_free'] ) && ( $is_connected && $is_member_active ) ) {
				return false;
			}

			return true;
		} ) );
	}

	/**
	 * Returns wizard-specific translatable strings.
	 * Child classes can override this and merge with parent::get_wizard_strings().
	 *
	 * @return array Translatable strings for the wizard.
	 */
	protected function get_wizard_strings() {
		return [
			// Navigation
			'back'             => __( 'Back', 'ayecode-connect' ),
			'continue'         => __( 'Continue', 'ayecode-connect' ),
			'skip'             => __( 'Skip', 'ayecode-connect' ),
			'complete_setup'   => __( 'Complete Setup', 'ayecode-connect' ),
			'go_to_dashboard'  => __( 'Go to Dashboard', 'ayecode-connect' ),

			// Membership step
			'get_pro_membership'      => __( 'Get Pro Membership', 'ayecode-connect' ),
			'access_premium_addons'   => __( 'Access all premium addons', 'ayecode-connect' ),
			'choose_your_plan'        => __( 'Choose Your Plan:', 'ayecode-connect' ),
			'unlimited_sites'         => __( 'Unlimited sites', 'ayecode-connect' ),
			'cancel_anytime'          => __( 'Cancel anytime', 'ayecode-connect' ),
			'upgrade_now'             => __( 'Upgrade Now', 'ayecode-connect' ),
			'continue_with_free'      => __( 'Continue with Free', 'ayecode-connect' ),
			'i_have_membership'       => __( 'I have a membership, Log in', 'ayecode-connect' ),
			'connecting'              => __( 'Connecting...', 'ayecode-connect' ),
			'best_value'              => __( 'BEST VALUE', 'ayecode-connect' ),
			'refresh_status'          => __( 'Refresh Status', 'ayecode-connect' ),
			'refreshing'              => __( 'Refreshing...', 'ayecode-connect' ),
			'membership_key'          => __( 'Membership Key', 'ayecode-connect' ),
			'enter_license_key'       => __( 'Enter your license key', 'ayecode-connect' ),
			'activate_license'        => __( 'Activate License', 'ayecode-connect' ),
			'activating'              => __( 'Activating...', 'ayecode-connect' ),
			'license_activated'       => __( 'License activated successfully!', 'ayecode-connect' ),
			'invalid_license'         => __( 'Invalid license key. Please try again.', 'ayecode-connect' ),

			// Complete step
			'all_set'                 => __( 'All Set!', 'ayecode-connect' ),
			'setup_complete'          => __( 'Your setup is complete!', 'ayecode-connect' ),
			'directory_configured'    => __( 'directory configured', 'ayecode-connect' ),
			'theme_installed'         => __( 'Theme installed', 'ayecode-connect' ),
			'sample_listings_added'   => __( 'Sample listings added', 'ayecode-connect' ),
			'youre_missing_out'       => __( "You're missing out on:", 'ayecode-connect' ),
			'upgrade_anytime'         => __( 'Upgrade anytime, but some features work best when configured during setup.', 'ayecode-connect' ),
			'explore_pro_membership'  => __( 'Explore Pro Membership', 'ayecode-connect' ),
			'youre_on_free_plan'      => __( "You're on the FREE plan", 'ayecode-connect' ),

			// Errors & notifications
			'connection_failed'       => __( 'Connection failed. Please try again.', 'ayecode-connect' ),
			'please_select_option'    => __( 'Please select at least one option to continue.', 'ayecode-connect' ),
			'setup_saved'             => __( 'Setup saved successfully!', 'ayecode-connect' ),
		];
	}

	/**
	 * No custom CSS needed - using Bootstrap 5.3+ classes only.
	 * This method is kept for backwards compatibility but returns empty string.
	 *
	 * @return string Empty string (no custom CSS).
	 */
	public function get_wizard_inline_styles() {
		return '';
	}
}
