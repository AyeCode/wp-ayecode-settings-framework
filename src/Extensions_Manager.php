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
	 * @param $product
	 *
	 * @return string
	 */
	public function get_slug( $product ): string {

		// if it's an object then convert to an array
		if(is_object( $product )){
			$product = json_decode(json_encode($product), true);
		}
		return !empty($product['info']['edd_slug'])
			? sanitize_key( $product['info']['edd_slug'] )
			: (!empty($product['info']['slug']) ? sanitize_key( $product['info']['slug']) : '');
	}

	/**
	 * Determines the installation/activation status of a given item (plugin or theme).
	 *
	 * @param array $product The product object from the API.
	 * @param string $type    The type of item ('plugin' or 'theme').
	 *
	 * @return string The status: 'active', 'installed', or 'not_installed'.
	 */
	public function get_status( $product, $type = 'plugin' ) {

		$slug = $this->get_slug( $product );


		if ( empty( $slug ) ) {
			return 'not_installed';
		}

		if ( $type === 'theme' ) {
			// maybe remove trailing -theme
			$slug = preg_replace('/-theme$/', '', $slug);

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
			'install_and_activate_wp_org_item',
			'connect_site',
			'get_connect_url',
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
	 * Handles the 'Connect Site' button action.
	 * Ensures 'ayecode-connect' is installed and activated.
	 * The front-end will make a subsequent call to get_connect_url.
	 */
	public function handle_connect_site() {
		if ( ! current_user_can( 'install_plugins' ) || ! current_user_can( 'activate_plugins' ) ) {
			wp_send_json_error( [ 'message' => 'You do not have permission to install and activate plugins.' ] );
		}

		// Define plugin slug and main file
		$plugin_slug = 'ayecode-connect';
		$plugin_main_file = 'ayecode-connect/ayecode-connect.php';

		// Check if the site is already connected
		if ( class_exists( 'AyeCode_Connect_Settings' ) ) {
			$settings = \AyeCode_Connect_Settings::instance();
			if ( method_exists( $settings->client, 'is_registered' ) && $settings->client->is_registered() ) {
				wp_send_json_success( [
					'message' => __( 'Site is already connected.', 'ayecode-connect' ),
					'already_connected' => true, // Add a flag for the frontend
				] );
				return;
			}
		}

		// Check if plugin is already active
		if ( is_plugin_active( $plugin_main_file ) ) {
			// It's active but not registered, so we just send success to proceed to the next step.
			wp_send_json_success( [ 'message' => __( 'AyeCode Connect is active. Proceeding to connect...', 'ayecode-connect' ) ] );
			return;
		}

		// Include upgrader class
		include_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
		include_once ABSPATH . 'wp-admin/includes/plugin-install.php';

		// Check if plugin is installed but not active
		$all_plugins = get_plugins();
		if ( isset( $all_plugins[ $plugin_main_file ] ) ) {
			$result = activate_plugin( $plugin_main_file );
			if ( is_wp_error( $result ) ) {
				wp_send_json_error( [ 'message' => $result->get_error_message() ] );
			}
			wp_send_json_success( [ 'message' => __( 'AyeCode Connect activated successfully. Redirecting...', 'ayecode-connect' ) ] );
			return;
		}

		// If we're here, the plugin is not installed. Let's install it.
		$api = plugins_api( 'plugin_information', [ 'slug' => $plugin_slug, 'fields' => [ 'short_description' => false, 'sections' => false ] ] );
		if ( is_wp_error( $api ) ) {
			wp_send_json_error( [ 'message' => $api->get_error_message() ] );
		}

		$skin     = new \WP_Ajax_Upgrader_Skin();
		$upgrader = new \Plugin_Upgrader( $skin );
		$result   = $upgrader->install( $api->download_link );

		if ( is_wp_error( $result ) || is_wp_error( $skin->result ) ) {
			$error_message = is_wp_error( $result ) ? $result->get_error_message() : $skin->result->get_error_message();
			wp_send_json_error( [ 'message' => $error_message ] );
		}

		// Now activate the newly installed plugin
		$result = activate_plugin( $plugin_main_file );
		if ( is_wp_error( $result ) ) {
			wp_send_json_error( [ 'message' => $result->get_error_message() ] );
		}

		wp_send_json_success( [
			'message' => __( 'AyeCode Connect installed and activated successfully. Redirecting...', 'ayecode-connect' )
		] );
	}


	/**
	 * Gets the connection URL from the now-active AyeCode Connect plugin.
	 */
	public function handle_get_connect_url() {
		if ( ! class_exists( 'AyeCode_Connect_Settings' ) ) {
			wp_send_json_error( [ 'message' => 'Could not find AyeCode_Connect_Settings class. Please ensure AyeCode Connect is active.' ] );
		}

		$AyeCode_Connect_Settings = \AyeCode_Connect_Settings::instance();
		$redirect_back_to_url = admin_url( 'admin.php?page=' . $this->framework->get_page_slug() );
		$connect_url = esc_url_raw( $AyeCode_Connect_Settings->client->build_connect_url( $redirect_back_to_url ) );

		wp_send_json_success( [
			'redirect_url' => $connect_url
		] );
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
		$slug = $this->get_slug( $item_data );
		$type = $item_data->type ?? 'plugin';

		if ( empty( $slug ) ) {
			$message = 'Item slug not provided.';
			if ( $return_result ) return [ 'success' => false, 'message' => $message ];
			wp_send_json_error( [ 'message' => $message ] );
		}

		include_once( ABSPATH . 'wp-admin/includes/class-wp-upgrader.php' );
		include_once( ABSPATH . 'wp-admin/includes/file.php' );
		include_once( ABSPATH . 'wp-admin/includes/plugin-install.php' );
		include_once( ABSPATH . 'wp-admin/includes/theme-install.php' );
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
		$slug = $this->get_slug( $item_data );
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
		$slug = $this->get_slug( $item_data );
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