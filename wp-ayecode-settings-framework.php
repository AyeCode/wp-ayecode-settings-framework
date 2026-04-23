<?php
/**
 * Plugin Name: WP AyeCode Settings Framework
 * Description: Modern WordPress settings framework with Alpine.js and Bootstrap 5.
 * Version: 3.0.2-beta
 * Author: AyeCode Ltd
 * License: GPL v3 or later
 * Text Domain: ayecode-connect
 * Domain Path: /languages
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// When bumping the version, update it in:
// 1. The Plugin Name header above.
// 2. package-loader.php ($this_version)
// 3. composer.json

// 1. Boot the package loader so the framework works as a standalone plugin.
require_once __DIR__ . '/package-loader.php';

// 2. Standalone dev-testing examples. These only run as part of this plugin and
// demonstrate how consumer plugins implement the framework. They are loaded
// AFTER the winning version's autoloader is registered (priority 20 vs 2).
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
