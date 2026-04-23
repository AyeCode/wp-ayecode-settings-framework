<?php

namespace AyeCode\SettingsFramework;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Package entry point. Instantiated by the Package Loader once the winning
 * version has been determined and its autoloader registered.
 *
 * The constructor is the only place where package-level hooks are registered.
 * All other functionality lives in dedicated classes within src/.
 */
class Loader {

	public function __construct() {
		// Package-level hooks go here.
		// Consumer plugins bootstrap themselves by instantiating Settings_Framework subclasses.
	}
}
