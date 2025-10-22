<?php
/**
 * System Status Handler
 *
 * Gathers system information and generates the HTML report for the settings framework.
 * Uses Bootstrap 5.3+ classes and works with a global JavaScript function for copying.
 *
 * @package AyeCode\SettingsFramework
 */

namespace AyeCode\SettingsFramework;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class System_Status_Handler
 *
 * Responsible for collecting and rendering system status information.
 */
class System_Status_Handler {

    /**
     * Reference to the main framework instance (optional, if needed for context).
     * @var Settings_Framework|null
     */
    private $framework;

    /**
     * Constructor
     * @param Settings_Framework|null $framework The calling framework instance.
     */
    public function __construct( Settings_Framework $framework = null ) {
        $this->framework = $framework;
    }

    /**
     * Main method to generate the complete HTML for the status page.
     * @return string The generated HTML.
     */
    public function generate_html() {
        // --- Gather Status Data ---
        // These methods need to be filled with your actual data fetching logic
        $environment      = $this->get_environment_info();
        $database         = $this->get_database_info();
        $post_type_counts = $this->get_post_type_counts();
        $active_plugins   = $this->get_active_plugins();
        $theme            = $this->get_theme_info();
        $security         = $this->get_security_info();
        $settings         = $this->get_framework_settings(); // Example framework settings
        $pages            = $this->get_framework_pages();    // Example framework pages

        // --- Prepare Sections Array (using raw data) ---
        $status_sections = [];

        // Environment Section (WordPress Specific)
        $wp_environment_data = [
                'Home URL'          => $environment['home_url'] ?? 'N/A',
                'Site URL'          => $environment['site_url'] ?? 'N/A',
                'WP Version'        => $environment['wp_version'] ?? 'N/A',
                'WP Multisite'      => $environment['wp_multisite'] ?? false,
                'WP Memory Limit'   => $environment['wp_memory_limit'] ?? 0,
                'WP Debug Mode'     => $environment['wp_debug_mode'] ?? false,
                'WP Cron'           => $environment['wp_cron'] ?? false,
                'Language'          => $environment['language'] ?? 'N/A',
        ];
        $status_sections['environment'] = [
                'title' => __( 'WordPress Environment', 'ayecode-connect' ),
                'icon'  => 'fa-brands fa-wordpress',
                'data'  => $wp_environment_data,
                'debug_data' => $wp_environment_data // Use separated data for consistency in copy
        ];

        // Server Section (Server Specific)
        $server_environment_data = [
                'Server Info'          => $environment['server_info'] ?? 'N/A',
                'PHP Version'          => $environment['php_version'] ?? 'N/A',
                'PHP Post Max Size'    => $environment['php_post_max_size'] ?? 0,
                'PHP Time Limit'       => $environment['php_max_execution_time'] ?? 'N/A',
                'PHP Max Input Vars'   => $environment['php_max_input_vars'] ?? 'N/A',
                'cURL Version'         => $environment['curl_version'] ?? 'N/A',
                'SUHOSIN Installed'    => $environment['suhosin_installed'] ?? false,
                'MySQL Version'        => $environment['mysql_version'] ?? 'N/A',
                'Max Upload Size'      => $environment['max_upload_size'] ?? 0,
                'Default Timezone'     => $environment['default_timezone'] ?? 'UTC',
                'fsockopen/cURL'       => $environment['fsockopen_or_curl_enabled'] ?? false,
                'SoapClient'           => $environment['soapclient_enabled'] ?? false,
                'DOMDocument'          => $environment['domdocument_enabled'] ?? false,
                'GZip'                 => $environment['gzip_enabled'] ?? false,
                'Multibyte String'     => $environment['mbstring_enabled'] ?? false,
                'Remote Post Status'   => $environment['remote_post_successful'] ?? false,
            // Include response codes/errors separately for debug_data, combine for display
                'Remote Post Response' => $environment['remote_post_response'] ?? 'N/A',
                'Remote Get Status'    => $environment['remote_get_successful'] ?? false,
                'Remote Get Response'  => $environment['remote_get_response'] ?? 'N/A',
        ];
        $status_sections['server'] = [
                'title' => __( 'Server Environment', 'ayecode-connect' ),
                'icon'  => 'fa-solid fa-server',
                'data'  => $server_environment_data, // Use the separated data for display rendering
                'debug_data' => $environment // Keep the combined data for full debug report copy/paste
        ];

        // Database Section
        $status_sections['database'] = [
                'title' => __( 'Database', 'ayecode-connect' ),
                'icon'  => 'fa-solid fa-database',
                'data'  => $database, // Pass raw DB info array
                'debug_data' => $database
        ];

        // Post Type Counts Section
        $status_sections['post_types'] = [
                'title' => __( 'Post Type Counts', 'ayecode-connect' ),
                'icon' => 'fa-solid fa-file-lines',
                'data' => $post_type_counts, // Pass raw post type array
                'debug_data' => $post_type_counts
        ];

        // Active Plugins Section
        $status_sections['active_plugins'] = [
                'title' => sprintf( __( 'Active Plugins (%d)', 'ayecode-connect' ), count( $active_plugins ) ),
                'icon'  => 'fa-solid fa-plug',
                'data'  => $active_plugins, // Pass raw plugin array
                'debug_data' => $active_plugins
        ];

        // Theme Section
        $status_sections['theme'] = [
                'title' => __( 'Theme', 'ayecode-connect' ),
                'icon'  => 'fa-solid fa-palette',
                'data'  => $theme, // Pass raw theme array
                'debug_data' => $theme
        ];

        // Security Section
        $status_sections['security'] = [
                'title' => __( 'Security', 'ayecode-connect' ),
                'icon' => 'fa-solid fa-shield-halved',
                'data' => $security, // Pass raw security array
                'debug_data' => $security
        ];

        // Framework/Plugin Settings Section
        $status_sections['settings'] = [
                'title' => __( 'Framework Settings', 'ayecode-connect' ),
                'icon' => 'fa-solid fa-sliders',
                'data' => $settings, // Pass raw settings array
                'debug_data' => $settings
        ];

        // Framework/Plugin Pages Section
        $status_sections['pages'] = [
                'title' => __( 'Framework Pages', 'ayecode-connect' ),
                'icon' => 'fa-solid fa-file-invoice',
                'data' => $pages, // Pass raw pages array
                'debug_data' => $pages
        ];


        // --- Allow Extensions to Add Sections ---
        $status_sections = apply_filters( 'ayecode_sf_system_status_sections', $status_sections, $this->framework );

        // --- Generate HTML ---
        ob_start();
        ?>
        <div class="mb-4 d-flex justify-content-between align-items-center">
            <p class="text-muted m-0"><?php esc_html_e( 'Please include this information when requesting support.', 'ayecode-connect' ); ?></p>
            <?php // Button calls the global JS function ?>
            <button id="asf-copy-status-report" class="btn btn-primary btn-sm" onclick="window.asfCopyStatusReport(this)">
                <i class="fa-solid fa-copy me-2"></i><?php esc_html_e( 'Copy for Support', 'ayecode-connect' ); ?>
            </button>
        </div>

        <div class="row g-4">
            <?php foreach ( $status_sections as $section_key => $section ) : ?>
                <div class="col-12"> <?php // Sections are full width ?>
                    <div class="card h-100 mw-100 p-0 shadow-sm">
                        <div class="card-header bg-light-subtle d-flex align-items-center">
                            <?php if ( ! empty( $section['icon'] ) ): ?> <i class="<?php echo esc_attr( $section['icon'] ); ?> fa-fw me-2 text-muted"></i> <?php endif; ?>
                            <h6 class="fw-bold mb-0 flex-grow-1"><?php echo esc_html( $section['title'] ); ?></h6>
                        </div>
                        <div class="card-body">
                            <?php if ( ! empty( $section['description'] ) ): ?> <p class="card-text text-muted small mb-3"><?php echo esc_html( $section['description'] ); ?></p> <?php endif; ?>
                            <dl class="row mb-0">
                                <?php echo $this->render_status_section_data($section_key, $section['data']); // Use the helper ?>
                            </dl>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <?php // Textarea for copying (hidden but accessible) ?>
        <textarea id="asf-status-report-textarea" class="visually-hidden" readonly aria-hidden="true" style="position: fixed; top: -9999px; left: -9999px; opacity: 0; pointer-events: none;"></textarea>

        <?php // Embed data for JS ?>
        <script type="application/json" id="asf-status-report-data">
            <?php echo wp_json_encode( $status_sections ); // Embeds all sections, including debug data ?>
        </script>
        <?php
        return ob_get_clean();
    } // End generate_html()


