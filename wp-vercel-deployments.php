<?php
/**
 * Plugin Name: WP Vercel Deployments
 * Description: Helps manage vercel deployments inside the WP admin interface.
 * Version: 1.0
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
    die;
}

// Add settings page to side navigation bar
function dfse_add_settings_page() {
    add_options_page(
        'Vercel Deployment Settings',
        'Vercel Deployment',
        'manage_options',
        'dfse-vercel-deployments',
        'dfse_render_plugin_settings_page'
    );
}
function dfse_render_plugin_settings_page() {
    echo '<div id="dfse_settings_container"></div>';
}
add_action('admin_menu', 'dfse_add_settings_page');

// add react scripts
add_action('admin_enqueue_scripts', function () {
    if (in_array($_SERVER['REMOTE_ADDR'], ['10.255.0.2', '::1'])) {
        $js_to_load = 'http://localhost:3000/static/js/bundle.js';
    } else {
        $js_to_load = plugin_dir_url( __FILE__ ) . 'wp-vercel-deployments.js';
        $css_to_load = plugin_dir_url( __FILE__ ) . 'wp-vercel-deployments.css';
    }

    wp_enqueue_style('wp-vercel-deployments', $css_to_load);
    wp_enqueue_script('wp-vercel-deployments', $js_to_load, '', mt_rand(10,1000), true);
});

function dfse_vercel_deployments_api_proxy($request) {
  // first we get the query parameters from the request
  $params = $request->get_query_params();
  // we add the API key to the params we’ll send to the API
  $params['apiKey'] = 'your_api_key_here';
  // we get the endpoint since we’ll use that to construct the URL
  $endpoint = $params['endpoint'];
  // delete the endpoint since we no longer need it in the params
  unset($params['endpoint']);
  // convert the params back to a string
  $query = http_build_query($params);
  // build the URL using the endpoint and any params and make a remote GET request
  $request = wp_remote_get("https://api.ghostinspector.com/v1$endpoint?$query");
  // get the body from the response and return it as a JSON object
  return json_decode(wp_remote_retrieve_body($request));
}

add_action('rest_api_init', function () {
    register_rest_route('ghost-inspector/v1', '/proxy', array(
        // By using this constant we ensure that when the WP_REST_Server changes our readable endpoints will work as intended.
        'methods'  => WP_REST_Server::READABLE,
        // Here we register our callback. The callback is fired when this endpoint is matched by the WP_REST_Server class.
        'callback' => 'dfse_vercel_deployments',
    ));
});