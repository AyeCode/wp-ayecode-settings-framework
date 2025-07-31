<?php
/**
 * AJAX Handler
 *
 * Handles AJAX requests for saving and resetting settings
 *
 * @package AyeCode\SettingsFramework
 */

namespace AyeCode\SettingsFramework;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class Ajax_Handler {

    /**
     * Framework instance
     * @var Settings_Framework
     */
    private $framework;

    /**
     * Constructor
     *
     * @param Settings_Framework $framework Framework instance
     */
    public function __construct($framework) {
        $this->framework = $framework;
    }

    /**
     * Handle save settings AJAX request
     */
    public function handle_save() {

        // Verify nonce
        if (!$this->verify_request()) {
            wp_send_json_error(array(
                'message' => __('Security check failed. Please refresh the page and try again.', 'ayecode-settings-framework')
            ));
        }

        // Get posted settings
        $posted_settings = isset($_POST['settings']) ? $_POST['settings'] : array();

        // Decode JSON if needed
        if (is_string($posted_settings)) {
            $posted_settings = json_decode(stripslashes($posted_settings), true);
        }

        if (!is_array($posted_settings)) {
            wp_send_json_error(array(
                'message' => __('Invalid settings data received.', 'ayecode-settings-framework')
            ));
        }

        // Validate settings before saving
        $validation_result = $this->validate_settings($posted_settings);

        if (is_wp_error($validation_result)) {
            wp_send_json_error(array(
                'message' => $validation_result->get_error_message(),
                'errors' => $validation_result->get_error_data()
            ));
        }

        // Save settings
        $save_result = $this->framework->save_settings($posted_settings);

        if ($save_result) {

            // Fire action for other plugins/themes to hook into
            do_action('ayecode_settings_framework_after_save', $posted_settings, $this->framework->get_option_name());

            wp_send_json_success(array(
                'message' => __('Settings saved successfully!', 'ayecode-settings-framework'),
                'settings' => $this->framework->get_settings()
            ));

        } else {
            wp_send_json_error(array(
                'message' => __('Failed to save settings. Please try again.', 'ayecode-settings-framework')
            ));
        }
    }

    /**
     * Handle reset settings AJAX request
     */
    public function handle_reset() {

        // Verify nonce
        if (!$this->verify_request()) {
            wp_send_json_error(array(
                'message' => __('Security check failed. Please refresh the page and try again.', 'ayecode-settings-framework')
            ));
        }

        // Reset settings to defaults
        $reset_result = $this->framework->reset_settings();

        if ($reset_result) {

            // Fire action for other plugins/themes to hook into
            do_action('ayecode_settings_framework_after_reset', $this->framework->get_option_name());

            wp_send_json_success(array(
                'message' => __('Settings reset to defaults successfully!', 'ayecode-settings-framework'),
                'settings' => $this->framework->get_settings()
            ));

        } else {
            wp_send_json_error(array(
                'message' => __('Failed to reset settings. Please try again.', 'ayecode-settings-framework')
            ));
        }
    }

    /**
     * Verify AJAX request security
     *
     * @return bool Request is valid
     */
    private function verify_request() {

        // Check user capabilities
        if (!current_user_can('manage_options')) {
            return false;
        }

        // Verify nonce
        $nonce = isset($_POST['nonce']) ? $_POST['nonce'] : '';

        if (!wp_verify_nonce($nonce, $this->framework->get_ajax_action())) {
            return false;
        }

        return true;
    }

    /**
     * Validate settings before saving
     *
     * @param array $settings Settings to validate
     * @return bool|WP_Error True if valid, WP_Error if invalid
     */
    private function validate_settings($settings) {

        $config = $this->framework->get_config();
        $errors = array();

        // Get field configuration map
        $field_map = $this->build_field_map($config);

        // Validate each setting
        foreach ($settings as $field_id => $value) {

            if (!isset($field_map[$field_id])) {
                continue; // Skip unknown fields
            }

            $field = $field_map[$field_id];
            $field_errors = $this->validate_field($field, $value);

            if (!empty($field_errors)) {
                $errors[$field_id] = $field_errors;
            }
        }

        // Check for required fields
        foreach ($field_map as $field_id => $field) {

            if (!empty($field['required']) && (!isset($settings[$field_id]) || empty($settings[$field_id]))) {

                $label = isset($field['label']) ? $field['label'] : $field_id;
                $errors[$field_id][] = sprintf(
                    __('%s is required.', 'ayecode-settings-framework'),
                    $label
                );
            }
        }

        if (!empty($errors)) {
            return new \WP_Error('validation_failed', __('Please fix the errors below:', 'ayecode-settings-framework'), $errors);
        }

        return true;
    }

