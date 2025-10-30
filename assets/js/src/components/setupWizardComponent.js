// assets/js/src/components/setupWizardComponent.js

/**
 * Setup Wizard Alpine.js Component
 *
 * Manages the state and logic for multi-step wizard flows.
 * Reuses framework field renderers and AJAX infrastructure.
 *
 * @param {Object} frameworkConfig - The localized wizard configuration from PHP
 * @returns {Object} Alpine.js component data and methods
 */
export default function setupWizardComponent(frameworkConfig) {
	if (!frameworkConfig) {
		console.error('Setup Wizard: No framework config provided');
		return {};
	}

	return {
		// --- STATE ---
		config: frameworkConfig || {},
		steps: [],
		currentStepIndex: 0,
		wizardData: {},
		isPaidUser: false,
		isConnecting: false,
		strings: {},
		wizardConfig: {},

		// --- LIFECYCLE ---
		init() {
			console.log('Setup Wizard Component Initialized', this.config);

			// Extract configuration
			this.steps = this.config.steps || [];
			this.strings = this.config.strings || {};
			this.wizardConfig = this.config.wizard_config || {};
			this.isPaidUser = this.config.is_connected || false;

			// Initialize wizard data with defaults from fields
			this.steps.forEach(step => {
				if (step.fields && Array.isArray(step.fields)) {
					step.fields.forEach(field => {
						if (field.id && field.default !== undefined) {
							this.wizardData[field.id] = field.default;
						}
					});
				}
			});

			console.log('Wizard Data Initialized:', this.wizardData);
		},

		// --- COMPUTED ---
		get currentStep() {
			return this.steps[this.currentStepIndex] || null;
		},

		// --- NAVIGATION METHODS ---
		nextStep() {
			if (this.currentStepIndex < this.steps.length - 1) {
				this.currentStepIndex++;
				this.scrollToTop();
			}
		},

		prevStep() {
			if (this.currentStepIndex > 0) {
				this.currentStepIndex--;
				this.scrollToTop();
			}
		},

		goToStep(index) {
			if (index >= 0 && index < this.steps.length) {
				this.currentStepIndex = index;
				this.scrollToTop();
			}
		},

		scrollToTop() {
			// Smooth scroll to top of wizard content
			const wizardContent = document.querySelector('.wizard-content');
			if (wizardContent) {
				wizardContent.scrollTop = 0;
			}
		},

		// --- WIZARD ACTIONS ---

		/**
		 * Continue with free version
		 */
		continueFree() {
			this.isPaidUser = false;
			this.nextStep();
		},

		/**
		 * Connect site using the Extensions Manager's connect_site AJAX action
		 */
		async connectSite() {
			this.isConnecting = true;

			try {
				const formData = new FormData();
				formData.append('action', this.config.tool_ajax_action || 'asf_tool_action_' + this.config.page_slug);
				formData.append('tool_action', 'connect_site');
				formData.append('nonce', this.config.tool_nonce || '');

				const response = await fetch(this.config.ajax_url || window.ajaxurl, {
					method: 'POST',
					body: formData
				});

				const result = await response.json();

				if (result.success) {
					// Check if already connected
					if (result.data.already_connected) {
						this.isPaidUser = true;
						this.showNotification(result.data.message || this.strings.already_connected || 'Site is already connected!', 'success');
						// Auto-advance after brief delay
						setTimeout(() => this.nextStep(), 1500);
					} else if (result.data.redirect_url) {
						// Need to redirect to connect
						window.location.href = result.data.redirect_url;
					} else {
						// Plugin activated, now get connect URL
						await this.getConnectUrl();
					}
				} else {
					this.showNotification(result.data?.message || this.strings.connection_failed || 'Connection failed', 'error');
				}
			} catch (error) {
				console.error('Connect site error:', error);
				this.showNotification(this.strings.connection_failed || 'Connection failed. Please try again.', 'error');
			} finally {
				this.isConnecting = false;
			}
		},

		/**
		 * Get the AyeCode Connect URL and redirect
		 */
		async getConnectUrl() {
			try {
				const formData = new FormData();
				formData.append('action', this.config.tool_ajax_action || 'asf_tool_action_' + this.config.page_slug);
				formData.append('tool_action', 'get_connect_url');
				formData.append('nonce', this.config.tool_nonce || '');

				const response = await fetch(this.config.ajax_url || window.ajaxurl, {
					method: 'POST',
					body: formData
				});

				const result = await response.json();

				if (result.success && result.data.redirect_url) {
					window.location.href = result.data.redirect_url;
				} else {
					this.showNotification(result.data?.message || 'Could not get connect URL', 'error');
				}
			} catch (error) {
				console.error('Get connect URL error:', error);
				this.showNotification('Failed to get connect URL', 'error');
			}
		},

		/**
		 * Complete the wizard and optionally save data
		 */
		async completeWizard() {
			console.log('Wizard Completed with data:', this.wizardData);

			// Optionally save wizard data via AJAX here
			// For now, just navigate to complete step
			const completeStepIndex = this.steps.findIndex(s => s.template === 'complete' || s.id === 'complete');
			if (completeStepIndex !== -1) {
				this.goToStep(completeStepIndex);
			} else {
				// If no complete step, go to last step
				this.currentStepIndex = this.steps.length - 1;
			}
		},

		/**
		 * Navigate to dashboard (or configured URL)
		 */
		goToDashboard() {
			const dashboardUrl = this.wizardConfig.dashboard_url || window.location.origin + '/wp-admin/';
			window.location.href = dashboardUrl;
		},

		// --- FIELD RENDERING ---

		/**
		 * Renders a field using the framework's renderer and converts bindings
		 * from 'settings.' to 'wizardData.'
		 *
		 * @param {Object} field - Field configuration
		 * @returns {string} HTML string with correct Alpine bindings
		 */
		renderField(field) {
			if (!field || !field.type) {
				return '<div class="alert alert-warning">Invalid field configuration</div>';
			}

			// Use the framework's field renderer
			if (typeof window.asfFieldRenderer !== 'undefined' && typeof window.asfFieldRenderer.renderField === 'function') {
				try {
					// Render with 'wizardData' as model prefix
					let html = window.asfFieldRenderer.renderField(field, 'wizardData');

					// Safety check: also replace any 'settings.' that might have slipped through
					html = html.replace(/settings\./g, 'wizardData.');

					return html;
				} catch (error) {
					console.error('Error rendering field:', field.type, error);
					return `<div class="alert alert-danger">Error rendering field: ${field.type}</div>`;
				}
			}

			// Fallback if renderer not available
			return `<div class="alert alert-info">Renderer not available for field type: ${field.type}</div>`;
		},

		/**
		 * Determines if a field should be shown based on conditions
		 *
		 * @param {Object} field - Field configuration with optional show_if conditions
		 * @returns {boolean} True if field should be shown
		 */
		shouldShowField(field) {
			if (!field.show_if) {
				return true;
			}

			// Reuse the framework's conditional logic if available
			if (typeof window.asfFieldRenderer !== 'undefined' && typeof window.asfFieldRenderer.evaluateConditions === 'function') {
				return window.asfFieldRenderer.evaluateConditions(field.show_if, this.wizardData);
			}

			// Simple fallback implementation
			const conditions = Array.isArray(field.show_if) ? field.show_if : [field.show_if];

			return conditions.every(condition => {
				const targetValue = this.wizardData[condition.field];
				const compareValue = condition.value;

				switch (condition.comparison || '===') {
					case '===':
						return targetValue === compareValue;
					case '!==':
						return targetValue !== compareValue;
					case '>':
						return targetValue > compareValue;
					case '<':
						return targetValue < compareValue;
					case '>=':
						return targetValue >= compareValue;
					case '<=':
						return targetValue <= compareValue;
					case 'includes':
						return Array.isArray(targetValue) && targetValue.includes(compareValue);
					case '!includes':
						return Array.isArray(targetValue) && !targetValue.includes(compareValue);
					default:
						return true;
				}
			});
		},

		// --- UTILITIES ---

		/**
		 * Show a notification to the user
		 *
		 * @param {string} message - The message to display
		 * @param {string} type - Notification type: 'success', 'error', 'info', 'warning'
		 */
		showNotification(message, type = 'info') {
			// Try to use framework's notification system
			if (typeof window.aui_toast === 'function') {
				window.aui_toast('wizard-notification', type, message);
			} else if (typeof window.aui_alert === 'function') {
				window.aui_alert(message, type === 'error' ? 'danger' : type, 5);
			} else {
				// Fallback to native alert
				alert(message);
			}
		}
	};
}
