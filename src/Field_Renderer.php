<?php
/**
 * Field Renderer
 *
 * Utility class for field rendering helpers.
 * Most rendering is done in JavaScript, but this provides PHP utilities.
 *
 * @package AyeCode\SettingsFramework
 */

namespace AyeCode\SettingsFramework;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class Field_Renderer {

    /**
     * Get supported field types
     *
     * @return array Supported field types with their configurations
     */
    public static function get_supported_field_types() {

        return array(
            'text' => array(
                'label' => __('Text Input', 'ayecode-connect'),
                'description' => __('Single line text input', 'ayecode-connect')
            ),
            'password' => array(
                'label' => __('Password', 'ayecode-connect'),
                'description' => __('Password input (hidden text)', 'ayecode-connect')
            ),
            'textarea' => array(
                'label' => __('Textarea', 'ayecode-connect'),
                'description' => __('Multi-line text input', 'ayecode-connect')
            ),
            'number' => array(
                'label' => __('Number', 'ayecode-connect'),
                'description' => __('Numeric input with validation', 'ayecode-connect')
            ),
            'email' => array(
                'label' => __('Email', 'ayecode-connect'),
                'description' => __('Email input with validation', 'ayecode-connect')
            ),
            'url' => array(
                'label' => __('URL', 'ayecode-connect'),
                'description' => __('URL input with validation', 'ayecode-connect')
            ),
            'checkbox' => array(
                'label' => __('Checkbox', 'ayecode-connect'),
                'description' => __('Single checkbox (true/false)', 'ayecode-connect')
            ),
            'toggle' => array(
                'label' => __('Toggle Switch', 'ayecode-connect'),
                'description' => __('Modern toggle switch (true/false)', 'ayecode-connect')
            ),
            'radio' => array(
                'label' => __('Radio Buttons', 'ayecode-connect'),
                'description' => __('Single selection from multiple options', 'ayecode-connect')
            ),
            'select' => array(
                'label' => __('Select Dropdown', 'ayecode-connect'),
                'description' => __('Dropdown selection', 'ayecode-connect')
            ),
            'multiselect' => array(
                'label' => __('Multi-Select', 'ayecode-connect'),
                'description' => __('Multiple selection dropdown', 'ayecode-connect')
            ),
            'checkbox_group' => array(
                'label' => __('Checkbox Group', 'ayecode-connect'),
                'description' => __('Multiple checkboxes for multiple selections', 'ayecode-connect')
            ),
            'color' => array(
                'label' => __('Color Picker', 'ayecode-connect'),
                'description' => __('Color selection with picker', 'ayecode-connect')
            ),
            'file' => array(
                'label' => __('File Upload', 'ayecode-connect'),
                'description' => __('File upload with media library', 'ayecode-connect')
            ),
            'image' => array(
                'label' => __('Image Upload', 'ayecode-connect'),
                'description' => __('Image upload with preview', 'ayecode-connect')
            ),
            'range' => array(
                'label' => __('Range Slider', 'ayecode-connect'),
                'description' => __('Numeric range with slider', 'ayecode-connect')
            ),
            'date' => array(
                'label' => __('Date Picker', 'ayecode-connect'),
                'description' => __('Date selection', 'ayecode-connect')
            ),
            'time' => array(
                'label' => __('Time Picker', 'ayecode-connect'),
                'description' => __('Time selection', 'ayecode-connect')
            ),
            'datetime' => array(
                'label' => __('DateTime Picker', 'ayecode-connect'),
                'description' => __('Date and time selection', 'ayecode-connect')
            ),
            'accordion' => array(
	            'label' => __('Accordion', 'ayecode-connect'),
	            'description' => __('A collapsible container for field groups.', 'ayecode-connect')
            ),
            'group' => array(
                'label' => __('Field Group', 'ayecode-connect'),
                'description' => __('Group of fields with collapsible header', 'ayecode-connect')
            ),
            'repeater' => array(
                'label' => __('Repeater', 'ayecode-connect'),
                'description' => __('Repeatable group of fields', 'ayecode-connect')
            ),
            'html' => array(
                'label' => __('Custom HTML', 'ayecode-connect'),
                'description' => __('Custom HTML content', 'ayecode-connect')
            ),
            'separator' => array(
                'label' => __('Separator', 'ayecode-connect'),
                'description' => __('Visual separator line', 'ayecode-connect')
            ),
            'heading' => array(
                'label' => __('Heading', 'ayecode-connect'),
                'description' => __('Section heading', 'ayecode-connect')
            )
        );
    }