    /**
     * Helper function to render the <dt> and <dd> for a section's data.
     * Handles specific formatting and linking based on section key and data keys.
     * @param string $section_key The key identifying the section (e.g., 'environment', 'active_plugins').
     * @param mixed $section_data Raw data for the section.
     * @return string HTML output.
     */
    private function render_status_section_data( $section_key, $section_data ) {
        if (!is_array($section_data) && !is_object($section_data)) {
            return '<dt class="col-12">Invalid data for this section.</dt>';
        }

        ob_start();
        // Use array cast for safety, especially with object data like post_types
        $data_to_render = is_object($section_data) ? (array) $section_data : $section_data;

        switch ($section_key) {
            case 'environment': // Renders ONLY WP keys from the $wp_environment_data passed in $section_data
            case 'server': // Renders ONLY Server keys from the $server_environment_data passed in $section_data
                foreach ($data_to_render as $key => $value) {
                    // Skip combined response fields if status exists (only relevant if rendering the 'server' section data)
                    if ($key === 'Remote Post Response' && isset($data_to_render['Remote Post Status'])) continue;
                    if ($key === 'Remote Get Response' && isset($data_to_render['Remote Get Status'])) continue;

                    echo '<dt class="col-sm-5 text-muted fw-normal border-bottom pb-2 mb-2">' . esc_html( $this->format_key_for_display($key) ) . '</dt>';
                    echo '<dd class="col-sm-7 border-bottom pb-2 mb-2">';
                    // Apply formatting based on key - Apply ALL relevant formatting here
                    switch ($key) {
                        case 'WP Memory Limit': echo wp_kses_post($this->format_memory_limit($value)); break;
                        case 'WP Debug Mode': echo $value ? '<span class="badge bg-warning-subtle text-warning-emphasis">Active</span>' : '<span class="badge bg-success-subtle text-success-emphasis">Inactive</span>'; break;
                        case 'WP Cron': echo $value ? '<span class="badge bg-success-subtle text-success-emphasis">Enabled</span>' : '<span class="badge bg-warning-subtle text-warning-emphasis">Disabled</span>'; break;
                        case 'WP Multisite':
                        case 'SUHOSIN Installed': echo $value ? '<span class="badge bg-success-subtle text-success-emphasis">Yes</span>' : '<span class="badge bg-secondary-subtle text-secondary-emphasis">No</span>'; break;
                        case 'PHP Version': echo wp_kses_post($this->format_php_version($value)); break;
                        case 'MySQL Version': echo wp_kses_post($this->format_mysql_version($value)); break;
                        case 'Default Timezone': echo wp_kses_post($this->format_default_timezone($value)); break;
                        case 'PHP Post Max Size':
                        case 'Max Upload Size': echo size_format($value); break;
                        case 'PHP Time Limit': echo esc_html($value) . 's'; break;
                        case 'fsockopen/cURL': // Use slash version for display
                        case 'SoapClient':
                        case 'DOMDocument':
                        case 'GZip':
                        case 'Multibyte String': echo $value ? '<span class="badge bg-success-subtle text-success-emphasis">Enabled</span>' : '<span class="badge bg-danger-subtle text-danger-emphasis">Disabled</span>'; break;
                        case 'Remote Post Status':
                        case 'Remote Get Status':
                            $response_key = str_replace(' Status', ' Response', $key); // Use space version for lookup
                            $response_val = $data_to_render[$response_key] ?? 'N/A';
                            echo $value ? '<span class="badge bg-success-subtle text-success-emphasis">OK</span>' : '<span class="badge bg-danger-subtle text-danger-emphasis">Failed</span> (' . esc_html($response_val) .')';
                            break;
                        default: echo esc_html($value); break; // Default for WP Version, Language, Server Info etc.
                    }
                    echo '</dd>';
                }
                break;

            case 'database':
                echo '<dt class="col-sm-5 text-muted fw-normal border-bottom pb-2 mb-2">Database Prefix</dt>';
                echo '<dd class="col-sm-7 border-bottom pb-2 mb-2">' . esc_html($data_to_render['database_prefix'] ?? 'N/A') . '</dd>';
                $total_size = $data_to_render['database_size'] ?? ['data' => 0, 'index' => 0];
                echo '<dt class="col-sm-5 text-muted fw-normal border-bottom pb-2 mb-2">Total Database Size</dt>';
                echo '<dd class="col-sm-7 border-bottom pb-2 mb-2">' . sprintf('%.2fMB', ($total_size['data'] ?? 0) + ($total_size['index'] ?? 0)) . '</dd>';
                $tables_data = $data_to_render['database_tables'] ?? [];
                $this->render_db_tables_html('Framework Tables', $tables_data['framework'] ?? []);
                $this->render_db_tables_html('Other Tables', $tables_data['other'] ?? []);
                break;

            case 'post_types':
                if (empty($data_to_render) || !is_array($data_to_render)) {
                    echo '<dt class="col-12">No post type data available.</dt>';
                } else {
                    // Sort alphabetically by type before display
                    usort($data_to_render, function ($a, $b) {
                        return strcmp($a->type ?? '', $b->type ?? '');
                    });
                    foreach ($data_to_render as $post_type) {
                        if (!is_object($post_type) || !isset($post_type->type)) continue;
                        echo '<dt class="col-sm-5 text-muted fw-normal border-bottom pb-2 mb-2">' . esc_html($post_type->type) . '</dt>';
                        echo '<dd class="col-sm-7 border-bottom pb-2 mb-2">' . number_format_i18n(absint($post_type->count)) . '</dd>';
                    }
                }
                break;

            case 'active_plugins':
                if (empty($data_to_render) || !is_array($data_to_render)) {
                    echo '<dt class="col-12">No active plugins found.</dt>';
                } else {
                    foreach ($data_to_render as $plugin) {
                        if (!is_array($plugin)) continue;
                        // Render name with link (if available) inside dt, allow HTML
                        $plugin_name_html = esc_html($plugin['name'] ?? 'Unknown Plugin');
                        if (!empty($plugin['url'])) { $plugin_name_html = '<a href="' . esc_url($plugin['url']) . '" target="_blank" rel="noopener">' . $plugin_name_html . '</a>'; }
                        echo '<dt class="col-sm-5 text-muted fw-normal border-bottom pb-2 mb-2">' . wp_kses_post($plugin_name_html) . '</dt>'; // Allow link
                        // Render details in dd
                        $version_string = esc_html($plugin['version'] ?? 'N/A');
                        if (!empty($plugin['latest_verison']) && version_compare($plugin['latest_verison'], $plugin['version'], '>')) { $version_string .= ' - <span class="badge bg-warning-subtle text-warning-emphasis">' . sprintf(__('Update: %s', 'ayecode-connect'), esc_html($plugin['latest_verison'])) . '</span>'; }
                        $author_html = esc_html($plugin['author_name'] ?? 'Unknown');
                        if (!empty($plugin['author_url'])) { $author_html = '<a href="' . esc_url($plugin['author_url']) . '" target="_blank" rel="noopener">' . $author_html . '</a>'; }
                        $plugin_info = 'by ' . $author_html . ' &ndash; ' . $version_string;
                        if ($plugin['network_activated'] ?? false) { $plugin_info .= ' <span class="badge bg-info-subtle text-info-emphasis">Network Activated</span>'; }
                        echo '<dd class="col-sm-7 border-bottom pb-2 mb-2">' . wp_kses_post($plugin_info) . '</dd>'; // Allow link + badges
                    }
                }
                break;

            case 'theme':
                $theme = $data_to_render; // Already an array
                echo '<dt class="col-sm-5 text-muted fw-normal border-bottom pb-2 mb-2">Name</dt>';
                echo '<dd class="col-sm-7 border-bottom pb-2 mb-2">' . esc_html($theme['name'] ?? 'N/A') . '</dd>';
                $version_string = esc_html($theme['version'] ?? 'N/A');
                if (!empty($theme['version_latest']) && version_compare($theme['version_latest'], $theme['version'], '>')) { $version_string .= ' - <span class="badge bg-warning-subtle text-warning-emphasis">' . sprintf(__('Update: %s', 'ayecode-connect'), esc_html($theme['version_latest'])) . '</span>'; }
                echo '<dt class="col-sm-5 text-muted fw-normal border-bottom pb-2 mb-2">Version</dt>';
                echo '<dd class="col-sm-7 border-bottom pb-2 mb-2">' . wp_kses_post($version_string) . '</dd>';
                echo '<dt class="col-sm-5 text-muted fw-normal border-bottom pb-2 mb-2">Author</dt>';
                $author_html = esc_html($theme['author_name'] ?? 'Unknown');
                if (!empty($theme['author_url'])) { $author_html = '<a href="' . esc_url($theme['author_url']) . '" target="_blank" rel="noopener">' . $author_html . '</a>'; }
                echo '<dd class="col-sm-7 border-bottom pb-2 mb-2">' . wp_kses_post($author_html) . '</dd>';
                echo '<dt class="col-sm-5 text-muted fw-normal border-bottom pb-2 mb-2">Child Theme</dt>';
                echo '<dd class="col-sm-7 border-bottom pb-2 mb-2">' . (($theme['is_child_theme'] ?? false) ? '<span class="badge bg-success-subtle text-success-emphasis">Yes</span>' : '<span class="badge bg-secondary-subtle text-secondary-emphasis">No</span>') . '</dd>';
                if ($theme['is_child_theme'] ?? false) {
                    echo '<dt class="col-sm-5 text-muted fw-normal border-bottom pb-2 mb-2">Parent Theme Name</dt>';
                    echo '<dd class="col-sm-7 border-bottom pb-2 mb-2">' . esc_html($theme['parent_name'] ?? 'N/A') . '</dd>';
                    $parent_version_string = esc_html($theme['parent_version'] ?? 'N/A');
                    if (!empty($theme['parent_version_latest']) && version_compare($theme['parent_version_latest'], $theme['parent_version'], '>')) { $parent_version_string .= ' - <span class="badge bg-warning-subtle text-warning-emphasis">' . sprintf(__('Update: %s', 'ayecode-connect'), esc_html($theme['parent_version_latest'])) . '</span>'; }
                    echo '<dt class="col-sm-5 text-muted fw-normal border-bottom pb-2 mb-2">Parent Theme Version</dt>';
                    echo '<dd class="col-sm-7 border-bottom pb-2 mb-2">' . wp_kses_post($parent_version_string) . '</dd>';
                    echo '<dt class="col-sm-5 text-muted fw-normal border-bottom pb-2 mb-2">Parent Author</dt>';
                    $parent_author_html = esc_html($theme['parent_author_name'] ?? 'Unknown');
                    if (!empty($theme['parent_author_url'])) { $parent_author_html = '<a href="' . esc_url($theme['parent_author_url']) . '" target="_blank" rel="noopener">' . $parent_author_html . '</a>'; }
                    echo '<dd class="col-sm-7 border-bottom pb-2 mb-2">' . wp_kses_post($parent_author_html) . '</dd>';
                }
                if (isset($theme['overrides'])) {
                    $override_count = is_array($theme['overrides']) ? count($theme['overrides']) : 0;
                    $override_text = $override_count > 0 ? sprintf(_n('%d override found', '%d overrides found', $override_count, 'ayecode-connect'), $override_count) : 'None';
                    if ($theme['has_outdated_templates'] ?? false) { $override_text .= ' <span class="badge bg-warning-subtle text-warning-emphasis">Outdated</span>'; }
                    echo '<dt class="col-sm-5 text-muted fw-normal border-bottom pb-2 mb-2">Template Overrides</dt>';
                    echo '<dd class="col-sm-7 border-bottom pb-2 mb-2">' . wp_kses_post($override_text) . '</dd>';
                }
                break;

            case 'security':
                echo '<dt class="col-sm-5 text-muted fw-normal border-bottom pb-2 mb-2">Secure Connection (HTTPS)</dt>';
                echo '<dd class="col-sm-7 border-bottom pb-2 mb-2">' . (($data_to_render['secure_connection'] ?? false) ? '<span class="badge bg-success-subtle text-success-emphasis">Active</span>' : '<span class="badge bg-danger-subtle text-danger-emphasis">Inactive</span>') . '</dd>';
                echo '<dt class="col-sm-5 text-muted fw-normal border-bottom pb-2 mb-2">Hide Errors From Visitors</dt>';
                echo '<dd class="col-sm-7 border-bottom pb-2 mb-2">' . (($data_to_render['hide_errors'] ?? false) ? '<span class="badge bg-success-subtle text-success-emphasis">Yes</span>' : '<span class="badge bg-warning-subtle text-warning-emphasis">No (Recommended: Yes)</span>') . '</dd>';
                break;

            case 'settings':
                if (empty($data_to_render) || !is_array($data_to_render)) { echo '<dt class="col-12">No settings data available.</dt>'; }
                else {
                    foreach ($data_to_render as $key => $value) {
                        $label = esc_html($this->format_key_for_display($key));
                        $display_value = is_bool($value) ? ($value ? '<span class="badge bg-success-subtle text-success-emphasis">Yes</span>' : '<span class="badge bg-secondary-subtle text-secondary-emphasis">No</span>') : esc_html($value);
                        echo '<dt class="col-sm-5 text-muted fw-normal border-bottom pb-2 mb-2">' . $label . '</dt>';
                        echo '<dd class="col-sm-7 border-bottom pb-2 mb-2">' . wp_kses_post($display_value) . '</dd>';
                    }
                }
                break;

            case 'pages':
                if (empty($data_to_render) || !is_array($data_to_render)) { echo '<dt class="col-12">No specific framework pages found/checked.</dt>'; }
                else {
                    foreach ($data_to_render as $page) {
                        if (!is_array($page)) continue;
                        $status_html = ''; $page_id = $page['page_id'] ?? 0;
                        if (!($page['page_set'] ?? false)) { $status_html = '<span class="badge bg-danger-subtle text-danger-emphasis">Not Set</span>'; }
                        elseif (!($page['page_exists'] ?? false)) { $status_html = '<span class="badge bg-danger-subtle text-danger-emphasis">Missing (#'.absint($page_id).')</span>'; }
                        elseif (!($page['page_visible'] ?? false)) { $status_html = '<span class="badge bg-warning-subtle text-warning-emphasis">Not Public (#'.absint($page_id).')</span>'; }
                        elseif (($page['shortcode_required'] ?? false) && !($page['shortcode_present'] ?? false)) { $status_html = '<span class="badge bg-warning-subtle text-warning-emphasis">Shortcode Missing</span>'; }
                        else { $status_html = '<span class="badge bg-success-subtle text-success-emphasis">OK (#'.absint($page_id).')</span>'; }
                        echo '<dt class="col-sm-5 text-muted fw-normal border-bottom pb-2 mb-2">' . esc_html($page['page_name'] ?? 'Unknown Page') . '</dt>';
                        echo '<dd class="col-sm-7 border-bottom pb-2 mb-2">' . wp_kses_post($status_html) . '</dd>';
                    }
                }
                break;

            default: // Default rendering for sections added via filters
                if (is_iterable($data_to_render)) {
                    foreach ($data_to_render as $key => $value) {
                        echo '<dt class="col-sm-5 text-muted fw-normal border-bottom pb-2 mb-2">' . esc_html($this->format_key_for_display($key)) . '</dt>';
                        $display_value = is_array($value) || is_object($value) ? '<pre class="small bg-light p-1 rounded"><code>'. esc_html(wp_json_encode($value, JSON_PRETTY_PRINT)) .'</code></pre>' : $value;
                        echo '<dd class="col-sm-7 border-bottom pb-2 mb-2">' . wp_kses_post($display_value) . '</dd>';
                    }
                } elseif ($data_to_render) {
                    echo '<dt class="col-12">Data</dt><dd class="col-12">' . wp_kses_post($data_to_render) . '</dd>';
                } else {
                    echo '<dt class="col-12">No data available for this section.</dt>';
                }
                break;
        }
        return ob_get_clean();
    }


