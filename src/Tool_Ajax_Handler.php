<?php
/**
 * Tool AJAX Handler
 *
 * Handles AJAX requests for built-in framework components like widgets and extension pages.
 *
 * @package AyeCode\SettingsFramework
 */

namespace AyeCode\SettingsFramework;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Tool_Ajax_Handler {

	/**
	 * A reference to the main framework instance.
	 * @var Settings_Framework
	 */
	private $framework;

	public function __construct( Settings_Framework $framework ) {
		$this->framework = $framework;
	}

	/**
	 * Handles the AJAX request for the built-in Stats widget.
	 * @param array $post_data The $_POST data.
	 */
	public function handle_get_dashboard_stats( $post_data ) {
		$params = isset( $post_data['params'] ) ? json_decode( stripslashes( $post_data['params'] ), true ) : [];
		$show   = $params['show'] ?? ['users', 'posts']; // Default stats to show
		$stats  = [];

		if ( in_array('users', $show) ) {
			$stats[] = [ 'label' => 'Active Users', 'value' => count_users()['total_users'], 'icon'  => 'fa-solid fa-users' ];
		}
		if ( in_array('posts', $show) ) {
			$stats[] = [ 'label' => 'Published Posts', 'value' => wp_count_posts()->publish, 'icon'  => 'fa-solid fa-file-alt' ];
		}
		if ( in_array('pages', $show) ) {
			$stats[] = [ 'label' => 'Published Pages', 'value' => wp_count_posts('page')->publish, 'icon'  => 'fa-solid fa-file-lines' ];
		}

		wp_send_json_success( [ 'stats' => $stats ] );
	}

	/**
	 * Handles the AJAX request for the built-in System Status widget.
	 * @param array $post_data The $_POST data.
	 */
	public function handle_get_system_status( $post_data ) {
		global $wp_version;
		$params = isset( $post_data['params'] ) ? json_decode( stripslashes( $post_data['params'] ), true ) : [];

		$min_php = $params['php_version'] ?? '7.4';
		$min_wp  = $params['wp_version'] ?? $wp_version;

		$status = [
			['label' => 'WordPress Version', 'value' => $wp_version, 'status' => version_compare($wp_version, $min_wp, '>=') ? 'good' : 'warning'],
			['label' => 'PHP Version', 'value' => PHP_VERSION, 'status' => version_compare(PHP_VERSION, $min_php, '>=') ? 'good' : 'warning'],
			['label' => 'WP Memory Limit', 'value' => WP_MEMORY_LIMIT, 'status' => 'good'],
			['label' => 'Debug Mode', 'value' => WP_DEBUG ? 'On' : 'Off', 'status' => WP_DEBUG ? 'warning' : 'good'],
		];
		wp_send_json_success( [ 'status' => $status ] );
	}

	/**
	 * Handles the AJAX request for the built-in RSS Feed widget.
	 * @param array $post_data The $_POST data.
	 */
	public function handle_get_plugin_news( $post_data ) {
		include_once( ABSPATH . WPINC . '/feed.php' );

		$config = $this->framework->get_config_raw();
		$feed_url = '';
		$tool_action = isset( $post_data['tool_action'] ) ? sanitize_key( $post_data['tool_action'] ) : '';

		// Find the widget in the config that triggered this action to get its feed_url
		foreach ($config['sections'] as $section) {
			if (isset($section['widgets'])) {
				foreach ($section['widgets'] as $widget) {
					if (isset($widget['ajax_action']) && $widget['ajax_action'] === $tool_action && isset($widget['feed_url'])) {
						$feed_url = $widget['feed_url'];
						break 2;
					}
				}
			}
		}

		if ( empty($feed_url) ) {
			wp_send_json_error(['message' => 'Feed URL not configured for this widget.']);
		}

		// The WordPress fetch_feed() function automatically caches the results
		// in a transient for 12 hours by default. No extra caching logic is needed.
		$rss = fetch_feed( $feed_url );
		$feed_items = [];

		if ( ! is_wp_error( $rss ) ) {
			$maxitems = $rss->get_item_quantity( 5 );
			$rss_items = $rss->get_items( 0, $maxitems );
			foreach ( $rss_items as $item ) {
				$image_url = '';
				// Try to get the featured image first.
				$thumbnail = $item->get_thumbnail();
				if ( ! empty( $thumbnail['url'] ) ) {
					$image_url = $thumbnail['url'];
				} else {
					// As a fallback, try to find the first image in the content.
					$content = $item->get_content();
					if ( preg_match( '/<img.+src=[\'"]([^\'"]+)[\'"].*>/i', $content, $matches ) ) {
						$image_url = $matches[1];
					}
				}

				// --- NEW: Modify the image URL to add the -150x150 suffix ---
				if ( ! empty( $image_url ) ) {
					$path_parts = pathinfo( $image_url );
					// Check if we have all the parts we need to rebuild the URL
					if ( isset( $path_parts['dirname'], $path_parts['filename'], $path_parts['extension'] ) ) {
						// Rebuild the URL with the thumbnail size suffix
						$image_url = $path_parts['dirname'] . '/' . $path_parts['filename'] . '-150x150.' . $path_parts['extension'];
					}
				}

				$feed_items[] = [
					'title' => esc_html( $item->get_title() ),
					'url'   => esc_url( $item->get_permalink() ),
					'date'  => $item->get_date('F j, Y'),
					'image' => $image_url,
				];
			}
		}
		wp_send_json_success( [ 'items' => $feed_items ] );
	}

	/**
	 * Handles the AJAX request for the 'extension_list_page' type.
	 * @param array $post_data The $_POST data.
	 */
	public function handle_get_extension_data( $post_data ) {
		$data = isset( $post_data['data'] ) ? json_decode( stripslashes( $post_data['data'] ) ) : new \stdClass();
		$category = isset( $data->category ) ? sanitize_key( $data->category ) : '';
		$page_config = $this->framework->get_config_raw()['page_config'] ?? [];
		$api_url = $page_config['api_url'] ?? '';

		if ( empty( $category ) || empty( $api_url ) ) {
			wp_send_json_error( [ 'message' => 'Missing category or API URL configuration.' ] );
			return;
		}

		// The logic to fetch data is now defined in the framework itself,
		// but it can be overridden by a child class if needed.
		$products = $this->framework->fetch_remote_products( $category, $api_url );

		if ( is_array( $products ) ) {
			if( method_exists( $this->framework, 'get_product_status' ) ) {
				foreach ( $products as &$product ) {
					$product->status = $this->framework->get_product_status( $product );
				}
			}
		} else {
			$products = [];
		}

		wp_send_json_success( [ 'items' => $products ] );
	}
}