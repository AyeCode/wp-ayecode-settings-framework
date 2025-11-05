<?php
/**
 * AyeCode Settings Framework - Abstract Base Class
 *
 * This abstract class serves as the foundation for creating new settings pages.
 * It handles the core WordPress integrations, script enqueueing, and AJAX handling flow.
 * To create a settings page, a new class must extend this one and implement the
 * get_config() method, as well as define the necessary protected properties.
 *
 * @package AyeCode\SettingsFramework
 */

namespace AyeCode\SettingsFramework;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Settings_Framework {

	/**
	 * Framework version.
	 */
	const VERSION = '1.2.0';

	/**
	 * The base directory for temporary import files.
	 * Using a function allows it to be defined after WP's core is loaded.
	 *
	 * @var string
	 */
	public static $import_temp_dir;

	/**
	 * The base URL for temporary import files.
	 *
	 * @var string
	 */
	public static $import_temp_url;

	/**
	 * Instance of the new Tool_Ajax_Handler.
	 * @var Tool_Ajax_Handler
	 */
	protected $tool_ajax_handler;

	/**
	 * Define constants after WordPress is initialized.
	 */
	public static function define_path_constants() {
		if ( ! defined( 'AYECODE_SF_IMPORT_TEMP_DIR' ) ) {
			$upload_dir = wp_upload_dir();
			define( 'AYECODE_SF_IMPORT_TEMP_DIR', $upload_dir['basedir'] . '/ayecode-sf-import-temp/' );
			define( 'AYECODE_SF_IMPORT_TEMP_URL', $upload_dir['baseurl'] . '/ayecode-sf-import-temp/' );
		}
	}


	// region Child Class Properties
	// These properties must be defined in the child class to configure the settings page.
	// ----------------------------------------------------------------------------------

	/**
	 * The unique WordPress option name where settings are stored.
	 *
	 * @var string
	 */
	protected $option_name;

	/**
	 * The unique slug for the admin page.
	 *
	 * @var string
	 */
	protected $page_slug;

	/**
	 * The name of the plugin, displayed in the header.
	 *
	 * @var string
	 */
	protected $plugin_name = 'Plugin Settings';

	/**
	 * The title displayed in the <title> tag of the page.
	 *
	 * @var string
	 */
	protected $page_title = 'Settings';

	/**
	 * The text for the menu item.
	 *
	 * @var string
	 */
	protected
		$menu_title = 'Settings';

	/**
	 * The capability required to access this settings page.
	 *
	 * @var string
	 */
	protected $capability = 'manage_options';

	/**
	 * The icon for the admin menu. Can be a dashicon class or a URL.
	 *
	 * @var string
	 */
	protected $menu_icon = 'dashicons-admin-generic';

	/**
	 * The position of the menu item in the admin menu.
	 *
	 * @var int|null
	 */
	protected $menu_position = null;

	/**
	 * If set, creates a submenu under the given parent slug.
	 *
	 * @var string|null
	 */
	protected $parent_slug = null;

	// endregion

	// region Internal Properties
	// These are used internally by the framework.
	// ----------------------------------------------------------------------------------

	/**
	 * Holds the configuration array once loaded.
	 * The config is lazy-loaded to avoid impacting performance on other admin pages.
	 *
	 * @var array|null
	 */
	private $config = null;

	/**
	 * The screen ID for the admin page, set by WordPress.
	 *
	 * @var string
	 */
	protected $screen_id;

	/**
	 * Instance of the Admin_Page renderer.
	 *
	 * @var Admin_Page
	 */
	protected $admin_page;

	/**
	 * Instance of the AJAX handler.
	 *
	 * @var Ajax_Handler
	 */
	protected $ajax_handler;

	/**
	 * Instance of the Field_Manager.
	 *
	 * @var Field_Manager
	 */
	public $field_manager;

	/**
	 * Instance of the Extensions_Manager.
	 * @var Extensions_Manager
	 */
	protected $extensions_manager;

	// endregion

	/**
	 * Abstract method for retrieving the settings configuration array.
	 * This method MUST be implemented by the child class.
	 *
	 * @return array The settings configuration array.
	 */
	abstract protected function get_config();

	/**
	 * Constructor.
	 *
	 * Initializes the framework by validating the required child properties
	 * and setting up the core WordPress hooks.
	 */
	public function __construct() {
		// Ensure required properties are set by the child class.
		if ( empty( $this->option_name ) || empty( $this->page_slug ) ) {
			wp_die( 'Settings Framework: The extending class must define the protected properties "$option_name" and "$page_slug".' );
		}
		$this->init();
	}

