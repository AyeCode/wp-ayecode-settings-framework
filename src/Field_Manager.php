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
                // Handle boolean true as well as '1' or 'true'.
                return filter_var( $value, FILTER_VALIDATE_BOOLEAN ) ? 1 : 0;

            case 'multiselect':
            case 'checkbox_group':
                return is_array( $value ) ? array_map( 'sanitize_text_field', $value ) : [];

            case 'color':
                return sanitize_hex_color( $value );

            case 'image':
                return absint( $value ); // Sanitize as a positive integer (attachment ID).

            default:
                // Apply a default sanitization for any custom or unknown field types.
                return sanitize_text_field( $value );
        }
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
     * Validates a full array of settings against the configuration rules.
     * (This is a placeholder for future, more robust validation).
     *
     * @param array $settings The settings to validate.
     * @return true|\WP_Error True if valid, or a WP_Error object on failure.
     */
    public function validate_settings( $settings ) {
        // This method can be expanded with the validation logic from the original Ajax_Handler
        // to provide server-side validation before saving.
        // For now, we'll return true.
        return true;
    }
}