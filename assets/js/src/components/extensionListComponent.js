/**
 * A reusable Alpine.js component for the Extension List Page.
 * @param {object} initialConfig The initial configuration object for this component instance.
 */
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

            let connectButtonHtml = isLocal
                ? `<button class='btn btn-primary w-100' onclick='window.asfConfirmResolve("connect")'>Enter Membership Key</button>`
                : `<button class='btn btn-primary w-100' onclick='window.asfConfirmResolve("connect")'>Connect Site to Install</button>`;

            const body = `
                <h3 class='h4 py-3 text-center text-dark'>${item.info.title} is a premium extension.</h3>
                <p class='text-center text-muted'>Please connect your site or purchase a license to continue.</p>
                <div class='d-grid gap-2 mt-4'>
                    <p class="text-muted small text-center mb-1">Already a member?</p>
                    ${connectButtonHtml}
                    <hr class="my-3">
                    <p class="text-muted small text-center mb-1">Or, purchase a new license:</p>
                    <a href='${item.info.link}' target='_blank' class='btn btn-outline-secondary w-100'>Purchase Extension</a>
                    <a href='${this.config.page_config?.membership_url || '#'}' target='_blank' class='btn btn-outline-secondary w-100'>View Memberships</a>
                </div>
            `;

            aui_modal('', body, '', false, '', '', 'sm');

            window.asfConfirmResolve = (choice) => {
                const modalEl = document.querySelector('.aui-modal.show');
                if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();

                if (choice === 'connect') {
                    // Dispatch a custom event that bubbles up to the main Alpine app
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
                    alert(data.data?.message || 'An unexpected error occurred. Please try again.');
                }
                return data;
            } catch (error) {
                alert('A network error occurred. Please check your connection and try again.');
                return { success: false, data: { message: 'Network error.' } };
            }
        }
    };
}
