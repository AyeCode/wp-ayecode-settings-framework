/**
 * A reusable Alpine.js component for the Extension List Page.
 * @param {object} initialConfig The initial configuration object for this component instance.
 */
import { showNotification } from '@/services/notifications';

export default function extensionListComponent(initialConfig) {
    return {
        // The component's internal configuration state.
        config: initialConfig,
        isLoading: true,
        extensions: [],
        searchQuery: '',
        priceFilter: 'all',
        itemActionInProgress: {}, // Tracks loading state for individual items

        // Alpine's init() function, called when the component is first created.
        init() {
            this.fetchExtensions();
        },

        /**
         * This method is called by the x-effect in the template whenever the parent's
         * activePageConfig changes. It decides if a refresh is needed.
         */
        update_config(newConfig) {
            // Only refresh data if the actual page config ID has changed.
            if (newConfig && newConfig.id !== this.config.id) {
                this.config = newConfig;
                this.fetchExtensions();
            }
        },

        // Fetch data for this component
        async fetchExtensions() {
            this.isLoading = true;
            this.extensions = []; // Reset state before fetching

            if (this.config.source === 'static') {
                this.extensions = this.config.static_items || [];
                this.isLoading = false;
                return;
            }

            try {
                const response = await fetch(window.ayecodeSettingsFramework.ajax_url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        action: window.ayecodeSettingsFramework.tool_ajax_action,
                        nonce: window.ayecodeSettingsFramework.tool_nonce,
                        tool_action: 'get_extension_data',
                        data: JSON.stringify(this.config.api_config || {})
                    })
                });
                const data = await response.json();

                if (data.success) {
                    this.extensions = data.data.items || [];
                } else {
                    console.error(data.data?.message || 'Failed to fetch extensions.');
                }
            } catch (error) {
                console.error('An error occurred while fetching extensions.', error);
            } finally {
                this.isLoading = false;
            }
        },

        // Computed property to filter items based on state
        get filteredItems() {
            let items = this.extensions;

            if (this.priceFilter !== 'all') {
                items = items.filter(item => {
                    const isFree = item.info.price === 0 || item.info.price === '0.00';
                    return this.priceFilter === 'free' ? isFree : !isFree;
                });
            }

            if (this.searchQuery.trim() !== '') {
                const query = this.searchQuery.toLowerCase().trim();
                items = items.filter(item => {
                    return item.info.title.toLowerCase().includes(query) ||
                        (item.info.excerpt && item.info.excerpt.toLowerCase().includes(query));
                });
            }

            return items;
        },

        // Component-specific methods
        get_price_text(item) {
            if (item.info.price === 0 || item.info.price === '0.00') {
                return 'Free';
            }
            let priceText = `$${parseFloat(item.info.price).toFixed(2)}`;
            if (item.info.is_subscription) {
                priceText += '<span class="text-sm font-normal text-gray-500"> / year</span>';
            }
            return priceText;
        },

        /**
         * Shows the appropriate info modal or opens a link based on the item source.
         * @param {object} item The extension item.
         */
        show_more_info(item) {
            if (item.info.source === 'wp.org') {
                const url = `/wp-admin/plugin-install.php?tab=plugin-information&plugin=${item.info.slug}&TB_iframe=true&width=772&height=551`;
                // Assuming aui_modal_iframe is globally available
                if (typeof aui_modal_iframe === 'function') {
                    aui_modal_iframe(item.info.title, url, '', true, 'aui-install-modal', 'modal-xl');
                } else {
                    console.error('aui_modal_iframe function not found.');
                    // Fallback to opening in a new tab if the modal function doesn't exist
                    window.open(url, '_blank');
                }
            } else {
                aui_modal_iframe(item.info.title, item.info.link, '', true, 'aui-install-modal', 'modal-xl');
            }
        },

        /**
         * Main handler for the toggle switch. Reads the event to see if toggling on or off.
         * @param {object} item The extension item being toggled.
         * @param {Event} event The browser change event.
         */
        handle_toggle(item, event) {
            const isTogglingOn = event.target.checked;

            if (this.itemActionInProgress[item.info.slug]) {
                return; // Action already in progress, prevent multiple clicks
            }

            this.itemActionInProgress = { ...this.itemActionInProgress, [item.info.slug]: true };

            if (isTogglingOn) {
                // --- LOGIC FOR ACTIVATING ---
                if (item.status === 'not_installed') {
                    // This handles both wp.org and premium extensions. The backend will decide what to do.
                    this.do_ajax('install_and_activate_item', item).then(result => {
                        if (result.success) {
                            item.status = 'active';
                            showNotification(this, result.data?.message || `${item.info.title} installed & activated!`, 'success');
                        } else {
                            event.target.checked = false; // Revert toggle on failure
                            if (result.data?.guidance_needed) {
                                this.show_purchase_modal(item);
                            }
                        }
                        this.itemActionInProgress = { ...this.itemActionInProgress, [item.info.slug]: false };
                    });
                } else if (item.status === 'installed') {
                    // If it's already installed, we just need to activate it.
                    this.do_ajax('activate_item', item).then(result => {
                        if (result.success) {
                            item.status = 'active';
                            showNotification(this, result.data?.message || `${item.info.title} activated!`, 'success');
                        } else {
                            event.target.checked = false; // Revert toggle on failure
                        }
                        this.itemActionInProgress = { ...this.itemActionInProgress, [item.info.slug]: false };
                    });
                }
            } else {
                // --- LOGIC FOR DEACTIVATING ---
                this.do_ajax('deactivate_item', item).then(result => {
                    if (result.success) {
                        item.status = 'installed'; // Update status to 'installed'
                        showNotification(this, result.data?.message || `${item.info.title} deactivated.`, 'success');
                    } else {
                        event.target.checked = true; // Revert toggle on failure
                    }
                    this.itemActionInProgress = { ...this.itemActionInProgress, [item.info.slug]: false };
                });
            }
        },

        show_purchase_modal(item) {
            const bannerConfig = this.config.page_config?.connect_banner || {};
            const isLocal = bannerConfig.is_localhost;

            const connectButtonHtml = `
                <button type="button" class="btn btn-primary btn-lg text-start ps-3" onclick="window.asfHandleModalAction('connect')">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-rocket fa-lg me-3"></i>
                        <div>
                            Connect & Install
                            <span class="d-block small opacity-75 fw-normal">One-click install &amp; automatic updates</span>
                        </div>
                    </div>
                </button>`;

            const enterKeyHtml = `<div class="text-center mt-3">
                    <a href="#" class="small" onclick="event.preventDefault(); window.asfHandleModalAction('enter_key')">Working on a local site? Enter your key instead.</a>
                </div>`;

            const body = `
        <button type="button" class="btn-close position-absolute p-3 end-0 z-index-1" data-bs-dismiss="modal" aria-label="Close" style="
"></button>
                    <div class="row g-0  align-items-startx">
                        <!-- Left Pane - Existing Member -->
                        <div class="col-lg-6 bg-light border-endx">
                            <div class="card bg-body-tertiary rounded-0 m-0 border-0 p-4 p-md-5 d-flex flex-column justify-content-top h-100">
                                <h4 class="fw-bold">Already a Member?</h4>
                                <p class="text-muted mb-4">If you're an existing member, connect your account to get started.</p>
                                <ul class="list-unstyled mb-4">
                                    <li class="d-flex align-items-center mb-2"><i class="fa-solid fa-circle-check fa-fw me-2 text-success"></i> No more license keys</li>
                                    <li class="d-flex align-items-center mb-2"><i class="fa-solid fa-circle-check fa-fw me-2 text-success"></i> One-click installs</li>
                                    <li class="d-flex align-items-center mb-2"><i class="fa-solid fa-circle-check fa-fw me-2 text-success"></i> Full demo site imports</li>
                                    <li class="d-flex align-items-center"><i class="fa-solid fa-circle-check fa-fw me-2 text-success"></i> Documentation & support widget</li>
                                </ul>
                                <div class="d-grid">
                                    ${isLocal ? '' : connectButtonHtml}
                                </div>
                                ${isLocal ? enterKeyHtml : ''}
                            </div>
                        </div>

                        <!-- Divider for mobile -->
                        <div class="col-12 d-lg-none"><hr class="my-0"></div>

                        <!-- Right Pane - New Customer -->
                        <div class="col-lg-6">
                            <div class="card rounded-0 m-0 border-0 p-4 p-md-5 d-flex flex-column justify-content-top h-100">
                                <h4 class="fw-bold">New Customer?</h4>
                                <p class="text-muted mb-4">Get the <strong>${item.info.title}</strong> extension and much more with a membership.</p>
                                <ul class="list-unstyled mb-4">
                                    <li class="d-flex align-items-center mb-2"><i class="fa-solid fa-circle-check fa-fw me-2 text-success"></i> Membership includes all addons</li>
                                    <li class="d-flex align-items-center mb-2"><i class="fa-solid fa-circle-check fa-fw me-2 text-success"></i> Includes all themes</li>
                                    <li class="d-flex align-items-center mb-2"><i class="fa-solid fa-circle-check fa-fw me-2 text-success"></i> Premium support</li>
                                    <li class="d-flex align-items-center"><i class="fa-solid fa-circle-check fa-fw me-2 text-success"></i> 30-day money-back guarantee</li>
                                </ul>
                                <div class="d-grid">
                                    <a href="${this.config.page_config?.membership_url || '#'}" target="_blank" class="btn btn-success btn-lg text-start ps-3">
                                        <div class="d-flex align-items-center">
                                            <i class="fas fa-star fa-lg me-3"></i>
                                            <div>
                                                View Membership Plans
                                                <span class="d-block small opacity-75 fw-normal"><strong>Best value</strong> - Unlock everything</span>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                                <div class="text-center mt-3">
                                    <a href="${item.info.link}" target="_blank" class="small">Just want to purchase this one extension?</a>
                                </div>
                            </div>
                        </div>
                    </div>
            `;

            // Use the aui_modal function, but with the new xl size and no footer
            aui_modal('', body, '', true, 'aui-premium-modal', 'modal-lg', 'p-0 rounded overflow-hidden');

            // This function will be called by the onclick attributes in the modal HTML
            window.asfHandleModalAction = (choice) => {
                const modalEl = document.querySelector('.aui-premium-modal.show');
                if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();

                if (choice === 'connect' || choice === 'enter_key') {
                    // Both actions navigate to the membership tab
                    this.$dispatch('navigate-to-section', { sectionId: 'membership' });
                }
            };
        },

        /**
         * Generic AJAX helper for actions.
         */
        async do_ajax(toolAction, item) {
            let body = {
                action: window.ayecodeSettingsFramework.tool_ajax_action,
                nonce: window.ayecodeSettingsFramework.tool_nonce,
                tool_action: toolAction,
                item_data: JSON.stringify(item) // Send the full item data
            };

            try {
                const response = await fetch(window.ayecodeSettingsFramework.ajax_url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(body)
                });
                const data = await response.json();

                if (!data.success && !data.data?.guidance_needed) {
                    showNotification(this, data.data?.message || 'An unexpected error occurred. Please try again.', 'error');
                }
                return data;
            } catch (error) {
                showNotification(this, 'A network error occurred. Please check your connection and try again.', 'error');
                return { success: false, data: { message: 'Network error.' } };
            }
        }
    };
}