	/**
	 * Initializes the framework components and hooks into WordPress.
	 */
	private function init() {
		if ( ! is_admin() ) {
			return;
		}

		self::define_path_constants();
		$this->load_dependencies();

		// Instantiate core components, passing this framework instance to them.
		$this->field_manager = new Field_Manager( $this );
		$this->admin_page    = new Admin_Page( $this );
		$this->ajax_handler  = new Ajax_Handler( $this );
		$this->tool_ajax_handler = new Tool_Ajax_Handler( $this );
		$this->extensions_manager = new Extensions_Manager( $this );

		// Register core hooks.
		add_action( 'admin_menu', [ $this, 'add_admin_menu' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );

		// Register AJAX actions.
		add_action( 'wp_ajax_save_' . $this->option_name, [ $this->ajax_handler, 'handle_save' ] );
		add_action( 'wp_ajax_reset_' . $this->option_name, [ $this->ajax_handler, 'handle_reset' ] );
		add_action( 'wp_ajax_asf_tool_action_' .  $this->page_slug, [ $this, 'handle_tool_action' ] );
		add_action( 'wp_ajax_asf_content_pane_' .  $this->page_slug, [ $this, 'handle_load_content_pane' ] );
		add_action( 'wp_ajax_asf_temp_file_upload_' . $this->page_slug, [ $this, 'handle_temp_file_upload' ] );
		add_action( 'wp_ajax_asf_temp_file_delete_' . $this->page_slug, [ $this, 'handle_temp_file_delete' ] );


		// Add settings link to the plugins page.
		add_filter( 'plugin_action_links_' . plugin_basename( $this->get_calling_file() ), [ $this, 'add_settings_link' ] );

		// Integrate with AyeCode UI if present.
		add_filter( 'aui_screen_ids', [ $this, 'add_aui_screens' ] );

		// Schedule the cleanup cron job.
		$this->schedule_cleanup_cron();
	}

	/**
	 * Schedules the daily cron job for cleaning up temporary files if it's not already scheduled.
	 */
	private function schedule_cleanup_cron() {
		if ( ! wp_next_scheduled( 'ayecode_sf_cleanup_temp_files' ) ) {
			wp_schedule_event( time(), 'daily', 'ayecode_sf_cleanup_temp_files' );
		}
		add_action( 'ayecode_sf_cleanup_temp_files', [ __CLASS__, 'cleanup_temp_files' ] );
	}

	/**
	 * Cron job callback to delete files in the temp directory that are older than 24 hours.
	 */
	public static function cleanup_temp_files() {
		self::define_path_constants();
		$temp_dir = AYECODE_SF_IMPORT_TEMP_DIR;
		if ( ! is_dir( $temp_dir ) ) {
			return;
		}

		$iterator = new \RecursiveDirectoryIterator( $temp_dir, \RecursiveDirectoryIterator::SKIP_DOTS );
		$files = new \RecursiveIteratorIterator( $iterator, \RecursiveIteratorIterator::CHILD_FIRST );

		foreach ( $files as $file ) {
			if ( $file->isFile() && time() - $file->getMTime() >= DAY_IN_SECONDS ) {
				wp_delete_file( $file->getRealPath() );
			} elseif ($file->isDir()) {
				// Check if directory is empty after deleting files
				if (count(scandir($file->getPathname())) == 2) { // Contains only '.' and '..'
					@rmdir($file->getPathname());
				}
			}
		}
	}


	/**
	 * Loads the framework's dependent class files.
	 */
	private function load_dependencies() {
		$base_path = dirname( __FILE__ );
		require_once $base_path . '/Admin_Page.php';
		require_once $base_path . '/Ajax_Handler.php';
		require_once $base_path . '/Tool_Ajax_Handler.php';
		require_once $base_path . '/Field_Renderer.php'; // Kept for static helpers.
		require_once $base_path . '/Field_Manager.php';   // The new decoupled field manager.
		require_once $base_path . '/Extensions_Manager.php';
		require_once $base_path . '/System_Status_Handler.php';
		require_once $base_path . '/Setup_Wizard.php';     // Setup Wizard base class.
	}

	/**
	 * Adds the settings page to the WordPress admin menu.
	 */
	public function add_admin_menu() {
		$render_callback = [ $this->admin_page, 'render' ];

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
	 * Enqueues CSS and JavaScript assets for the settings page.
	 * This function is hooked into `admin_enqueue_scripts` and will only
	 * load assets on the correct admin page to maintain performance.
	 *
	 * @param string $hook The current admin page hook.
	 */
	public function enqueue_assets( $hook ) {
		if ( $hook !== $this->screen_id ) {
			return;
		}

		// Enqueue all WordPress and framework scripts from this central method.
		wp_enqueue_media();
		wp_enqueue_script( 'iconpicker' );

		$assets_url = plugin_dir_url( dirname( __FILE__ ) ) . 'assets/';
		$version    = self::VERSION;

		// 1. Enqueue the Alpine Sort plugin FIRST, with no dependencies.
		wp_enqueue_script( 'alpine-js-sort', $assets_url . 'js/alpine.sort.min.js', [], '3.14.9', true );

		// 2. Enqueue Alpine.js Core SECOND, making it dependent on the sort plugin.
		// This ensures the plugin script tag appears before the core script tag in the HTML.
		wp_enqueue_script( 'alpine-js', $assets_url . 'js/alpine.min.js', ['alpine-js-sort'], '3.14.9', true );

		// 3. Your main app script depends on the Alpine core being ready.
		wp_enqueue_script( 'ayecode-settings-framework-admin', $assets_url . 'dist/js/settings.js', [ 'alpine-js' ], $version, true );

		// 4. Add 'defer' to the Alpine scripts. WordPress will respect the dependency order.
		add_filter( 'script_loader_tag', [ $this, 'add_defer_to_alpine_scripts' ], 10, 2 );

		// Determine if this is a wizard instance
		$is_wizard = $this instanceof Setup_Wizard;

		// Prepare localization data
		$localization_object = $is_wizard ? 'ayecodeWizardFramework' : 'ayecodeSettingsFramework';

		if ( $is_wizard ) {
			// Wizard-specific localization
			$wizard_config = $this->get_wizard_config_for_js();
			$localization_data = [
				'steps'            => $wizard_config['steps'] ?? [],
				'wizard_config'    => $wizard_config['wizard_config'] ?? [],
				'is_connected'     => $wizard_config['is_connected'] ?? false,
				'is_member_active' => $wizard_config['is_member_active'] ?? false,
				'is_localhost'     => $wizard_config['is_localhost'] ?? false,
				'ajax_url'         => admin_url( 'admin-ajax.php' ),
				'tool_nonce'       => wp_create_nonce( 'asf_tool_action' ),
				'tool_ajax_action' => 'asf_tool_action_' . $this->page_slug,
				'page_slug'        => $this->page_slug,
				'strings'          => method_exists( $this, 'get_wizard_strings' ) ? $this->get_wizard_strings() : [],
			];
		} else {
			// Standard settings page localization
			$localization_data = [
				'config'         => $this->get_config_with_preloads(),
				'settings'       => $this->get_settings(),
				'image_previews' => $this->get_image_previews(),
				'custom_search_links' => $this->get_custom_search_links(),
				'ajax_url'       => admin_url( 'admin-ajax.php' ),
				'nonce'          => wp_create_nonce( 'save_' . $this->option_name ),
				'tool_nonce'     => wp_create_nonce( 'asf_tool_action' ),
				'action'         => 'save_' . $this->option_name, // The base action for save/reset.
				'tool_ajax_action' => 'asf_tool_action_' . $this->page_slug,
				'content_pane_ajax_action' => 'asf_content_pane_' . $this->page_slug,
				'file_upload_ajax_action' => 'asf_temp_file_upload_' . $this->page_slug,
				'file_delete_ajax_action' => 'asf_temp_file_delete_' . $this->page_slug,
				'strings'        => [
					'saving'            => __( 'Saving...', 'ayecode-connect' ),
					'saved'             => __( 'Settings saved successfully!', 'ayecode-connect' ),
					'error'             => __( 'Error saving settings. Please try again.', 'ayecode-connect' ),
					'unsaved_changes'   => __( 'You have unsaved changes', 'ayecode-connect' ),
					'confirm_discard'   => __( 'Are you sure you want to discard your changes?', 'ayecode-connect' ),
					'search_placeholder' => __( 'Quick search...', 'ayecode-connect' ),
					'no_results'        => __( 'No settings found', 'ayecode-connect' ),
					'clear_search'      => __( 'Clear search', 'ayecode-connect' ),
					// Form builder & Alpine app
					'save_failed_navigation_cancelled' => __( 'Save failed. Navigation cancelled.', 'ayecode-connect' ),
					'field_single_use_limit' => __( 'This field is single use only and is already being used.', 'ayecode-connect' ),
					'default_field_cannot_delete' => __( 'This is a default field and cannot be deleted.', 'ayecode-connect' ),
					'nesting_not_enabled' => __( 'Nesting is not enabled for this field.', 'ayecode-connect' ),
					'items_with_children_cannot_nest' => __( 'Items that already have children cannot be nested.', 'ayecode-connect' ),
					'field_required_error' => __( 'Error: The "%s" field is required.', 'ayecode-connect' ),
					'base_template_not_found' => __( 'Error: Base template with id "%s" could not be found.', 'ayecode-connect' ),
					// Extensions
					'failed_fetch_extensions' => __( 'Failed to fetch extensions.', 'ayecode-connect' ),
					'error_fetching_extensions' => __( 'An error occurred while fetching extensions.', 'ayecode-connect' ),
					// Actions
					'starting' => __( 'Starting...', 'ayecode-connect' ),
					'something_went_wrong' => __( 'Something went wrong, please refresh and try again.', 'ayecode-connect' ),
					'processing' => __( 'Processing...', 'ayecode-connect' ),
					// Forms & uploads
					'form_saved' => __( 'Form saved!', 'ayecode-connect' ),
					'file_upload_failed' => __( 'File upload failed.', 'ayecode-connect' ),
					// UI feedback
					'copied_to_clipboard' => __( 'Copied to Clipboard', 'ayecode-connect' ),
				],
			];
		}

		// Localize the main script with appropriate data
		wp_localize_script(
			'ayecode-settings-framework-admin',
			$localization_object,
			$localization_data
		);

		wp_add_inline_script(
			'ayecode-settings-framework-admin',
			"document.addEventListener('DOMContentLoaded', function() { document.dispatchEvent(new CustomEvent('ayecode:settings-data-ready')); });",
			'after'
		);
	}

	public function get_custom_search_links() { return [];}

	/**
	 * Gets the full settings configuration array, loading it if necessary.
	 * This is the "lazy-load" getter for the config.
	 *
	 * @return array The configuration array.
	 */
	public function get_config_raw() {
		if ( is_null( $this->config ) ) {
			// call_user_func is used to call the abstract method implemented in the child.
			$this->config = call_user_func( [ $this, 'get_config' ] );
		}

		return $this->config;
	}

	/**
	 * Retrieves settings from the database.
	 *
	 * @return array Current settings.
	 */
	public function get_settings() {
		return get_option( $this->option_name, [] );
	}

	/**
	 * Saves settings to the database. It delegates the sanitization
	 * and processing to the Field_Manager.
	 *
	 * @param array $new_settings The raw settings data from the AJAX request.
	 * @return bool True on success, false on failure.
	 */
	public function save_settings( $new_settings ) {
		$current_settings = $this->get_settings();
		$sanitized        = $this->field_manager->sanitize_and_prepare_settings( $new_settings, $current_settings );

		$result = update_option( $this->option_name, $sanitized );

		do_action( 'ayecode_settings_framework_saved', $sanitized, $this->option_name );

		return $result;
	}

	/**
	 * Resets all settings to their default values as defined in the config.
	 *
	 * @return bool True on success, false on failure.
	 */
	public function reset_settings() {
		$defaults = $this->field_manager->get_default_settings();
		$result   = update_option( $this->option_name, $defaults );

		do_action( 'ayecode_settings_framework_reset', $defaults, $this->option_name );

		return $result;
	}


	/**
	 * Generic handler for "Tool" actions (Action Buttons, Dashboard Widgets, Extension Actions, etc.).
	 * It verifies the request and routes it to the appropriate handler based on the 'tool_action'.
	 * Priority: Extension Manager -> Internal Tool Handler -> Child Class Hook.
	 * NOTE: Content Pane actions are handled by handle_load_content_pane.
	 */
	public function handle_tool_action() {
		check_ajax_referer( 'asf_tool_action', 'nonce' );
		if ( ! current_user_can( $this->capability ) ) {
			wp_send_json_error( [ 'message' => 'Permission denied.' ] );
			wp_die(); // Ensure execution stops
		}

		$tool_action = isset( $_POST['tool_action'] ) ? sanitize_key( $_POST['tool_action'] ) : '';
		if ( empty( $tool_action ) ) {
			wp_send_json_error( [ 'message' => 'No tool action specified.' ] );
			wp_die(); // Ensure execution stops
		}

		// --- Extension Action Router ---
		$extension_actions = [
//			'get_extension_data',
			'install_and_activate_item',
			'install_wp_org_item',
			'activate_item',
			'deactivate_item',
			'connect_site',
			'get_connect_url'
		];
		if ( in_array( $tool_action, $extension_actions, true ) && isset($this->extensions_manager) ) {
			// The handle_ajax_action method should call wp_send_json_* and wp_die()
			$this->extensions_manager->handle_ajax_action( $tool_action );
			// No need for wp_die() here as the handler should manage it.
			return; // Stop further execution.
		}

		// --- Internal Tool Ajax Handler Router ---
		// For built-in widgets (Stats, System Status Widget Data, RSS) or framework-level tools.
		if ( isset($this->tool_ajax_handler) ) {
			$handler_method = 'handle_' . $tool_action;
			if ( method_exists( $this->tool_ajax_handler, $handler_method ) ) {
				// The specific handler method should call wp_send_json_* and wp_die()
				$this->tool_ajax_handler->$handler_method( $_POST );
				// No need for wp_die() here as the handler should manage it.
				return; // Stop further execution.
			}
		}

		// --- Child Class Hook ---
		// If no framework handler was found, fire the hook for the child class implementation.
		// The child class's hook callback is responsible for sending the JSON response and dying.
		do_action( 'asf_execute_tool_' . $this->page_slug, $tool_action, $_POST );

		// --- Fallback Error ---
		// If we reach this point, no handler sent a response.
		if ( ! headers_sent() ) {
			wp_send_json_error( [ 'message' => 'Unknown tool action specified or no handler responded.' ] );
		}
		wp_die(); // Final fallback to ensure script termination
	}


	/**
	 * Handles the initial, temporary upload of a file for an import page.
	 */
	public function handle_temp_file_upload() {
		check_ajax_referer( 'asf_tool_action', 'nonce' );
		if ( ! current_user_can( $this->capability ) ) {
			wp_send_json_error( [ 'message' => 'Permission denied.' ] );
		}

		if ( empty( $_FILES['import_file'] ) ) {
			wp_send_json_error( [ 'message' => 'No file was uploaded.' ] );
		}

		$file = $_FILES['import_file'];

		// Security Check: Validate the file's extension and MIME type against a fixed allowed list.
		$allowed_mimes = [
			'csv'  => 'text/csv',
			'json' => 'application/json',
		];

		// Temporarily allow JSON uploads for this check only, as it's not a default WordPress MIME type.
		add_filter( 'upload_mimes', [ $this, 'add_json_mime_type' ] );
		$file_info = wp_check_filetype_and_ext( $file['tmp_name'], $file['name'], $allowed_mimes );
		remove_filter( 'upload_mimes', [ $this, 'add_json_mime_type' ] );

		// wp_check_filetype_and_ext returns false for both ext and type if the file type is not allowed.
		if ( false === $file_info['ext'] || false === $file_info['type'] ) {
			wp_send_json_error( [ 'message' => 'Invalid file type. Only .csv and .json files are allowed.' ] );
		}

		// Prepare the temporary directory.
		$upload_dir = AYECODE_SF_IMPORT_TEMP_DIR . $this->page_slug . '/';
		if ( ! file_exists( $upload_dir ) ) {
			wp_mkdir_p( $upload_dir );
		}

		// Use the validated extension from $file_info.
		$file_ext = $file_info['ext'];

		// Add a unique hash to the filename to prevent conflicts and make it non-guessable.
		$file_name    = wp_basename( $file['name'], ".{$file_ext}" );
		$hash         = substr( md5( uniqid( (string) rand(), true ) ), 0, 8 );
		$new_filename = sanitize_file_name( "{$file_name}_{$hash}.{$file_ext}" );
		$target_path  = $upload_dir . $new_filename;

		// Move the validated file to the temporary directory.
		if ( move_uploaded_file( $file['tmp_name'], $target_path ) ) {
			wp_send_json_success( [
				'filename'  => $new_filename,
				'message'   => 'File uploaded successfully. Ready to import.',
			] );
		} else {
			wp_send_json_error( [ 'message' => 'Could not move uploaded file.' ] );
		}
	}


	/**
	 * Handles the deletion of a single temporary file.
	 */
	public function handle_temp_file_delete() {
		check_ajax_referer( 'asf_tool_action', 'nonce' );
		if ( ! current_user_can( $this->capability ) ) {
			wp_send_json_error( [ 'message' => 'Permission denied.' ] );
		}

		$filename = isset($_POST['filename']) ? sanitize_file_name($_POST['filename']) : '';
		if (empty($filename)) {
			wp_send_json_error(  [ 'message' => 'No filename provided.' ] );
		}

		$file_path = AYECODE_SF_IMPORT_TEMP_DIR . $this->page_slug . '/' . $filename;

		// Security check: ensure the file is within our temp directory
		if (file_exists($file_path) && strpos(realpath($file_path), realpath(AYECODE_SF_IMPORT_TEMP_DIR . $this->page_slug)) === 0) {
			if (wp_delete_file($file_path)) {
				wp_send_json_success();
			} else {
				wp_send_json_error( [ 'message' => 'Could not delete the file.' ] );
			}
		} else {
			wp_send_json_error(  [ 'message' => 'Invalid file or file not found.' ]  );
		}
	}

	/**
	 * Generic handler for loading "Custom Content Panes" via AJAX.
	 * Routes known actions (like system status) and provides a hook for others.
	 */
	public function handle_load_content_pane() {
		check_ajax_referer( 'asf_tool_action', 'nonce' ); // Use the same nonce for simplicity
		if ( ! current_user_can( $this->capability ) ) {
			wp_send_json_error( [ 'message' => 'Permission denied.' ] );
			wp_die();
		}

		$content_action = isset( $_POST['content_action'] ) ? sanitize_key( $_POST['content_action'] ) : '';
		if ( empty( $content_action ) ) {
			wp_send_json_error( [ 'message' => 'No content action specified.' ] );
			wp_die();
		}

		// --- Built-in Content Pane Router ---
		if ( $content_action === 'get_system_status_content' ) {
			// Ensure the handler class exists (it should if loaded in load_dependencies)
			if ( class_exists( __NAMESPACE__ . '\System_Status_Handler' ) ) {
				$status_handler = new System_Status_Handler( $this ); // Pass $this for context if needed
				$html = $status_handler->generate_html();
				wp_send_json_success( [ 'html' => $html ] );
			} else {
				wp_send_json_error( [ 'message' => 'System Status Handler class not found.' ] );
			}
			wp_die(); // Execution stops here for this action
		}

		// --- Fallback Hook for Child Class / Other Plugins ---
		// Fire the hook for any other content_action. Callbacks hooked here
		// MUST call wp_send_json_* and wp_die().
		do_action( 'asf_render_content_pane_' . $this->page_slug, $content_action );

		// --- Fallback Error if Hook Didn't Respond ---
		if ( ! headers_sent() ) {
			wp_send_json_error( [ 'message' => 'Unknown content action specified or no handler responded.' ] );
		}
		wp_die();
	}

	/**
	 * Default implementation for fetching remote products.
	 * Child classes can override this for custom behavior.
	 * @param string $category The product category/slug to fetch.
	 * @param string $api_url The base URL for the API endpoint.
	 * @return array
	 */
	public function fetch_remote_products( $category, $api_url ) {
		$transient_key = 'ayecode_extensions_' . $this->page_slug . '_' . $category;
		$products = get_transient( $transient_key );

		if ( false === $products ) {
			$api_args = [ 'category' => $category, 'number' => 100 ];
			$request_url = add_query_arg( $api_args, $api_url );

			$response = wp_safe_remote_get( esc_url_raw( $request_url ), [ 'timeout' => 15 ] );

			if ( ! is_wp_error( $response ) && wp_remote_retrieve_response_code( $response ) === 200 ) {
				$data = json_decode( wp_remote_retrieve_body( $response ) );
				$products = isset( $data->products ) ? $data->products : [];
				set_transient( $transient_key, $products, DAY_IN_SECONDS );
			} else {
				$products = [];
			}
		}
		return $products;
	}

	/**
	 * Determines the installation/activation status of a given product.
	 * This method is intended to be overridden by the child class if custom logic is needed.
	 *
	 * @param array $product The raw product object from the API.
	 * @param string $type The item type ('plugin' or 'theme').
	 * @return string The status ('active', 'installed', or 'not_installed').
	 */
	public function get_product_status( $product, $type = 'plugin' ) {
		// Delegate to the new manager.
		return $this->extensions_manager->get_status( $product, $type );
	}

	/**
	 * Adds a "Settings" link to the plugin's action links on the plugins page.
	 *
	 * @param array $links Existing links.
	 * @return array Modified links.
	 */
	public function add_settings_link( $links ) {
		$settings_link = sprintf(
			'<a href="%s">%s</a>',
			admin_url( 'admin.php?page=' . $this->page_slug ),
			__( 'Settings', 'ayecode-connect' )
		);
		array_unshift( $links, $settings_link );

		return $links;
	}

	/**
	 * Adds the 'defer' attribute to the Alpine.js script tags for better performance.
	 *
	 * @param string $tag    The original script tag HTML.
	 * @param string $handle The script's handle.
	 * @return string The modified script tag.
	 */
	public function add_defer_to_alpine_scripts( $tag, $handle ) {
		// Updated to handle both the core and the sort plugin
		if ( 'alpine-js' === $handle || 'alpine-js-sort' === $handle ) {
			return str_replace( ' src', ' defer src', $tag );
		}

		return $tag;
	}

	/**
	 * Pre-processes the config to include content for 'custom_page' sections
	 * that use 'html_content', and adds connection status for extension pages.
	 *
	 * @return array The processed configuration.
	 */
	private function get_config_with_preloads() {
		$config = $this->get_config_raw();
		$has_extension_page = false;

		if ( isset( $config['sections'] ) && is_array( $config['sections'] ) ) {
			foreach ( $config['sections'] as &$section ) {
				// Check if this framework instance uses an extension list page
				if ( isset( $section['type'] ) && $section['type'] === 'extension_list_page' ) {
					$has_extension_page = true; // Mark that we found one

					// Process static items if present (existing logic)
					if ( isset( $section['source'], $section['static_items'] ) && $section['source'] === 'static' ) {
						foreach ( $section['static_items'] as &$item ) {
							$slug_for_status = $item['info']['slug'] ?? '';
							$item_type = $section['api_config']['item_type'] ?? 'plugin'; // Get type from api_config
							$product_array = [ 'info' => [ 'slug' => $slug_for_status ] ];
							$item['status'] = $this->get_product_status( $product_array, $item_type );
							$item['type'] = $item_type;
						}
						unset($item); // Unset reference
					}
				}

				// Existing logic for custom pages
				if ( isset( $section['type'], $section['html_content'] ) && $section['type'] === 'custom_page' ) {
					$section['content_html'] = $section['html_content'];
					unset( $section['html_content'] );
				}
			}
			unset($section); // Unset reference
		}

		// --- Auto-inject connect_banner info if an extension page exists ---
		if ( $has_extension_page ) {
			$is_localhost = $this->is_localhost();
			$is_connected = $this->is_connected();

			// Ensure page_config and connect_banner exist
			if ( ! isset( $config['page_config'] ) ) {
				$config['page_config'] = [];
			}
			if ( ! isset( $config['page_config']['connect_banner'] ) || ! is_array( $config['page_config']['connect_banner'] ) ) {
				$config['page_config']['connect_banner'] = [];
			}

			// Add/Override the flags. Child class settings (like URLs) will be preserved.
			$config['page_config']['connect_banner']['is_localhost'] = $is_localhost;
			$config['page_config']['connect_banner']['is_connected'] = $is_connected;

			// Add a default connect_url if not set by the child class
			if ( ! isset( $config['page_config']['connect_banner']['connect_url'] ) ) {
				$config['page_config']['connect_banner']['connect_url'] = '#'; // Default placeholder handled by JS
			}
			// Add a default learn_more_url if not set by the child class
			if ( ! isset( $config['page_config']['connect_banner']['learn_more_url'] ) ) {
				$config['page_config']['connect_banner']['learn_more_url'] = 'https://wpgeodirectory.com/documentation/article/first-steps/install-ayecode-connect-help-widget/'; // Or a generic AyeCode link
			}
		}

		return $config;
	}

	/**
	 * Generates preview URLs for all 'image' type fields that have a value.
	 *
	 * @return array An associative array of [field_id => preview_url].
	 */
	private function get_image_previews() {
		$settings       = $this->get_settings();
		$all_fields     = $this->field_manager->get_field_map();
		$image_previews = [];

		foreach ( $all_fields as $field_id => $field_config ) {
			if ( isset( $field_config['type'] ) && $field_config['type'] === 'image' && ! empty( $settings[ $field_id ] ) ) {
				$image_id = absint( $settings[ $field_id ] );
				if ( $image_id > 0 ) {
					$preview_url = wp_get_attachment_image_url( $image_id, 'thumbnail' );
					if ( $preview_url ) {
						$image_previews[ $field_id ] = $preview_url;
					}
				}
			}
		}

		return $image_previews;
	}

	/**
	 * Helper function to find the file that instantiated the child class.
	 * Used for the 'plugin_action_links' filter.
	 *
	 * @return string The file path of the calling plugin.
	 */
	private function get_calling_file() {
		$backtrace = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS );
		foreach ( $backtrace as $trace ) {
			if ( isset( $trace['file'] ) && strpos( $trace['file'], 'ayecode-connect' ) === false ) {
				return $trace['file'];
			}
		}

		return __FILE__; // Fallback
	}

	/**
	 * Adds this page's screen ID to the list for AyeCode UI components.
	 *
	 * @param array $screen_ids Existing screen IDs.
	 * @return array Modified screen IDs.
	 */
	public function add_aui_screens( $screen_ids ) {
		if ( $this->screen_id ) {
			$screen_ids[] = $this->screen_id;
		}

		return $screen_ids;
	}

	// region Public Getters
	// Provides controlled access to protected properties for other classes.

	public function get_page_slug() {
		return $this->page_slug;
	}

	public function get_plugin_name() {
		return $this->plugin_name;
	}

	public function get_option_name() {
		return $this->option_name;
	}

	public function get_page_title() {
		return $this->page_title;
	}

	/**
	 * Temporarily adds JSON to the list of allowed MIME types for uploads.
	 *
	 * @param array $mimes Existing MIME types.
	 * @return array Modified MIME types.
	 */
	public function add_json_mime_type( $mimes ) {
		$mimes['json'] = 'application/json';
		return $mimes;
	}

	/**
	 * Checks if the current environment is considered localhost.
	 * @return bool True if localhost, false otherwise.
	 */
	protected function is_localhost() {
//		return false;
		$host = ! empty( $_SERVER['HTTP_HOST'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_HOST'] ) ) : 'localhost';
		$local_domains = [ '.localhost', '.test', 'localhost','.local' ]; // Common local domains
		foreach ( $local_domains as $domain ) {
			if ( substr( $host, -strlen( $domain ) ) === $domain ) {
				return true;
			}
		}
		// Also check common local IPs
		$local_ips = ['127.0.0.1', '::1'];
		$remote_addr = !empty($_SERVER['REMOTE_ADDR']) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
		if( in_array( $remote_addr, $local_ips ) ){
			return true;
		}

		return false;
	}

	/**
	 * Checks if the site is connected via AyeCode Connect.
	 * @return bool True if connected, false otherwise.
	 */
	protected function is_connected() {
		return true; //  @todo remove after testing
		if ( class_exists( 'AyeCode_Connect_Settings' ) ) {
			try {
				$settings = \AyeCode_Connect_Settings::instance();
				if ( method_exists( $settings->client, 'is_registered' ) && $settings->client->is_registered() ) {
					return true;
				}
			} catch (\Exception $e) {
				// Handle potential errors if instance() fails
				error_log('Error checking AyeCode Connect status: ' . $e->getMessage());
				return false;
			}
		}
		return false;
	}

	/**
	 * Returns the domain to check for active membership licenses.
	 * Child classes should override this to specify their product domain.
	 *
	 * @return string|null The domain (e.g., 'wpgeodirectory.com') or null if not applicable.
	 */
	protected function get_membership_domain() {
		return null;
	}

	/**
	 * Checks if the user has an active paid membership for a specific domain.
	 * Looks for active license in the 'exup_keys' option.
	 *
	 * @param string|null $domain The domain to check (e.g., 'wpgeodirectory.com').
	 *                            If null, uses get_membership_domain().
	 * @return bool True if an active membership exists, false otherwise.
	 */
	protected function is_member_active( $domain = null ) {
		return true;//  @todo remove after testing
		// Use provided domain or get from child class
		if ( null === $domain ) {
			$domain = $this->get_membership_domain();
		}

		// If no domain specified, return false
		if ( empty( $domain ) ) {
			return false;
		}

		// Get license keys from option
		$keys = get_option( 'exup_keys', [] );

		// Check if domain exists and has active status
		if ( isset( $keys[ $domain ] ) && is_object( $keys[ $domain ] ) ) {
			return isset( $keys[ $domain ]->status ) && 'active' === $keys[ $domain ]->status;
		} elseif ( isset( $keys[ $domain ] ) && is_array( $keys[ $domain ] ) ) {
			return isset( $keys[ $domain ]['status'] ) && 'active' === $keys[ $domain ]['status'];
		}

		return false;
	}
}