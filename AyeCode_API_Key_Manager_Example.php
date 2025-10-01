<?php
/**
 * API Key Manager
 *
 * Handles all business logic and data storage for the API Keys example.
 *
 * @package AyeCode\SettingsFramework
 */

namespace AyeCode\SettingsFramework;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AyeCode_API_Key_Manager {

	/**
	 * Retrieves all API keys from the database.
	 * In a real plugin, this would query a custom table. For this demo, we'll use options.
	 *
	 * @return array
	 */
	public function get_keys() {
		// We add a unique option for the list table data, separate from the main settings.
		$keys = get_option( 'ayecode_framework_demo_api_keys', [] );
		// Ensure the array is indexed correctly for the frontend.
		return array_values($keys);
	}

	/**
	 * Retrieves a single key's details.
	 *
	 * @param int $key_id The ID of the key to retrieve.
	 * @return array|null The key details or null if not found.
	 */
	public function get_key_details( $key_id ) {
		$keys = $this->get_keys();
		foreach ($keys as $key) {
			if ($key['id'] == $key_id) {
				return $key;
			}
		}
		return null;
	}

	/**
	 * Creates a new API key.
	 *
	 * @param int    $user_id     The user ID to associate with the key.
	 * @param string $description A description for the key.
	 * @param string $permissions The permissions for the key.
	 * @return array The newly created key, including the unhashed secret for one-time display.
	 */
	public function create_key( $user_id, $description, $permissions ) {
		$keys = $this->get_keys();

		// 1. Generate new key parts.
		$consumer_key    = 'ck_' . wp_generate_password( 32, false );
		$consumer_secret = 'cs_' . wp_generate_password( 32, false );

		// 2. Prepare data for storage.
		$new_key = [
			'id'              => time(), // Use timestamp as a simple unique ID for this demo.
			'user_id'         => absint($user_id),
			'description'     => sanitize_text_field($description),
			'consumer_key'    => hash( 'sha256', $consumer_key ), // Store hashed version
			'consumer_secret' => wp_hash_password( $consumer_secret ), // Store hashed version
			'truncated_key'   => substr( $consumer_key, -7 ),
			'permissions'     => sanitize_text_field($permissions),
			'last_access'     => 'Unknown',
			'created_at'      => current_time( 'mysql' ),
		];

		$keys[] = $new_key;
		update_option( 'ayecode_framework_demo_api_keys', $keys );

		// 4. IMPORTANT: Return the UNHASHED keys for one-time display.
		return [
			'new_key_details' => $new_key,
			'consumer_key'    => $consumer_key,
			'consumer_secret' => $consumer_secret,
		];
	}

	/**
	 * Updates an existing key's metadata.
	 *
	 * @param int    $key_id      The ID of the key to update.
	 * @param string $description The new description.
	 * @param string $permissions The new permissions.
	 * @return array The updated key.
	 */
	public function update_key( $key_id, $description, $permissions ) {
		$keys = $this->get_keys();
		$updated_key = null;

		foreach ($keys as $index => $key) {
			if ($key['id'] == $key_id) {
				$keys[$index]['description'] = sanitize_text_field($description);
				$keys[$index]['permissions'] = sanitize_text_field($permissions);
				$updated_key = $keys[$index];
				break;
			}
		}

		update_option( 'ayecode_framework_demo_api_keys', $keys );
		return $updated_key;
	}

	/**
	 * Revokes (deletes) an API key.
	 *
	 * @param int $key_id The ID of the key to revoke.
	 * @return bool True on success.
	 */
	public function revoke_key( $key_id ) {
		$keys = $this->get_keys();
		$keys_after_deletion = [];

		foreach ($keys as $key) {
			if ($key['id'] != $key_id) {
				$keys_after_deletion[] = $key;
			}
		}

		update_option( 'ayecode_framework_demo_api_keys', $keys_after_deletion );
		return true;
	}
}