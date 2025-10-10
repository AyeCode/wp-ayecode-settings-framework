<?php
/**
 * Extensions Manager
 *
 * Handles logic for fetching, checking status, installing, and activating
 * plugins and themes for the extension list pages.
 *
 * @package AyeCode\SettingsFramework
 */

namespace AyeCode\SettingsFramework;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Extensions_Manager {

	/**
	 * @var Settings_Framework
	 */
	private $framework;

	public function __construct( Settings_Framework $framework ) {
		$this->framework = $framework;
	}

	/**
	 * Determines the installation/activation status of a given item (plugin or theme).
	 *
	 * @param object $product The product object from the API.
	 * @param string $type    The type of item ('plugin' or 'theme').
	 *
	 * @return string The status: 'active', 'installed', or 'not_installed'.
	 */
	public function get_status( $product, $type = 'plugin' ) {
		$slug = $product->info->slug ?? '';
		if ( empty( $slug ) ) {
			return 'not_installed';
		}

		if ( $type === 'theme' ) {
			$theme = wp_get_theme( $slug );
			if ( get_stylesheet() === $slug ) {
				return 'active';
			}
			if ( $theme->exists() ) {
				return 'installed';
			}
		} else {
			// Default to plugin logic
			$main_file = $slug . '/' . $slug . '.php';
			if ( function_exists('is_plugin_active') && is_plugin_active( $main_file ) ) {
				return 'active';
			}
			if ( file_exists( WP_PLUGIN_DIR . '/' . $main_file ) ) {
				return 'installed';
			}
		}

		return 'not_installed';
	}

	/**
	 * Handles all extension-related AJAX actions.
	 *
	 * @param string $action The specific action to perform.
	 */
	public function handle_ajax_action( $action ) {
		$allowed_actions = [
			'install_wp_org_item',
			'activate_item',
			'deactivate_item',
			'install_and_activate_item',
			'install_and_activate_wp_org_item'
		];

		if ( in_array( $action, $allowed_actions, true ) ) {
			$handler_method = 'handle_' . $action;
			if ( method_exists( $this, $handler_method ) ) {
				$this->$handler_method();
			}
		} else {
			wp_send_json_error( [ 'message' => 'Unknown extension action.' ] );
		}
	}

	/**
	 * Main handler for installing and activating any item.
	 * It checks the source and delegates to the appropriate method.
	 */
	public function handle_install_and_activate_item() {
		$item_data = isset( $_POST['item_data'] ) ? json_decode( stripslashes( $_POST['item_data'] ) ) : null;

		if ( ! $item_data || ! isset( $item_data->info->source ) ) {
			wp_send_json_error( [ 'message' => 'Invalid item data provided.' ] );
		}

		// This hook allows other plugins (like a licensing client) to intercept the installation.
		// If a hook returns a WP_Error, we stop and send it back to the user.
		// If it returns `true`, it means the hook handled the installation and we can stop.
		$pre_install_result = apply_filters( 'ayecode_sf_pre_install_extension', null, $item_data );

		if ( is_wp_error( $pre_install_result ) ) {
			wp_send_json_error( [ 'message' => $pre_install_result->get_error_message() ] );
		}

		if ( $pre_install_result === true ) {
			// Another plugin handled the installation and activation. We're done.
			wp_send_json_success( [ 'message' => 'Extension activated.' ] );
			return;
		}

		if ( $item_data->info->source === 'wp.org' ) {
			$this->handle_install_and_activate_wp_org_item();
		} else {
			// If no hook intercepted it, and it's not from wp.org, then we need user guidance.
			wp_send_json_error( [ 'guidance_needed' => true, 'message' => 'This is a premium extension.' ] );
		}
	}

	/**
	 * Installs and then immediately activates an item from wordpress.org.
	 */
	private function handle_install_and_activate_wp_org_item() {
		$install_result = $this->handle_install_wp_org_item( true );

		if ( ! $install_result['success'] ) {
			wp_send_json_error( [ 'message' => 'Installation failed: ' . $install_result['message'] ] );
		}

		$activate_result = $this->handle_activate_item( true );

		if ( ! $activate_result['success'] ) {
			// Even if activation fails, installation succeeded, which is a partial success.
			wp_send_json_error( [ 'message' => 'Activation failed: ' . $activate_result['message'] ] );
		}

		wp_send_json_success( [ 'message' => 'Item installed and activated successfully.' ] );
	}

