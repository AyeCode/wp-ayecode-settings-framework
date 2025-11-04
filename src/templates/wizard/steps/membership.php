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
	<div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
	     style="width: 60px; height: 60px; font-size: 1.8rem;">
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
				<div class="col-6 d-flex align-items-center justify-content-centerx">
                    <span class="badge text-success bg-success-subtle mb-2x rounded-circle py-2 px-2 m-0 d-block fs-xm" ><i class="fa-solid fa-check"></i></span>
<!--                    <i class="fa-solid fa-circle-check text-success fs-6"></i>-->
					<span class="p-2 bg-lightx rounded small" x-text="feature"></span>
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

		<!-- Connect Button (for existing members - NOT connected) -->
		<button class="btn btn-outline-primary btn-lg"
		        @click="connectSite()"
		        :disabled="isConnecting"
		        x-show="!isConnected">
			<template x-if="!isConnecting">
				<span x-text="strings.i_have_membership || 'I have a membership, Log in'"></span>
				<i class="fa-solid fa-arrow-right ms-2"></i>
			</template>
			<template x-if="isConnecting">
				<span class="spinner-border spinner-border-sm me-2"></span>
				<span x-text="strings.connecting || 'Connecting...'"></span>
			</template>
		</button>

		<!-- Refresh Status Button (connected but NO active membership) -->
		<button class="btn btn-outline-success btn-lg"
		        @click="refreshMembershipStatus()"
		        :disabled="isRefreshing"
		        x-show="isConnected && !isMemberActive">
			<template x-if="!isRefreshing">
				<i class="fa-solid fa-arrows-rotate me-2"></i>
				<span x-text="strings.refresh_status || 'Refresh Status'"></span>
			</template>
			<template x-if="isRefreshing">
				<span class="spinner-border spinner-border-sm me-2"></span>
				<span x-text="strings.refreshing || 'Refreshing...'"></span>
			</template>
		</button>

		<!-- Continue Free Button -->
		<button class="btn btn-link"
		        @click="continueFree()"
		        x-text="strings.continue_with_free || 'Continue with Free'">
		</button>
	</div>

	<!-- License Key Input (for localhost only) -->
	<template x-if="config.is_localhost">
		<div class="mt-4 p-3 border rounded bg-light-subtle">
			<label class="form-label fw-semibold">
				<i class="fa-solid fa-key me-2"></i>
				<span x-text="strings.membership_key || 'Membership Key'"></span>
			</label>
			<input type="text"
			       x-model="wizardData.license_key"
			       class="form-control mb-2"
			       :placeholder="strings.enter_license_key || 'Enter your license key'">
			<button class="btn btn-secondary w-100"
			        @click="activateLicense()"
			        :disabled="!wizardData.license_key || isConnecting">
				<template x-if="!isConnecting">
					<span x-text="strings.activate_license || 'Activate License'"></span>
				</template>
				<template x-if="isConnecting">
					<span class="spinner-border spinner-border-sm me-2"></span>
					<span x-text="strings.activating || 'Activating...'"></span>
				</template>
			</button>
		</div>
	</template>

	<!-- Connected + Active Message -->
	<template x-if="isConnected && isMemberActive">
		<div class="alert alert-success mt-4 text-center">
			<i class="fa-solid fa-circle-check"></i>
			<span x-text="' ' + (strings.membership_active || 'Active membership detected!')"></span>
		</div>
	</template>

</div>
