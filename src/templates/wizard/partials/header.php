<?php
/**
 * Wizard Header Template - Bootstrap 5.3+ Only
 *
 * Displays the wizard logo and dynamic progress bar using only Bootstrap classes.
 *
 * @package AyeCode\SettingsFramework
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// In this template context, $this refers to the Setup_Wizard instance
$plugin_name = $this->get_plugin_name();
?>
<header class="bg-light-subtle shadow-sm p-3 p-md-3 z-index-1">
	<div class="container-fluid">
		<div class="row align-items-center g-3">

			<!-- Logo -->
			<div class="col-auto">
				<div class="d-flex align-items-center gap-2 fs-5 fw-bold text-primary">
					<div class="bg-primary bg-gradient text-white rounded p-2 d-flex align-items-center justify-content-center " style="width:  40px; height: 40px;">
						<i class="fa-solid fa-wand-magic-sparkles"></i>
					</div>
					<?php echo esc_html( $plugin_name ); ?>
				</div>
			</div>

			<!-- Progress Bar -->
			<div class="col">
				<div class="d-flex align-items-center justify-content-center gap-2 overflow-auto">
					<template x-for="(step, index) in steps" :key="step.id">
						<div class="d-flex align-items-center gap-2">
							<!-- Connector Line (before all but first step) -->
							<template x-if="index > 0">
								<div class="border-top border-2 flex-shrink-0 d-none d-md-block"
								     :class="index < currentStepIndex ? 'border-success' : 'border-secondary-subtle'"
								     style="width: 40px;"></div>
							</template>

							<!-- Step Circle and Label -->
							<div class="d-flex align-items-center gap-2">
								<!-- Circle -->
								<div class="rounded-circle d-flex align-items-center justify-content-center fw-semibold flex-shrink-0 transition-all"
								     :class="{
									     'bg-primary text-white shadow': index === currentStepIndex,
									     'bg-success text-white': index < currentStepIndex,
									     'bg-secondary-subtle text-muted': index > currentStepIndex
								     }"
								     style="width: 40px; height: 40px;">
									<span x-show="index >= currentStepIndex" x-text="index + 1"></span>
									<i x-show="index < currentStepIndex" class="fa-solid fa-check"></i>
								</div>

								<!-- Step Label (hidden on mobile) -->
								<span class="small fw-medium d-none d-lg-inline text-nowrap"
								      :class="index === currentStepIndex ? 'text-primary fw-semibold' : 'text-muted'"
								      x-text="step.title"></span>
							</div>
						</div>
					</template>
				</div>
			</div>

			<!-- Dark Mode Toggle -->
			<div class="col-auto">
				<div class="d-flex align-items-center">
					<div class="mx-2 animate-scale d-inline-flex">
						<button @click="toggleTheme()"
						        class="bs-dark-mode-toggle btn btn-icon fs-6 btn-icon rounded-circle" role="button"
						        data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="<?php esc_attr_e( 'Toggle dark mode', 'ayecode-connect' ); ?>"
						        aria-label="<?php esc_attr_e( 'Toggle dark mode', 'ayecode-connect' ); ?>">
							<i x-show="theme === 'light'" class="fa-solid fa-sun animate-target"></i>
							<i x-show="theme === 'dark'" x-cloak class="fa-solid fa-moon animate-target"></i>
						</button>
					</div>
				</div>
			</div>

		</div>
	</div>
</header>
