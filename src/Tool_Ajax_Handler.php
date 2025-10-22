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
			wp_send_json_error(['message' => __( 'Feed URL not configured for this widget.', 'ayecode-connect' )]);
		}

		$rss = fetch_feed( $feed_url );
		$feed_items = [];

		if ( ! is_wp_error( $rss ) ) {
			$maxitems = $rss->get_item_quantity( 5 );
			$rss_items = $rss->get_items( 0, $maxitems );
			foreach ( $rss_items as $item ) {
				$image_url = '';
				$thumbnail = $item->get_thumbnail();
				if ( ! empty( $thumbnail['url'] ) ) {
					$image_url = $thumbnail['url'];
				} else {
					$content = $item->get_content();
					if ( preg_match( '/<img.+src=[\'"]([^\'"]+)[\'"].*>/i', $content, $matches ) ) {
						$image_url = $matches[1];
					}
				}

				if ( ! empty( $image_url ) ) {
					$path_parts = pathinfo( $image_url );
					if ( isset( $path_parts['dirname'], $path_parts['filename'], $path_parts['extension'] ) ) {
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
	 * This method now fetches, curates, and adds status to the product data.
	 *
	 * @param array $post_data The $_POST data.
	 */
	public function handle_get_extension_data( $post_data ) {
		$data        = isset( $post_data['data'] ) ? json_decode( stripslashes( $post_data['data'] ) ) : new \stdClass();
		$category    = isset( $data->category ) ? sanitize_key( $data->category ) : '';
		$item_type   = isset( $data->item_type ) ? sanitize_key( $data->item_type ) : 'plugin';
		$page_config = $this->framework->get_config_raw()['page_config'] ?? [];
		$api_url     = $page_config['api_url'] ?? '';

		if ( empty( $category ) || empty( $api_url ) ) {
			wp_send_json_error( [ 'message' => __( 'Missing category or API URL configuration.', 'ayecode-connect' ) ] );
			return;
		}

		// 1. Fetch the raw data using the core framework method.
		$raw_products = $this->framework->fetch_remote_products( $category, $api_url );

		if ( ! is_array( $raw_products ) ) {
			wp_send_json_success( [ 'items' => [] ] );
			return;
		}

		// 2. Curate the data into a clean format.
		$curated_products = [];
		foreach ( $raw_products as $product ) {
			$is_new = ( strtotime( $product->info->create_date ) > strtotime( '-180 days' ) );

			$price = 0;
			if (isset($product->pricing->amount)) {
				$price = (float)$product->pricing->amount;
			} elseif(isset($product->pricing->singlesite)) {
				$price = (float)$product->pricing->singlesite;
			}

			$is_subscription = isset( $product->licensing->exp_unit ) && $product->licensing->exp_unit === 'years';


			$curated_product = [
				'info'   => [
					'slug'            => sanitize_key( $product->info->slug ),
					'edd_slug'        => !empty($product->licensing->edd_slug) ? sanitize_key( $product->licensing->edd_slug ) : '',
					'source'          => parse_url( $api_url, PHP_URL_HOST ),
//					'link'            => esc_url( $product->info->link ),
					'link'            => esc_url_raw( $product->info->link ),
					'title'           => esc_attr( $product->info->title ),
					'excerpt'         => esc_attr( $product->info->excerpt ),
					'thumbnail'       => esc_url( $product->info->thumbnail ),
					'price'           => absint ( $price ),
					'is_new'          => absint( $is_new ),
					'is_subscription' => absint( $is_subscription ),
				]
			];

			$curated_product['status'] =  $this->framework->get_product_status( $curated_product, $item_type );
			$curated_product['type'] = esc_attr( $item_type );

			$curated_products[] = $curated_product;
		}

		wp_send_json_success( [ 'items' => $curated_products ] );
	}
}