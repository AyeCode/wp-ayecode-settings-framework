<?php
/**
 * Field Manager
 *
 * This class centralizes all logic related to processing, sanitizing,
 * and validating the fields defined in a configuration array. It is
 * decoupled from the main framework class to be potentially reusable
 * in other contexts, like meta boxes or setup wizards.
 *
 * @package AyeCode\SettingsFramework
 */

namespace AyeCode\SettingsFramework;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Field_Manager {

	/**
	 * A reference to the main framework instance.
	 *
	 * @var Settings_Framework
	 */
	private $framework;

	/**
	 * Cached field map to prevent redundant processing.
	 *
	 * @var array|null
	 */
	private $field_map = null;

	/**
	 * Constructor.
	 *
	 * @param Settings_Framework $framework The main framework instance.
	 */
	public function __construct( Settings_Framework $framework ) {
		$this->framework = $framework;
	}

	/**
	 * Builds a flattened, associative array of all fields for quick lookups.
	 * The result is cached for performance.
	 *
	 * @return array A map of [field_id => field_config].
	 */
	public function get_field_map() {
		if ( ! is_null( $this->field_map ) ) {
			return $this->field_map;
		}

		$this->field_map = [];
		$config          = $this->framework->get_config_raw();

		if ( empty( $config['sections'] ) || ! is_array( $config['sections'] ) ) {
			return [];
		}

		foreach ( $config['sections'] as $section ) {
			// Also add the section itself if it's a special type like form_builder
			if ( isset( $section['type'] ) && $section['type'] === 'form_builder' ) {
				$this->field_map[ $section['id'] ] = $section;
			}

			// Fields directly in a section
			if ( ! empty( $section['fields'] ) && is_array( $section['fields'] ) ) {
				$this->extract_fields_from_array( $section['fields'], $this->field_map );
			}
			// Fields within subsections
			if ( ! empty( $section['subsections'] ) && is_array( $section['subsections'] ) ) {
				foreach ( $section['subsections'] as $subsection ) {
					if ( ! empty( $subsection['fields'] ) && is_array( $subsection['fields'] ) ) {
						$this->extract_fields_from_array( $subsection['fields'], $this->field_map );
					}
				}
			}
		}

		return $this->field_map;
	}

	/**
	 * Helper function to recursively extract fields from config arrays.
	 *
	 * @param array $fields_array The array of fields to process.
	 * @param array $field_map    The map to add fields to (passed by reference).
	 */
	private function extract_fields_from_array( $fields_array, &$field_map ) {
		foreach ( $fields_array as $field ) {
			// If it's a group, recurse into its fields.
			if ( isset( $field['type'] ) && $field['type'] === 'group' && ! empty( $field['fields'] ) ) {
				$this->extract_fields_from_array( $field['fields'], $field_map );
			} elseif ( ! empty( $field['id'] ) ) {
				// Otherwise, add the field to the map by its ID.
				$field_map[ $field['id'] ] = $field;
			}
		}
	}

	/**
	 * Sanitizes and prepares the settings array for saving.
	 * It ensures that only defined fields are saved and handles "falsey" values for
	 * unchecked boxes and empty multi-selects.
	 *
	 * @param array $new_settings     The raw settings submitted from the form.
	 * @param array $current_settings The existing settings from the database.
	 *
	 * @return array The fully sanitized and merged settings array, ready for update_option().
	 */
	public function sanitize_and_prepare_settings( $new_settings, $current_settings ) {
		$field_map = $this->get_field_map();

		foreach ( $field_map as $key => $field_config ) {
			// If a new value was submitted for this field, sanitize and use it.
			if ( isset( $new_settings[ $key ] ) ) {
				$current_settings[ $key ] = $this->sanitize_field_value( $new_settings[ $key ], $field_config['type'] );
			} else {
				// If the key is absent from submitted data, it might be an unchecked box.
				// We must explicitly set its value to 'off' or empty.
				$type = $field_config['type'];
				if ( $type === 'checkbox' || $type === 'toggle' ) {
					$current_settings[ $key ] = 0;
				} elseif ( $type === 'multiselect' || $type === 'checkbox_group' ) {
					$current_settings[ $key ] = [];
				}
			}
		}

		return $current_settings;
	}