    /** Helper to render DB tables consistently */
    private function render_db_tables_html($title, $tables) {
        if (!empty($tables) && is_array($tables)) {
            echo '<dt class="col-12 pt-3 mt-3 border-top text-muted small fw-normal">' . esc_html($title) . '</dt><dd class="col-12 mb-0 pb-2 d-none"></dd>';
            foreach ($tables as $table => $table_data) {
                $size_info = is_array($table_data) ? sprintf('Data: %.2fMB + Index: %.2fMB', floatval($table_data['data'] ?? 0), floatval($table_data['index'] ?? 0)) : '<span class="badge bg-danger-subtle text-danger-emphasis">Missing/Error</span>';
                echo '<dt class="col-sm-5 text-muted fw-normal border-bottom pb-2 mb-2">' . esc_html($table) . '</dt>';
                echo '<dd class="col-sm-7 border-bottom pb-2 mb-2">' . wp_kses_post($size_info) . '</dd>';
            }
        }
    }


    // --- Helper Formatting Functions ---
    private function format_memory_limit( $limit_bytes ) {
        if ( ! $limit_bytes ) return 'N/A';
        if ( $limit_bytes < 134217728 ) { // Recommend 128MB+
            return '<span class="badge bg-warning-subtle text-warning-emphasis">' . size_format( $limit_bytes ) . ' - Recommended: 128MB+</span>';
        }
        return '<span class="badge bg-success-subtle text-success-emphasis">' . size_format( $limit_bytes ) . '</span>';
    }
    private function format_php_version( $version ) {
        if ( ! $version || $version === 'N/A' ) return 'N/A';
        if ( version_compare( $version, '7.4', '<' ) ) {
            return '<span class="badge bg-warning-subtle text-warning-emphasis">' . esc_html( $version ) . ' - Recommended: 7.4+</span>';
        }
        if ( version_compare( $version, '8.0', '<' ) ) {
            return '<span class="badge bg-info-subtle text-info-emphasis">' . esc_html( $version ) . ' - Recommended: 8.0+</span>';
        }
        return '<span class="badge bg-success-subtle text-success-emphasis">' . esc_html( $version ) . '</span>';
    }
    private function format_mysql_version( $version ) {
        if ( ! $version || $version === 'N/A' ) return 'N/A';
        if ( stristr( $version, 'MariaDB' ) ) {
            $clean_version = preg_replace( '/[^0-9\.]-.*/', '', $version );
            if ( version_compare( $clean_version, '10.3', '>=' ) ) { // Recommend MariaDB 10.3+
                return '<span class="badge bg-success-subtle text-success-emphasis">' . esc_html( $version ) . '</span>';
            } else {
                return '<span class="badge bg-warning-subtle text-warning-emphasis">' . esc_html( $version ) . ' - Recommended: MariaDB 10.3+</span>';
            }
        }
        $clean_version = preg_replace( '/[^0-9\.].*/', '', $version );
        if ( version_compare( $clean_version, '5.7', '<' ) ) { // Recommend MySQL 5.7+
            return '<span class="badge bg-warning-subtle text-warning-emphasis">' . esc_html( $version ) . ' - Recommended: MySQL 5.7+</span>';
        }
        return '<span class="badge bg-success-subtle text-success-emphasis">' . esc_html( $version ) . '</span>';
    }
    private function format_default_timezone( $timezone ) {
        if ( 'UTC' !== $timezone ) {
            return '<span class="badge bg-warning-subtle text-warning-emphasis">' . esc_html( $timezone ) . ' - Recommended: UTC</span>';
        }
        return '<span class="badge bg-success-subtle text-success-emphasis">UTC</span>';
    }
    private function format_key_for_display($key) { return ucwords(str_replace(['_', '-'], ' ', $key)); }
    private function let_to_num( $size ) {
        if ( empty($size) || !is_string($size) ) return 0;
        $l   = substr( $size, -1 );
        $ret = (int) substr( $size, 0, -1 );
        switch ( strtoupper( $l ) ) {
            case 'P': $ret *= 1024; // Intentional fall-through
            case 'T': $ret *= 1024; // Intentional fall-through
            case 'G': $ret *= 1024; // Intentional fall-through
            case 'M': $ret *= 1024; // Intentional fall-through
            case 'K': $ret *= 1024;
        }
        return max(0, $ret); // Ensure non-negative
    }


