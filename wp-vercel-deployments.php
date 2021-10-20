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

    wp_enqueue_style('wp-vercel-deployments-css', $css_to_load);
    wp_enqueue_script('wp-vercel-deployments-js', $js_to_load, [], false, true);
    wp_localize_script('wp-api', 'wpApiSettings', [
        'root' => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('wp_rest'),
    ]);
});

function dfse_vercel_settings_api_read() {
    if (!current_user_can('manage_options')) {
        return new WP_Error('forbidden', 'Forbidden', ['status' => 403]);
    }

    $projects = get_option('dfse_vercel_deployments_projects', []);
    return $projects;
}

function dfse_vercel_settings_api_update($request) {
    $payload = $request->get_json_params();

    // $payload should be a sequential array
    if (!is_array($payload) || array_keys($payload) !== range(0, count($payload) - 1)) {
        return new WP_Error('not-an-array', 'Payload should be an array', ['status' => 400]);
    }

    // $payload urls should be valid urls
    foreach ($payload as $project) {
        if (strlen(trim($project['name'])) === 0) {
            return new WP_Error('invalid-name', 'Invalid project name: "' . $project['name'] . '"', ['status' => 400]);
        }
        if (filter_var($project['url'], FILTER_VALIDATE_URL) === FALSE) {
            return new WP_Error('invalid-url', 'Invalid project url: "' . $project['url'] . '"', ['status' => 400]);
        }
    }

    update_option('dfse_vercel_deployments_projects', $payload);
}

add_action('rest_api_init', function () {
    register_rest_route('dfse-vercel/v1', '/read', array(
        'methods'  => WP_REST_Server::READABLE,
        'callback' => 'dfse_vercel_settings_api_read',
    ));

    register_rest_route('dfse-vercel/v1', '/update', array(
        'methods'  => WP_REST_Server::CREATABLE,
        'callback' => 'dfse_vercel_settings_api_update',
    ));
});