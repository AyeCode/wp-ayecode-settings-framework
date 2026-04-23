<?php
/**
 * Plugin Name: WP AyeCode Settings Framework
 * Description: Modern WordPress settings framework with Alpine.js and Bootstrap 5.
 * Version: 3.0.1-beta
 * Author: AyeCode Ltd
 * License: GPL v3 or later
 * Text Domain: ayecode-connect
 * Domain Path: /languages
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// AyeCode Package Loader (v1.0.0)
( function () {
	// -------------------------------------------------------------------------
	// CONFIGURATION — update these values for each new package.
	// -------------------------------------------------------------------------

	$registry_key    = 'ayecode_settings_framework_registry';
	$this_version    = '3.0.1-beta';
	$this_path       = dirname( __FILE__ );
	$prefix          = 'AyeCode\\SettingsFramework\\';
	$loader_class    = 'AyeCode\\SettingsFramework\\Loader';
	$loader_hook     = 'plugins_loaded';
	$loader_priority = 10;

	$winning_constants = [
		'WP_AYECODE_SETTINGS_FRAMEWORK_VERSION'     => $this_version,
		'WP_AYECODE_SETTINGS_FRAMEWORK_PLUGIN_DIR'  => $this_path . '/',
		'WP_AYECODE_SETTINGS_FRAMEWORK_PLUGIN_FILE' => $this_path . '/wp-ayecode-settings-framework.php',
	];

	// -------------------------------------------------------------------------
	// DO NOT EDIT BELOW THIS LINE. CORE PACKAGE NEGOTIATION LOGIC.
	// -------------------------------------------------------------------------

	/**
	 * Step 1: Version Negotiation (Priority 1)
	 *
	 * Every installed copy of this package registers itself. The highest version
	 * wins and its path is stored as the canonical source for Steps 2 and 3.
	 */
	add_action( 'plugins_loaded', function () use ( $registry_key, $this_version, $this_path ) {
		if ( empty( $GLOBALS[ $registry_key ] ) || version_compare( $this_version, $GLOBALS[ $registry_key ]['version'], '>' ) ) {
			$GLOBALS[ $registry_key ] = [
				'version' => $this_version,
				'path'    => $this_path,
			];
		}
	}, 1 );

	/**
	 * Step 2: Lazy Loading Registration (Priority 2)
	 *
	 * Only the winning version registers an SPL autoloader. Losing copies bail
	 * out early, preventing duplicate class definitions.
	 */
	add_action( 'plugins_loaded', function () use ( $registry_key, $this_path, $prefix ) {
		if ( empty( $GLOBALS[ $registry_key ] ) || $GLOBALS[ $registry_key ]['path'] !== $this_path ) {
			return;
		}

		$base_dir = $this_path . '/src/';

		spl_autoload_register( function ( $class ) use ( $prefix, $base_dir ) {
			if ( strpos( $class, $prefix ) !== 0 ) {
				return;
			}

			$relative_class = substr( $class, strlen( $prefix ) );
			$file           = $base_dir . str_replace( '\\', '/', $relative_class ) . '.php';

			if ( file_exists( $file ) ) {
				require $file;
			}
		}, true, true );

	}, 2 );

	/**
	 * Step 3: Package Initialization (Configurable Hook/Priority)
	 *
	 * Defines constants and boots the Loader class, but only for the winning
	 * version. All other copies have already bailed in Step 2.
	 */
	if ( ! empty( $loader_class ) ) {
		add_action( $loader_hook, function () use ( $registry_key, $this_path, $loader_class, $winning_constants ) {
			if ( empty( $GLOBALS[ $registry_key ] ) || $GLOBALS[ $registry_key ]['path'] !== $this_path ) {
				return;
			}

			foreach ( $winning_constants as $name => $value ) {
				if ( ! defined( $name ) ) {
					define( $name, $value );
				}
			}

			// class_exists() triggers the autoloader registered in Step 2.
			if ( class_exists( $loader_class ) ) {
				new $loader_class();
			}
		}, $loader_priority );
	}

} )();

// ---------------------------------------------------------------------------
// Standalone dev-testing examples. These only run as part of this plugin and
// demonstrate how consumer plugins implement the framework. They are loaded
// AFTER the winning version's autoloader is registered (priority 20 vs 2).
// ---------------------------------------------------------------------------
add_action( 'plugins_loaded', function () {
	if ( ! is_admin() ) {
		return;
	}

	$examples_dir = __DIR__ . '/examples/';

	require_once $examples_dir . 'AyeCode_API_Key_Manager_Example.php';
	require_once $examples_dir . 'AyeCode_Extensions_Page_Example.php';
	require_once $examples_dir . 'AyeCode_Wizard_Example.php';
	require_once $examples_dir . 'Dashboard_Page.php';
	require_once $examples_dir . 'Demo_Settings.php';

	new WP_AyeCode_Framework_Demo_Settings();
	new AyeCode_Extensions_Page_Example();
	new WP_AyeCode_Framework_Demo_Dashboard_Page();
	new AyeCode_Wizard_Example();
}, 20 );