	/**
	 * Sanitizes a single field's value based on its type.
	 *
	 * @param mixed  $value      The raw value.
	 * @param string $field_type The field's type from the config.
	 * @return mixed The sanitized value.
	 */
	private function sanitize_field_value( $value, $field_type ) {
		switch ( $field_type ) {
			case 'text':
			case 'password':
			case 'hidden':
			case 'select':
			case 'radio':
			case 'google_api_key':
				return sanitize_text_field( $value );

			case 'textarea':
				return sanitize_textarea_field( $value );

			case 'email':
				return sanitize_email( $value );

			case 'url':
				return esc_url_raw( $value );

			case 'number':
			case 'range':
				return is_numeric( $value ) ? (float) $value : 0;

			case 'checkbox':
			case 'toggle':
				return filter_var( $value, FILTER_VALIDATE_BOOLEAN ) ? 1 : 0;

			case 'multiselect':
			case 'checkbox_group':
				return is_array( $value ) ? array_map( 'sanitize_text_field', $value ) : [];

			case 'color':
				return sanitize_hex_color( $value );

			case 'image':
				return absint( $value );

			case 'form_builder':
				return $this->sanitize_form_builder_fields( $value );

			default:
				return sanitize_text_field( $value );
		}
	}

	/**
	 * Recursively sanitizes the fields from the form builder.
	 *
	 * @param array $fields The array of field objects from the builder.
	 * @return array The sanitized array of field objects.
	 */
	private function sanitize_form_builder_fields( $fields ) {
		$sanitized_fields = [];
		if ( ! is_array( $fields ) ) {
			return $sanitized_fields;
		}

		foreach ( $fields as $field ) {
			$sanitized_field = [];
			if ( ! is_array( $field ) ) {
				continue;
			}

			// Sanitize common properties
			if ( isset( $field['type'] ) ) {
				$sanitized_field['type'] = sanitize_text_field( $field['type'] );
			}
			if ( isset( $field['label'] ) ) {
				$sanitized_field['label'] = sanitize_text_field( $field['label'] );
			}
			if ( isset( $field['key'] ) ) {
				$sanitized_field['key'] = sanitize_key( $field['key'] );
			}
			if ( isset( $field['template_id'] ) ) {
				$sanitized_field['template_id'] = sanitize_key( $field['template_id'] );
			}
			if ( isset( $field['icon'] ) ) {
				$sanitized_field['icon'] = sanitize_text_field( $field['icon'] );
			}
			if ( isset( $field['description'] ) ) {
				$sanitized_field['description'] = sanitize_textarea_field( $field['description'] );
			}
			if ( isset( $field['placeholder'] ) ) {
				$sanitized_field['placeholder'] = sanitize_text_field( $field['placeholder'] );
			}
			if ( isset( $field['is_required'] ) ) {
				$sanitized_field['is_required'] = (bool) $field['is_required'];
			}
			if ( isset( $field['_uid'] ) ) {
				if (is_string($field['_uid']) && strpos($field['_uid'], 'new_') === 0) {
					$sanitized_field['_uid'] = sanitize_text_field($field['_uid']);
				} else {
					$sanitized_field['_uid'] = absint($field['_uid']);
				}
			}
			if ( isset( $field['_parent_id'] ) ) {
				if (is_string($field['_parent_id']) && strpos($field['_parent_id'], 'new_') === 0) {
					$sanitized_field['_parent_id'] = sanitize_text_field($field['_parent_id']);
				} else {
					$sanitized_field['_parent_id'] = absint($field['_parent_id']);
				}
			}
			if ( isset( $field['is_new'] ) ) {
				$sanitized_field['is_new'] = (bool) $field['is_new'];
			}

			// Sanitize our new conditions property
			if ( isset( $field['conditions'] ) && is_array( $field['conditions'] ) ) {
				$sanitized_field['conditions'] = $this->sanitize_conditions( $field['conditions'] );
			}

			// Handle nested fields for 'group' types
			if ( isset( $field['type'] ) && $field['type'] === 'group' && isset( $field['fields'] ) ) {
				$sanitized_field['fields'] = $this->sanitize_form_builder_fields( $field['fields'] );
			}

			if ( isset( $field['options'] ) ) {
				if (is_array( $field['options'])) {
					$sanitized_options = [];
					foreach ( $field['options'] as $key => $value ) {
						$sanitized_options[ sanitize_key( $key ) ] = sanitize_text_field( $value );
					}
					$sanitized_field['options'] = $sanitized_options;
				} else {
					$sanitized_field['options'] = sanitize_textarea_field($field['options']);
				}

			}


			$sanitized_fields[] = $sanitized_field;
		}

		return $sanitized_fields;
	}