    /**
     * Validate field configuration
     *
     * @param array $field Field configuration
     * @return bool|WP_Error True if valid, WP_Error if invalid
     */
    public static function validate_field_config($field) {

        // Required properties
        $required_props = array('id', 'type');

        foreach ($required_props as $prop) {
            if (!isset($field[$prop]) || empty($field[$prop])) {
                return new \WP_Error(
                    'missing_property',
                    sprintf(__('Field is missing required property: %s', 'ayecode-connect'), $prop)
                );
            }
        }

        // Validate field type
        $supported_types = array_keys(self::get_supported_field_types());

        if (!in_array($field['type'], $supported_types, true)) {
            return new \WP_Error(
                'invalid_field_type',
                sprintf(__('Unsupported field type: %s', 'ayecode-connect'), $field['type'])
            );
        }

        // Validate field ID format
        if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $field['id'])) {
            return new \WP_Error(
                'invalid_field_id',
                __('Field ID must contain only letters, numbers, and underscores, and cannot start with a number.', 'ayecode-connect')
            );
        }

        // Type-specific validation
        switch ($field['type']) {

            case 'select':
            case 'radio':
            case 'multiselect':
            case 'checkbox_group':
                if (!isset($field['options']) || !is_array($field['options']) || empty($field['options'])) {
                    return new \WP_Error(
                        'missing_options',
                        sprintf(__('Field type "%s" requires an "options" array.', 'ayecode-connect'), $field['type'])
                    );
                }
                break;

            case 'number':
            case 'range':
                if (isset($field['min']) && isset($field['max']) && $field['min'] > $field['max']) {
                    return new \WP_Error(
                        'invalid_range',
                        __('Minimum value cannot be greater than maximum value.', 'ayecode-connect')
                    );
                }
                break;

            case 'group':
            case 'repeater':
                if (!isset($field['fields']) || !is_array($field['fields']) || empty($field['fields'])) {
                    return new \WP_Error(
                        'missing_fields',
                        sprintf(__('Field type "%s" requires a "fields" array.', 'ayecode-connect'), $field['type'])
                    );
                }
                break;
        }

        return true;
    }

    /**
     * Get default value for field type
     *
     * @param string $field_type Field type
     * @return mixed Default value
     */
    public static function get_default_value($field_type) {

        switch ($field_type) {
            case 'checkbox':
            case 'toggle':
                return false;

            case 'multiselect':
            case 'checkbox_group':
                return array();

            case 'number':
            case 'range':
                return 0;

            case 'color':
                return '#ffffff';

            default:
                return '';
        }
    }

    /**
     * Generate field searchable terms
     *
     * @param array $field Field configuration
     * @return array Searchable terms
     */
    public static function generate_searchable_terms($field) {

        $terms = array();

        // Add label
        if (isset($field['label'])) {
            $terms[] = strtolower($field['label']);
        }

        // Add description
        if (isset($field['description'])) {
            $terms[] = strtolower($field['description']);
        }

        // Add field ID (convert underscores to spaces)
        if (isset($field['id'])) {
            $terms[] = strtolower(str_replace('_', ' ', $field['id']));
        }

        // Add custom searchable terms
        if (isset($field['searchable']) && is_array($field['searchable'])) {
            foreach ($field['searchable'] as $term) {
                $terms[] = strtolower($term);
            }
        }

        // Add option labels for select fields
        if (isset($field['options']) && is_array($field['options'])) {
            foreach ($field['options'] as $value => $label) {
                $terms[] = strtolower($label);
            }
        }

        // Add type-specific terms
        switch ($field['type']) {
            case 'toggle':
                $terms[] = 'switch';
                $terms[] = 'enable';
                $terms[] = 'disable';
                break;

            case 'color':
                $terms[] = 'colour';
                $terms[] = 'picker';
                break;

            case 'image':
            case 'file':
                $terms[] = 'upload';
                $terms[] = 'media';
                break;

            case 'email':
                $terms[] = 'mail';
                $terms[] = 'address';
                break;

            case 'url':
                $terms[] = 'link';
                $terms[] = 'website';
                break;
        }

        // Remove duplicates and empty terms
        $terms = array_filter(array_unique($terms));

        return $terms;
    }

    /**
     * Convert field configuration to JavaScript-friendly format
     *
     * @param array $field Field configuration
     * @return array JavaScript-friendly field config
     */
    public static function prepare_field_for_js($field) {

        $js_field = $field;

        // Ensure searchable terms are generated
        if (!isset($js_field['searchable'])) {
            $js_field['searchable'] = self::generate_searchable_terms($field);
        }

        // Add default value if not set
        if (!isset($js_field['default'])) {
            $js_field['default'] = self::get_default_value($field['type']);
        }

        // Convert callback functions to strings (they'll be handled in PHP)
        if (isset($js_field['validate_callback'])) {
            $js_field['has_validation'] = true;
            unset($js_field['validate_callback']); // Remove callback from JS
        }

        // Convert options callback to actual options
        if (isset($js_field['options']) && is_string($js_field['options'])) {
            if (function_exists($js_field['options'])) {
                $js_field['options'] = call_user_func($js_field['options']);
            } else {
                $js_field['options'] = array();
            }
        }

        return $js_field;
    }

    /**
     * Get WordPress roles for select options
     *
     * @return array Role options
     */
    public static function get_wp_roles_options() {

        $roles = array();

        if (function_exists('wp_roles')) {
            $wp_roles = wp_roles();
            foreach ($wp_roles->roles as $role_key => $role_info) {
                $roles[$role_key] = $role_info['name'];
            }
        }

        return $roles;
    }

    /**
     * Get WordPress pages for select options
     *
     * @return array Page options
     */
    public static function get_wp_pages_options() {

        $pages = array('' => __('Select a page...', 'ayecode-connect'));

        $wp_pages = get_pages(array(
            'sort_column' => 'post_title',
            'sort_order' => 'ASC'
        ));

        foreach ($wp_pages as $page) {
            $pages[$page->ID] = $page->post_title;
        }

        return $pages;
    }

    /**
     * Get WordPress categories for select options
     *
     * @param string $taxonomy Taxonomy name
     * @return array Category options
     */
    public static function get_wp_terms_options($taxonomy = 'category') {

        $terms = array('' => __('Select a category...', 'ayecode-connect'));

        $wp_terms = get_terms(array(
            'taxonomy' => $taxonomy,
            'hide_empty' => false
        ));

        if (!is_wp_error($wp_terms)) {
            foreach ($wp_terms as $term) {
                $terms[$term->term_id] = $term->name;
            }
        }

        return $terms;
    }
}