	/**
	 * Handles installing a plugin or theme from wordpress.org.
	 * @param bool $return_result If true, returns an array instead of a JSON response.
	 * @return array|void
	 */
	private function handle_install_wp_org_item( $return_result = false ) {
		if ( ! current_user_can( 'install_plugins' ) && ! current_user_can( 'install_themes' ) ) {
			$message = 'You do not have permission to install items.';
			if ( $return_result ) return [ 'success' => false, 'message' => $message ];
			wp_send_json_error( [ 'message' => $message ] );
		}

		$item_data = isset( $_POST['item_data'] ) ? json_decode( stripslashes( $_POST['item_data'] ) ) : null;
		$slug = $item_data->info->slug ?? '';
		$type = $item_data->type ?? 'plugin';

		if ( empty( $slug ) ) {
			$message = 'Item slug not provided.';
			if ( $return_result ) return [ 'success' => false, 'message' => $message ];
			wp_send_json_error( [ 'message' => $message ] );
		}

		include_once( ABSPATH . 'wp-admin/includes/class-wp-upgrader.php' );
		include_once( ABSPATH . 'wp-admin/includes/file.php' );
		wp_enqueue_style( 'updates' );

		$skin     = new \WP_Ajax_Upgrader_Skin();
		$upgrader = $type === 'theme' ? new \Theme_Upgrader( $skin ) : new \Plugin_Upgrader( $skin );

		$api_func = $type === 'theme' ? 'themes_api' : 'plugins_api';
		$api = $api_func( 'plugin_information', [ 'slug' => $slug, 'fields' => [ 'short_description' => false, 'sections' => false ] ] );

		if ( is_wp_error( $api ) ) {
			$message = $api->get_error_message();
			if ( $return_result ) return [ 'success' => false, 'message' => $message ];
			wp_send_json_error( [ 'message' => $message ] );
		}

		$result = $upgrader->install( $api->download_link );

		if ( is_wp_error( $result ) || is_wp_error( $skin->result ) ) {
			$message = is_wp_error( $result ) ? $result->get_error_message() : $skin->result->get_error_message();
			if ( $return_result ) return [ 'success' => false, 'message' => $message ];
			wp_send_json_error( [ 'message' => $message ] );
		}

		if ( $return_result ) return [ 'success' => true ];
		wp_send_json_success( [ 'message' => ucfirst($type) . ' installed successfully.' ] );
	}

	/**
	 * Handles activating an installed plugin or theme.
	 * @param bool $return_result If true, returns an array instead of a JSON response.
	 * @return array|void
	 */
	public function handle_activate_item( $return_result = false ) {
		$item_data = isset( $_POST['item_data'] ) ? json_decode( stripslashes( $_POST['item_data'] ) ) : null;
		$slug = $item_data->info->slug ?? '';
		$type = $item_data->type ?? 'plugin';

		if ( empty( $slug ) ) {
			$message = 'Item slug not provided.';
			if ( $return_result ) return [ 'success' => false, 'message' => $message ];
			wp_send_json_error( [ 'message' => $message ] );
		}

		$result = null;
		if ( $type === 'theme' ) {
			if ( ! current_user_can( 'switch_themes' ) ) {
				$message = 'You do not have permission to activate themes.';
				if ( $return_result ) return [ 'success' => false, 'message' => $message ];
				wp_send_json_error( [ 'message' => $message ] );
			}
			switch_theme( $slug );
		} else {
			if ( ! current_user_can( 'activate_plugins' ) ) {
				$message = 'You do not have permission to activate plugins.';
				if ( $return_result ) return [ 'success' => false, 'message' => $message ];
				wp_send_json_error( [ 'message' => $message ] );
			}
			$main_file = $slug . '/' . $slug . '.php';
			$result = activate_plugin( $main_file );
		}

		if ( is_wp_error( $result ) ) {
			$message = $result->get_error_message();
			if ( $return_result ) return [ 'success' => false, 'message' => $message ];
			wp_send_json_error( [ 'message' => $message ] );
		}

		if ( $return_result ) return [ 'success' => true ];
		wp_send_json_success( [ 'message' => ucfirst($type) . ' activated.' ] );
	}

	/**
	 * Handles deactivating an active plugin.
	 */
	public function handle_deactivate_item() {
		$item_data = isset( $_POST['item_data'] ) ? json_decode( stripslashes( $_POST['item_data'] ) ) : null;
		$slug = $item_data->info->slug ?? '';
		$type = $item_data->type ?? 'plugin';

		if ( empty( $slug ) ) {
			wp_send_json_error( [ 'message' => 'Item slug not provided.' ] );
		}

		if ( $type === 'theme' ) {
			wp_send_json_error( [ 'message' => 'Theme deactivation is not supported from this screen.' ] );
		} else {
			if ( ! current_user_can( 'activate_plugins' ) ) {
				wp_send_json_error( [ 'message' => 'You do not have permission to deactivate plugins.' ] );
			}
			$main_file = $slug . '/' . $slug . '.php';
			deactivate_plugins( $main_file );

			wp_send_json_success( [ 'message' => 'Plugin deactivated.' ] );
		}
	}
}
