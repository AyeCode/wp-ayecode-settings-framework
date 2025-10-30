<?php
/**
 * Wizard Content Area Template - Bootstrap 5.3+ Only
 *
 * Renders the centered white content box using only Bootstrap classes.
 * Supports both template-based steps and field-based steps.
 *
 * @package AyeCode\SettingsFramework
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<!-- White card container with shadow -->
<div class="card shadow-lg border-0 rounded-4" style="max-width: 700px; width: 100%;" x-show="currentStep" x-cloak>
	<div class="card-body p-4 p-md-5">

		<!-- Loop through steps to render the active one -->
		<template x-for="(step, index) in steps" :key="step.id">
			<div x-show="index === currentStepIndex">

				<!-- Built-in Template Steps (membership, complete) -->
				<template x-if="step.template === 'membership'">
					<?php include __DIR__ . '/../steps/membership.php'; ?>
				</template>

				<template x-if="step.template === 'complete'">
					<?php include __DIR__ . '/../steps/complete.php'; ?>
				</template>

				<!-- Custom Field-Based Steps -->
				<template x-if="!step.template && step.fields">
					<div>
						<!-- Step Icon (if provided) -->
						<template x-if="step.icon">
							<div class="bg-primary bg-gradient text-white rounded-4 d-flex align-items-center justify-content-center mx-auto mb-4"
							     style="width: 80px; height: 80px; font-size: 2.5rem;">
								<span x-html="step.icon"></span>
							</div>
						</template>

						<!-- Step Title -->
						<h1 class="text-center fs-2 fw-bold mb-3" x-text="step.title"></h1>

						<!-- Step Description -->
						<template x-if="step.description">
							<p class="text-center text-muted mb-4" x-text="step.description"></p>
						</template>

						<!-- Render Fields -->
						<div class="mt-4">
							<template x-for="field in step.fields" :key="field.id">
								<div x-show="shouldShowField(field)" x-html="renderField(field)" class="mb-3"></div>
							</template>
						</div>

						<!-- Navigation Buttons -->
						<div class="d-flex gap-2 mt-4 justify-content-between">
							<button class="btn btn-light"
							        @click="prevStep()"
							        x-show="currentStepIndex > 0"
							        x-text="strings.back || 'Back'">
							</button>

							<button class="btn btn-primary ms-auto"
							        @click="nextStep()"
							        x-show="currentStepIndex < steps.length - 1"
							        x-text="strings.continue || 'Continue'">
							</button>

							<button class="btn btn-success ms-auto"
							        @click="completeWizard()"
							        x-show="currentStepIndex === steps.length - 1 && !step.template"
							        x-text="strings.complete_setup || 'Complete Setup'">
							</button>
						</div>
					</div>
				</template>

				<!-- Custom HTML Content Steps (if provided) -->
				<template x-if="!step.template && !step.fields && step.content_html">
					<div x-html="step.content_html"></div>
				</template>

			</div>
		</template>

	</div>
</div>