    /**
     * Validate individual field
     *
     * @param array $field Field configuration
     * @param mixed $value Field value
     * @return array Validation errors
     */
    private function validate_field($field, $value) {

        $errors = array();
        $field_type = isset($field['type']) ? $field['type'] : 'text';

        // Skip validation if field is empty and not required
        if (empty($value) && empty($field['required'])) {
            return $errors;
        }

        // Type-specific validation
        switch ($field_type) {

            case 'email':
                if (!is_email($value)) {
                    $errors[] = __('Please enter a valid email address.', 'ayecode-settings-framework');
                }
                break;

            case 'url':
                if (!filter_var($value, FILTER_VALIDATE_URL)) {
                    $errors[] = __('Please enter a valid URL.', 'ayecode-settings-framework');
                }
                break;

            case 'number':
                if (!is_numeric($value)) {
                    $errors[] = __('Please enter a valid number.', 'ayecode-settings-framework');
                } else {
                    // Check min/max values
                    if (isset($field['min']) && $value < $field['min']) {
                        $errors[] = sprintf(__('Value must be at least %s.', 'ayecode-settings-framework'), $field['min']);
                    }
                    if (isset($field['max']) && $value > $field['max']) {
                        $errors[] = sprintf(__('Value must be no more than %s.', 'ayecode-settings-framework'), $field['max']);
                    }
                }
                break;

            case 'select':
            case 'radio':
                if (isset($field['options']) && !array_key_exists($value, $field['options'])) {
                    $errors[] = __('Please select a valid option.', 'ayecode-settings-framework');
                }
                break;

            case 'multiselect':
            case 'checkbox_group':
                if (!is_array($value)) {
                    $errors[] = __('Invalid selection.', 'ayecode-settings-framework');
                } else if (isset($field['options'])) {
                    foreach ($value as $selected_value) {
                        if (!array_key_exists($selected_value, $field['options'])) {
                            $errors[] = __('Please select valid options only.', 'ayecode-settings-framework');
                            break;
                        }
                    }
                }
                break;

            case 'color':
                if (!preg_match('/^#([a-f0-9]{6}|[a-f0-9]{3})$/i', $value)) {
                    $errors[] = __('Please enter a valid color code (e.g., #ffffff).', 'ayecode-settings-framework');
                }
                break;

            case 'file':
                // File type might still expect a URL
                if (!empty($value) && !wp_http_validate_url($value)) {
                    $errors[] = __('Please enter a valid file URL.', 'ayecode-settings-framework');
                }
                break;

            case 'image':
                // An empty value is valid (no image). If a value exists, it must be a valid attachment ID.
                if (!empty($value) && get_post_type(intval($value)) !== 'attachment') {
                    $errors[] = __('Please select a valid image from the media library.', 'ayecode-settings-framework');
                }
                break;
        }

        // Custom validation callback
        if (isset($field['validate_callback']) && is_callable($field['validate_callback'])) {

            $custom_result = call_user_func($field['validate_callback'], $value, $field);

            if (is_wp_error($custom_result)) {
                $errors[] = $custom_result->get_error_message();
            } elseif ($custom_result !== true) {
                $errors[] = __('Invalid value.', 'ayecode-settings-framework');
            }
        }

        // Length validation
        if (is_string($value)) {
            if (isset($field['min_length']) && strlen($value) < $field['min_length']) {
                $errors[] = sprintf(__('Must be at least %d characters long.', 'ayecode-settings-framework'), $field['min_length']);
            }
            if (isset($field['max_length']) && strlen($value) > $field['max_length']) {
                $errors[] = sprintf(__('Must be no more than %d characters long.', 'ayecode-settings-framework'), $field['max_length']);
            }
        }

        return $errors;
    }

    /**
     * Build field map from configuration
     *
     * @param array $config Configuration array
     * @return array Field ID => field config map
     */
    private function build_field_map($config) {

        $field_map = array();

        if (!isset($config['sections']) || !is_array($config['sections'])) {
            return $field_map;
        }

        foreach ($config['sections'] as $section) {

            // Handle regular section fields
            if (isset($section['fields']) && is_array($section['fields'])) {
                foreach ($section['fields'] as $field) {
                    if (isset($field['id'])) {
                        $field_map[$field['id']] = $field;
                    }
                }
            }

            // Handle subsection fields
            if (isset($section['subsections']) && is_array($section['subsections'])) {
                foreach ($section['subsections'] as $subsection) {
                    if (isset($subsection['fields']) && is_array($subsection['fields'])) {
                        foreach ($subsection['fields'] as $field) {
                            if (isset($field['id'])) {
                                $field_map[$field['id']] = $field;
                            }
                        }
                    }
                }
            }
        }

        return $field_map;
    }
}