<?php
/**
 * Wizard Complete Step Template - Bootstrap 5.3+ Only
 *
 * Built-in reusable template for the completion step using only Bootstrap classes.
 * Shows success message and conditional upsell based on membership status.
 *
 * @package AyeCode\SettingsFramework
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div class="text-center">

	<!-- Success Animation -->
	<div class="bg-success rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
	     style="width: 100px; height: 100px;">
		<i class="fa-solid fa-check text-white" style="font-size: 3rem;"></i>
	</div>

	<!-- Completion Title (different for paid vs free) -->
	<h1 class="fs-2 fw-bold mb-3" x-text="isPaidUser ? (strings.all_set || 'All Set! 🎉') : (strings.setup_complete || 'Setup Complete! 🎉')"></h1>

	<!-- Completion Description -->
	<p class="text-muted mb-4" x-text="step.description || (isPaidUser ? (strings.directory_configured || 'Your directory is fully configured!') : (strings.setup_complete || 'Your basic setup is complete.'))"></p>

	<!-- Summary Feature List -->
	<div class="mx-auto mb-4" style="max-width: 400px;">
		<template x-if="step.summary_items && step.summary_items.length > 0">
			<template x-for="item in step.summary_items" :key="item">
				<div class="d-flex align-items-center gap-3 p-3 mb-2 bg-light rounded">
					<div class="bg-success rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white"
					     style="width: 28px; height: 28px;">
						<i class="fa-solid fa-check small"></i>
					</div>
					<div class="text-start" x-text="item"></div>
				</div>
			</template>
		</template>

		<!-- Default summary items if none provided -->
		<template x-if="!step.summary_items || step.summary_items.length === 0">
			<div class="d-flex align-items-center gap-3 p-3 mb-2 bg-light rounded">
				<div class="bg-success rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white"
				     style="width: 28px; height: 28px;">
					<i class="fa-solid fa-check small"></i>
				</div>
				<div class="text-start" x-text="(wizardData.directory_type || 'General') + ' ' + (strings.directory_configured || 'directory configured')"></div>
			</div>
			<div class="d-flex align-items-center gap-3 p-3 mb-2 bg-light rounded">
				<div class="bg-success rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white"
				     style="width: 28px; height: 28px;">
					<i class="fa-solid fa-check small"></i>
				</div>
				<div class="text-start" x-text="strings.theme_installed || 'Theme installed'"></div>
			</div>
			<template x-if="wizardData.add_sample_data">
				<div class="d-flex align-items-center gap-3 p-3 mb-2 bg-light rounded">
					<div class="bg-success rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white"
					     style="width: 28px; height: 28px;">
						<i class="fa-solid fa-check small"></i>
					</div>
					<div class="text-start" x-text="strings.sample_listings_added || 'Sample listings added'"></div>
				</div>
			</template>
		</template>
	</div>

	<!-- Upsell for Free Users -->
	<template x-if="!isPaidUser">
		<div class="border border-warning border-2 rounded-4 p-4 mt-4" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);">
			<div class="badge bg-warning text-dark mb-3">
				<i class="fa-solid fa-gem"></i>
				<span x-text="' ' + (strings.youre_on_free_plan || 'You\'re on the FREE plan')"></span>
			</div>

			<div class="fw-semibold text-dark mb-3" x-text="strings.youre_missing_out || 'You\'re missing out on:'"></div>

			<div class="d-flex flex-wrap gap-2 justify-content-center mb-3 small text-dark">
				<template x-if="step.upsell_features && step.upsell_features.length > 0">
					<template x-for="feature in step.upsell_features" :key="feature">
						<span x-text="'• ' + feature"></span>
					</template>
				</template>

				<!-- Default upsell features if none provided -->
				<template x-if="!step.upsell_features || step.upsell_features.length === 0">
					<span>• Advanced search filters</span>
					<span>• Multi-location support</span>
					<span>• Monetization features</span>
					<span>• And 26+ more addons</span>
				</template>
			</div>

			<div class="small mb-3 text-dark" x-text="strings.upgrade_anytime || 'Upgrade anytime, but some features work best when configured during setup.'"></div>

			<template x-if="wizardConfig.checkout_url">
				<button class="btn btn-warning text-dark fw-semibold"
				        @click="window.open(wizardConfig.checkout_url, '_blank')">
					<span x-text="strings.explore_pro_membership || 'Explore Pro Membership'"></span>
					<i class="fa-solid fa-arrow-right ms-2"></i>
				</button>
			</template>
		</div>
	</template>

	<!-- Go to Dashboard Button -->
	<div class="d-grid gap-2 mt-4">
		<button class="btn btn-primary btn-lg"
		        @click="goToDashboard()">
			<span x-text="strings.go_to_dashboard || 'Go to Dashboard'"></span>
			<i class="fa-solid fa-arrow-right ms-2"></i>
		</button>
	</div>

</div>
