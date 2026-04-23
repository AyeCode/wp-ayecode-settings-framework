<?php
/**
 * AJAX Handler
 *
 * Handles AJAX requests for saving and resetting settings. It acts as a controller,
 * verifying the request and then passing the data to the main framework instance
 * for processing and persistence.
 *
 * @package AyeCode\SettingsFramework
 */

namespace AyeCode\SettingsFramework;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Ajax_Handler {

	/**
	 * A reference to the main framework instance.
	 *
	 * @var Settings_Framework
	 */
	private $framework;

	/**
	 * Constructor.
	 *
	 * @param Settings_Framework $framework The main framework instance.
	 */
	public function __construct( Settings_Framework $framework ) {
		$this->framework = $framework;
	}

	/**
	 * Handles the AJAX request to save settings.
	 */
	public function handle_save() {
		if ( ! $this->verify_request() ) {
			wp_send_json_error( [
				'message' => __( 'Security check failed. Please refresh the page and try again.', 'ayecode-connect' ),
			] );
		}

		$posted_settings = isset( $_POST['settings'] ) ? json_decode( wp_unslash( $_POST['settings'] ), true ) : [];
		$is_partial_save = isset( $_POST['is_partial_save'] ) && $_POST['is_partial_save'] === 'true';

		if ( ! is_array( $posted_settings ) ) {
			wp_send_json_error( [ 'message' => __( 'Invalid settings data received.', 'ayecode-connect' ) ] );
		}

		if ( $is_partial_save ) {
			// For partial saves (like the form builder), merge with existing settings.
			$current_settings = $this->framework->get_settings();
			$posted_settings  = array_merge( $current_settings, $posted_settings );
		}

		// Validation logic is now in the Field_Manager, accessed via the framework.
		$validation_result = $this->framework->field_manager->validate_settings( $posted_settings );
		if ( is_wp_error( $validation_result ) ) {
			wp_send_json_error( [
				'message' => $validation_result->get_error_message(),
				'errors'  => $validation_result->get_error_data(),
			] );
		}

		// Delegate saving to the framework.
		$save_result = $this->framework->save_settings( $posted_settings );

		if ( $save_result ) {
			wp_send_json_success( [
				'message'  => __( 'Settings saved successfully!', 'ayecode-connect' ),
				'settings' => $this->framework->get_settings(), // Send back the freshly saved settings.
			] );
		} else {
			wp_send_json_error( [
				'message' => __( 'Failed to save settings. This may happen if the settings have not changed.', 'ayecode-connect' ),
			] );
		}
	}

	/**
	 * Handles the AJAX request to reset settings to their defaults.
	 */
	public function handle_reset() {
		if ( ! $this->verify_request() ) {
			wp_send_json_error( [
				'message' => __( 'Security check failed. Please refresh the page and try again.', 'ayecode-connect' ),
			] );
		}

		// Delegate resetting to the framework.
		$reset_result = $this->framework->reset_settings();

		if ( $reset_result ) {
			wp_send_json_success( [
				'message'  => __( 'Settings reset to defaults successfully!', 'ayecode-connect' ),
				'settings' => $this->framework->get_settings(), // Send back the fresh default settings.
			] );
		} else {
			wp_send_json_error( [
				'message' => __( 'Failed to reset settings. Please try again.', 'ayecode-connect' ),
			] );
		}
	}

	/**
	 * Verifies the security of the AJAX request (nonce and user permissions).
	 *
	 * @return bool True if the request is valid, false otherwise.
	 */
	private function verify_request() {
		// Capability check is now handled by the framework's main `handle_*` methods.
		// Here, we just check the nonce.
		$nonce = isset( $_POST['nonce'] ) ? sanitize_text_field($_POST['nonce']) : '';

		return wp_verify_nonce( $nonce, 'save_' . $this->framework->get_option_name() );
	}
}