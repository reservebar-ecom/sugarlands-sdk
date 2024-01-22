<?php
$requestUri = $_SERVER['REQUEST_URI'];
if (strpos($requestUri, 'collection-liquid-sdk') !== false || strpos($requestUri, 'product-liquid-sdk') !== false) {
	$posts_data = array();

// Create a post query to get all posts
$args = array(
    'post_type'      => 'sdc_product',
    'posts_per_page' => -1,
);

$query = new WP_Query($args);

// Check if there are posts
if ($query->have_posts()) {
    // Loop through each post
    while ($query->have_posts()) {
        $query->the_post();

        // Access post data
        $postId = get_the_ID();
        $postTitle = get_the_title();
        $groupingId = get_field('grouping-id', $postId);
        $product_image = get_field('product_image', $postId);

        // Check if $groupingId contains "GROUPING-"
        if (strpos($groupingId, 'GROUPING-') !== false) {
            // Add post data to the array
            $posts_data[] = array(
                'postId' => $postId,
                'postTitle' => $postTitle,
                'groupingId' => $groupingId,
                'product_image' => $product_image,
            );
        }
    }

    // Restore original post data
    wp_reset_postdata();

    // Convert the array to JSON
    $json_data = json_encode($posts_data, JSON_PRETTY_PRINT);

    // Output the JSON data
    echo '<script> const products =';
	echo $json_data;
	echo '</script>';
} else {
    echo 'No posts found.';
}
	
}
?> 