	/**
	 * Sanitizes the conditional logic rules array.
	 *
	 * @param array $conditions The raw conditions array.
	 * @return array The sanitized conditions array.
	 */
	private function sanitize_conditions( $conditions ) {
		$sanitized_conditions = [];
		if ( ! is_array( $conditions ) ) {
			return $sanitized_conditions;
		}

		foreach ( $conditions as $condition ) {
			if ( ! is_array( $condition ) ) {
				continue;
			}
			$clean_condition = [];
			if ( isset( $condition['action'] ) ) {
				$clean_condition['action'] = sanitize_text_field( $condition['action'] );
			}
			if ( isset( $condition['field'] ) ) {
				$clean_condition['field'] = sanitize_text_field( $condition['field'] );
			}
			if ( isset( $condition['condition'] ) ) {
				$clean_condition['condition'] = sanitize_text_field( $condition['condition'] );
			}
			if ( isset( $condition['value'] ) ) {
				$clean_condition['value'] = sanitize_text_field( $condition['value'] );
			}
			$sanitized_conditions[] = $clean_condition;
		}

		return $sanitized_conditions;
	}


	/**
	 * Gathers all default values from the configuration.
	 *
	 * @return array An array of [field_id => default_value].
	 */
	public function get_default_settings() {
		$defaults  = [];
		$field_map = $this->get_field_map();

		foreach ( $field_map as $field_id => $field ) {
			if ( isset( $field['default'] ) ) {
				$defaults[ $field_id ] = $field['default'];
			}
		}

		return $defaults;
	}

	/**
	 * Validates an array of form builder fields to ensure a specified key is unique.
	 *
	 * @param array  $fields The array of field objects from the form builder.
	 * @param string $unique_key_prop The property to check for uniqueness (e.g., 'key').
	 * @return true|\WP_Error True if all keys are unique, otherwise a WP_Error object.
	 */
	public function validate_form_builder_fields( $fields, $unique_key_prop ) {
		if ( empty( $unique_key_prop ) || ! is_array( $fields ) ) {
			return true; // No uniqueness rule defined, or not a valid field array.
		}

		$keys = [];
		foreach ( $fields as $field ) {
			if ( isset( $field[$unique_key_prop] ) && ! empty( $field[$unique_key_prop] ) ) {
				$key_value = $field[$unique_key_prop];
				if ( in_array( $key_value, $keys, true ) ) {
					return new \WP_Error(
						'duplicate_field_key',
						sprintf(
							__( 'Save failed. The field key "%s" is used more than once. Field keys must be unique.', 'ayecode-connect' ),
							esc_html( $key_value )
						)
					);
				}
				$keys[] = $key_value;
			}
		}
		return true;
	}

	/**
	 * Validates a full array of settings against the configuration rules.
	 *
	 * @param array $settings The settings to validate.
	 * @return true|\WP_Error True if valid, or a WP_Error object on failure.
	 */
	public function validate_settings( $settings ) {
		$field_map = $this->get_field_map();

		foreach ($settings as $setting_key => $setting_value) {
			if (isset($field_map[$setting_key]) && $field_map[$setting_key]['type'] === 'form_builder') {

				// Get the unique key property from the config, default to 'key' for safety.
				$unique_key_prop = isset($field_map[$setting_key]['unique_key_property']) ? $field_map[$setting_key]['unique_key_property'] : 'key';

				$result = $this->validate_form_builder_fields($setting_value, $unique_key_prop);

				if (is_wp_error($result)) {
					return $result;
				}
			}
		}

		return true;
	}
}