    // --- Data Gathering Methods (MUST BE ADAPTED/FILLED IN) ---
    // Placeholder implementations - Replace with your actual logic
    // Add try/catch blocks for robustness
    private function get_environment_info() {
        global $wpdb; $environment = [];
        try {
            $environment['home_url'] = get_option( 'home' );
            $environment['site_url'] = get_option( 'siteurl' );
            $environment['wp_version'] = get_bloginfo( 'version' );
            $environment['wp_multisite'] = is_multisite();
            $wp_memory_limit = $this->let_to_num( WP_MEMORY_LIMIT );
            if ( function_exists( 'memory_get_usage' ) ) { $wp_memory_limit = max( $wp_memory_limit, $this->let_to_num( @ini_get( 'memory_limit' ) ) ); }
            $environment['wp_memory_limit'] = $wp_memory_limit;
            $environment['wp_debug_mode'] = ( defined( 'WP_DEBUG' ) && WP_DEBUG );
            $environment['wp_cron'] = ! ( defined( 'DISABLE_WP_CRON' ) && DISABLE_WP_CRON );
            $environment['language'] = get_locale();
            $environment['server_info'] = $_SERVER['SERVER_SOFTWARE'] ?? 'N/A';
            $environment['php_version'] = phpversion();
            if ( function_exists( 'ini_get' ) ) {
                $environment['php_post_max_size'] = $this->let_to_num( ini_get( 'post_max_size' ) );
                $environment['php_max_execution_time'] = ini_get( 'max_execution_time' );
                $environment['php_max_input_vars'] = ini_get( 'max_input_vars' );
            } else { $environment['php_post_max_size'] = 0; $environment['php_max_execution_time'] = 'N/A'; $environment['php_max_input_vars'] = 'N/A'; }
            $curl_version = 'N/A';
            if ( function_exists( 'curl_version' ) ) { $cv = curl_version(); $curl_version = ($cv['version'] ?? 'N/A') . ', ' . ($cv['ssl_version'] ?? 'N/A'); }
            $environment['curl_version'] = $curl_version;
            $environment['suhosin_installed'] = extension_loaded( 'suhosin' );
            $environment['mysql_version'] = ( ! empty( $wpdb->is_mysql ) ? $wpdb->db_version() : '' );
            $environment['max_upload_size'] = wp_max_upload_size();
            $environment['default_timezone'] = date_default_timezone_get();
            $environment['fsockopen_or_curl_enabled'] = ( function_exists( 'fsockopen' ) || function_exists( 'curl_init' ) );
            $environment['soapclient_enabled'] = class_exists( 'SoapClient' );
            $environment['domdocument_enabled'] = class_exists( 'DOMDocument' );
            $environment['gzip_enabled'] = is_callable( 'gzopen' );
            $environment['mbstring_enabled'] = extension_loaded( 'mbstring' );
            $rp_start = microtime(true);
            // User agent
            $user_agent = isset( $_SERVER['HTTP_USER_AGENT'] ) ? $_SERVER['HTTP_USER_AGENT'] : '';

            // Test POST requests
            $remote_post_response = wp_safe_remote_post( 'http://api.wordpress.org/core/browse-happy/1.1/', array(
                    'timeout'     => 10,
                    'user-agent'  => 'WordPress/' . get_bloginfo( 'version' ) . '; ' . home_url(),
                    'httpversion' => '1.1',
                    'body'        => array(
                            'useragent'	=> $user_agent,
                    ),
            ) );
            $rp_time = microtime(true) - $rp_start;
            $environment['remote_post_successful'] = ! is_wp_error( $remote_post_response ) && wp_remote_retrieve_response_code( $remote_post_response ) >= 200 && wp_remote_retrieve_response_code( $remote_post_response ) < 300;
            $environment['remote_post_response'] = is_wp_error( $remote_post_response ) ? $remote_post_response->get_error_message() : wp_remote_retrieve_response_code( $remote_post_response ) . ' (' . round($rp_time, 2) . 's)';
            $rg_start = microtime(true);
            $remote_get_response = wp_safe_remote_get( 'https://plugins.svn.wordpress.org/geodirectory/trunk/readme.txt', array(
                    'timeout'     => 10,
                    'user-agent'  => $user_agent,
                    'httpversion' => '1.1'
            ) );
            $rg_time = microtime(true) - $rg_start;
            $environment['remote_get_successful'] = ! is_wp_error( $remote_get_response ) && wp_remote_retrieve_response_code( $remote_get_response ) >= 200 && wp_remote_retrieve_response_code( $remote_get_response ) < 300;
            $environment['remote_get_response'] = is_wp_error( $remote_get_response ) ? $remote_get_response->get_error_message() : wp_remote_retrieve_response_code( $remote_get_response ) . ' (' . round($rg_time, 2) . 's)';
        } catch (\Throwable $e) { error_log('ASF Status Error (Environment): ' . $e->getMessage()); }
        return $environment;
    }
    private function get_database_info() {
        global $wpdb; $database = [];
        try {
            $database['database_prefix'] = $wpdb->prefix;
            $database_table_sizes = $wpdb->get_results( $wpdb->prepare( " SELECT table_name AS 'name', round( ( data_length / 1024 / 1024 ), 2 ) 'data', round( ( index_length / 1024 / 1024 ), 2 ) 'index' FROM information_schema.TABLES WHERE table_schema = %s ORDER BY name ASC;", DB_NAME ) );
            $framework_tables_pattern = $wpdb->prefix . 'ayecode_sf_%'; // Adjust prefix if needed
            $tables = [ 'framework' => [], 'other' => [] ]; $database_size = [ 'data' => 0, 'index' => 0 ];
            if ( $database_table_sizes ) {
                foreach ( $database_table_sizes as $table ) {
                    $is_framework_table = strpos( $table->name, str_replace('%', '', $framework_tables_pattern) ) === 0;
                    $table_type = $is_framework_table ? 'framework' : 'other';
                    // Ensure table object properties exist before accessing
                    $table_data = $table->data ?? 0;
                    $table_index = $table->index ?? 0;
                    $tables[ $table_type ][ $table->name ] = [ 'data' => $table_data, 'index' => $table_index ];
                    $database_size['data'] += $table_data; $database_size['index'] += $table_index;
                }
            }
            $database['database_tables'] = $tables; $database['database_size'] = $database_size;
        } catch (\Throwable $e) { error_log('ASF Status Error (Database): ' . $e->getMessage()); }
        return $database;
    }
    private function get_post_type_counts() {
        global $wpdb; $counts = [];
        try {
            // Added more statuses
            $stati = implode("', '", get_post_stati());
            $counts = $wpdb->get_results( "SELECT post_type AS 'type', count(1) AS 'count' FROM {$wpdb->posts} WHERE post_status IN ('{$stati}') GROUP BY post_type;" );
        } catch (\Throwable $e) { error_log('ASF Status Error (Post Types): ' . $e->getMessage()); }
        return is_array( $counts ) ? $counts : [];
    }
    private function get_active_plugins() {
        $plugins_data = [];
        try {
            if (!function_exists('get_plugins')) { require_once ABSPATH . 'wp-admin/includes/plugin.php'; }
            if (!function_exists('get_plugin_updates')) { require_once ABSPATH . 'wp-admin/includes/update.php'; }
            $active_plugins = (array) get_option( 'active_plugins', array() );
            if ( is_multisite() ) { $network_activated_plugins = array_keys( get_site_option( 'active_sitewide_plugins', array() ) ); $active_plugins = array_unique(array_merge( $active_plugins, $network_activated_plugins )); }
            $available_updates = get_plugin_updates();
            foreach ($active_plugins as $plugin_file) {
                $plugin_path = WP_PLUGIN_DIR . '/' . $plugin_file;
                if (!file_exists($plugin_path)) continue;
                $plugin_data = get_plugin_data( $plugin_path );
                if (empty($plugin_data['Name'])) continue;
                $latest_version = $plugin_data['Version'];
                if ( isset( $available_updates[ $plugin_file ]->update->new_version ) ) { $latest_version = $available_updates[ $plugin_file ]->update->new_version; }
                $plugins_data[] = [
                        'plugin' => $plugin_file, 'name' => $plugin_data['Name'], 'version' => $plugin_data['Version'], 'url' => $plugin_data['PluginURI'],
                        'author_name' => $plugin_data['AuthorName'], 'author_url' => $plugin_data['AuthorURI'],
                        'network_activated' => is_multisite() && array_key_exists( $plugin_file, get_site_option( 'active_sitewide_plugins', array() ) ),
                        'latest_verison' => $latest_version,
                ];
            }
            usort($plugins_data, function($a, $b) { return strcasecmp($a['name'], $b['name']); }); // Case-insensitive sort
        } catch (\Throwable $e) { error_log('ASF Status Error (Plugins): ' . $e->getMessage()); }
        return $plugins_data;
    }
    private function get_theme_info() {
        $theme_info = [];
        try {
            $active_theme = wp_get_theme();
            $theme_info['name'] = $active_theme->Name; $theme_info['version'] = $active_theme->Version;
            $theme_info['version_latest'] = $active_theme->Version; // Placeholder
            $theme_info['author_name'] = $active_theme->get('Author'); $theme_info['author_url'] = $active_theme->{'Author URI'};
            $theme_info['is_child_theme'] = is_child_theme();
            if ( $theme_info['is_child_theme'] ) {
                $parent_theme = wp_get_theme( $active_theme->Template );
                $theme_info['parent_name'] = $parent_theme->Name; $theme_info['parent_version'] = $parent_theme->Version;
                $theme_info['parent_version_latest'] = $parent_theme->Version; // Placeholder
                $theme_info['parent_author_name'] = $parent_theme->get('Author'); $theme_info['parent_author_url'] = $parent_theme->{'Author URI'};
            } else { $theme_info['parent_name'] = ''; $theme_info['parent_version'] = ''; $theme_info['parent_version_latest'] = ''; $theme_info['parent_author_name'] = ''; $theme_info['parent_author_url'] = ''; }
            $theme_info['overrides'] = []; $theme_info['has_outdated_templates'] = false; // Placeholder
        } catch (\Throwable $e) { error_log('ASF Status Error (Theme): ' . $e->getMessage()); }
        return $theme_info;
    }
    private function get_security_info() {
        $security = [];
        try {
            $security['secure_connection'] = is_ssl();
            $security['hide_errors'] = ! ( defined( 'WP_DEBUG' ) && defined( 'WP_DEBUG_DISPLAY' ) && WP_DEBUG && WP_DEBUG_DISPLAY ) || 0 === intval( ini_get( 'display_errors' ) );
        } catch (\Throwable $e) { error_log('ASF Status Error (Security): ' . $e->getMessage()); }
        return $security;
    }
    private function get_framework_settings() {
        $settings_data = [];
        try {
            $option_name = $this->framework ? $this->framework->get_option_name() : '';
            $settings = $option_name ? get_option($option_name, []) : [];
            // Return only specific, non-sensitive settings
            $settings_data = [
                    'api_enabled' => $settings['api_enabled'] ?? false,
                    'default_status' => $settings['default_status'] ?? 'publish',
                // Add more as needed
            ];
        } catch (\Throwable $e) { error_log('ASF Status Error (Settings): ' . $e->getMessage()); }
        return $settings_data;
    }
    private function get_framework_pages() {
        $pages_output = [];
        try {
            $check_pages_config = apply_filters('ayecode_sf_status_check_pages', [], $this->framework);
            foreach ($check_pages_config as $page_name => $values) {
                if (!is_array($values)) continue;
                $page_id = $values['page_id'] ?? 0; $shortcode = $values['shortcode'] ?? '';
                $page_set = $page_exists = $page_visible = $shortcode_present = $shortcode_required = false;
                if ($page_id) $page_set = true;
                $post = get_post($page_id);
                if ($post) $page_exists = true;
                if ($post && 'publish' === $post->post_status) $page_visible = true;
                if ($shortcode && $post) { $shortcode_required = true; if ( has_shortcode( $post->post_content, $shortcode ) ) $shortcode_present = true; }
                $pages_output[] = [
                        'page_name' => $page_name, 'page_id' => $page_id, 'page_set' => $page_set,
                        'page_exists' => $page_exists, 'page_visible' => $page_visible,
                        'shortcode' => $shortcode, 'shortcode_required' => $shortcode_required, 'shortcode_present' => $shortcode_present,
                ];
            }
        } catch (\Throwable $e) { error_log('ASF Status Error (Pages): ' . $e->getMessage()); }
        return $pages_output;
    }

} // End Class System_Status_Handler
?>