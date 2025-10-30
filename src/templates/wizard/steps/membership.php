<?php
/**
 * Wizard Membership Step Template - Bootstrap 5.3+ Only
 *
 * Built-in reusable template for the membership/connection step using only Bootstrap classes.
 *
 * @package AyeCode\SettingsFramework
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div>
	<!-- Step Icon -->
	<div class="bg-primary bg-gradient text-white rounded-4 d-flex align-items-center justify-content-center mx-auto mb-4"
	     style="width: 80px; height: 80px; font-size: 2.5rem;">
		<i class="fa-solid fa-rocket"></i>
	</div>

	<!-- Step Title -->
	<h1 class="text-center fs-2 fw-bold mb-3" x-text="step.title || strings.get_pro_membership || 'Get Pro Membership'"></h1>

	<!-- Step Description -->
	<p class="text-center text-muted mb-4" x-text="step.description || strings.access_premium_addons || 'Access all premium addons'"></p>

	<!-- Feature List -->
	<template x-if="step.features && step.features.length > 0">
		<div class="row g-2 mb-4">
			<template x-for="feature in step.features" :key="feature">
				<div class="col-6">
					<div class="p-2 bg-light rounded small" x-text="feature"></div>
				</div>
			</template>
		</div>
	</template>

	<!-- View All Link -->
	<template x-if="wizardConfig.view_all_url">
		<div class="text-center mb-4">
			<a :href="wizardConfig.view_all_url" target="_blank" class="text-decoration-none">
				<span x-text="strings.view_complete_list || 'View complete addon list'"></span>
				<i class="fa-solid fa-arrow-right small"></i>
			</a>
		</div>
	</template>

	<!-- Divider -->
	<hr class="my-4">

	<!-- Pricing Options -->
	<template x-if="step.pricing_options && step.pricing_options.length > 0">
		<div class="mb-4">
			<div class="fw-semibold text-center mb-3" x-text="strings.choose_your_plan || 'Choose Your Plan:'"></div>

			<template x-for="option in step.pricing_options" :key="option.value">
				<label class="d-flex align-items-center justify-content-between p-3 border rounded mb-2 cursor-pointer position-relative"
				       :class="{ 'border-primary bg-light': wizardData.selected_plan === option.value, 'border-2 border-success': option.recommended }">
					<input type="radio"
					       name="selected_plan"
					       x-model="wizardData.selected_plan"
					       :value="option.value"
					       class="me-3">
					<span class="flex-grow-1">
						<span class="fw-semibold" x-text="option.duration"></span>
					</span>
					<span class="text-success fw-semibold" x-text="option.savings"></span>
					<template x-if="option.recommended">
						<span class="position-absolute top-0 end-0 translate-middle badge bg-primary rounded-pill" x-text="strings.best_value || 'BEST VALUE'"></span>
					</template>
				</label>
			</template>

			<div class="text-center text-muted small mt-3">
				<i class="fa-solid fa-gem text-primary"></i>
				<span x-text="' ' + (strings.unlimited_sites || 'Unlimited sites') + ' • ' + (strings.cancel_anytime || 'Cancel anytime')"></span>
			</div>
		</div>
	</template>

	<!-- Action Buttons -->
	<div class="d-grid gap-2">
		<!-- Upgrade Button (goes to checkout) -->
		<template x-if="wizardConfig.checkout_url">
			<button class="btn btn-primary btn-lg"
			        @click="window.open(wizardConfig.checkout_url + '?plan=' + (wizardData.selected_plan || '12month'), '_blank')">
				<span x-text="strings.upgrade_now || 'Upgrade Now'"></span>
				<i class="fa-solid fa-arrow-right ms-2"></i>
			</button>
		</template>

		<!-- Connect Button (for existing members) -->
		<button class="btn btn-outline-primary btn-lg"
		        @click="connectSite()"
		        :disabled="isConnecting"
		        x-show="!isPaidUser">
			<template x-if="!isConnecting">
				<span x-text="strings.i_have_membership || 'I have a membership, Connect'"></span>
				<i class="fa-solid fa-arrow-right ms-2"></i>
			</template>
			<template x-if="isConnecting">
				<span class="spinner-border spinner-border-sm me-2"></span>
				<span x-text="strings.connecting || 'Connecting...'"></span>
			</template>
		</button>

		<!-- Continue Free Button -->
		<button class="btn btn-link"
		        @click="continueFree()"
		        x-text="strings.continue_with_free || 'Continue with Free'">
		</button>
	</div>

	<!-- Already Connected Message -->
	<template x-if="isPaidUser">
		<div class="alert alert-success mt-4 text-center">
			<i class="fa-solid fa-circle-check"></i>
			<span x-text="' ' + (strings.already_connected || 'Site is already connected!')"></span>
		</div>
	</template>

</div>
