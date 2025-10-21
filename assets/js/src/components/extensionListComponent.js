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
        isConnecting: false,

        // Add properties to hold modal instances
        connectModal: null,
        purchaseModal: null,

        // Alpine's init() function, called when the component is first created.
        init() {
            // Get instances of the modals defined in the template
            if (this.$refs.connectModal) {
                this.connectModal = new bootstrap.Modal(this.$refs.connectModal);
            }
            if (this.$refs.purchaseModal) {
                this.purchaseModal = new bootstrap.Modal(this.$refs.purchaseModal);
            }
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

        async connect_site() {
            this.isConnecting = true;
            // Hide the purchase modal if it's open, and show the connecting modal
            this.purchaseModal?.hide();
            this.connectModal?.show();

            try {
                const activationResult = await this.do_ajax('connect_site');

                if (activationResult.success) {
                    if (activationResult.data.already_connected) {
                        showNotification(this, activationResult.data.message, 'success');
                        this.connectModal?.hide();
                        this.isConnecting = false;
                        return;
                    }

                    const urlResult = await this.do_ajax('get_connect_url');
                    if (urlResult.success && urlResult.data.redirect_url) {
                        // The modal will be hidden by the page navigation
                        window.location.href = urlResult.data.redirect_url;
                    } else {
                        this.connectModal?.hide();
                    }
                } else {
                    this.connectModal?.hide();
                }
            } catch (error) {
                this.connectModal?.hide();
            } finally {
                this.isConnecting = false;
            }
        },

        // Fetch data for this component
        async fetchExtensions() {
            this.isLoading = true;
            this.extensions = []; // Reset state before fetching

            if (this.config.source === 'static') {
                // Ensure static items also have a type property
                this.extensions = (this.config.static_items || []).map(item => ({
                    ...item,
                    type: item.type || this.config.api_config?.item_type || 'plugin' // Add type if missing
                }));
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
                    // Ensure fetched items also have a type property
                    this.extensions = (data.data.items || []).map(item => ({
                        ...item,
                        type: item.type || this.config.api_config?.item_type || 'plugin' // Add type if missing
                    }));
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
                // Use item.info.link directly if it's not from wp.org
                if (typeof aui_modal_iframe === 'function') {
                    aui_modal_iframe(item.info.title, item.info.link, '', true, 'aui-install-modal', 'modal-xl');
                } else {
                    console.error('aui_modal_iframe function not found.');
                    window.open(item.info.link, '_blank');
                }
            }
        },

        /**
         * Main handler for the toggle switch. Reads the event to see if toggling on or off.
         * @param {object} item The extension item being toggled.
         * @param {Event} event The browser change event.
         */
        handle_toggle(item, event) {
            const isTogglingOn = event.target.checked;

            // --- MODIFICATION START: Add check for active themes ---
            // If it's a theme that is already active, and the user is trying to toggle it off
            if (item.type === 'theme' && item.status === 'active' && !isTogglingOn) {
                event.target.checked = true; // Force it back on visually
                showNotification(this, 'To switch themes, please activate another one.', 'info');
                return; // Stop processing
            }
            // --- MODIFICATION END ---


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
                            showNotification(this, result.data?.message || `${item.info.title} installed & activated!`, 'success');
                            // --- MODIFICATION START: Update state locally ---
                            if (item.type === 'theme') {
                                // Set clicked theme to active, others to installed if they were active
                                this.extensions = this.extensions.map(ext => {
                                    if (ext.info.slug === item.info.slug) {
                                        return { ...ext, status: 'active' };
                                    } else if (ext.type === 'theme' && ext.status === 'active') {
                                        return { ...ext, status: 'installed' };
                                    }
                                    return ext;
                                });
                            } else { // It's a plugin
                                item.status = 'active'; // Directly mutate the item passed by reference
                            }
                            // --- MODIFICATION END ---
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
                            showNotification(this, result.data?.message || `${item.info.title} activated!`, 'success');
                            // --- MODIFICATION START: Update state locally ---
                            if (item.type === 'theme') {
                                this.extensions = this.extensions.map(ext => {
                                    if (ext.info.slug === item.info.slug) {
                                        return { ...ext, status: 'active' };
                                    } else if (ext.type === 'theme' && ext.status === 'active') {
                                        return { ...ext, status: 'installed' };
                                    }
                                    return ext;
                                });
                            } else { // It's a plugin
                                item.status = 'active';
                                showNotification(this, result.data?.message || `${item.info.title} activated!`, 'success');
                            }
                            // --- MODIFICATION END ---
                        } else {
                            event.target.checked = false; // Revert toggle on failure
                        }
                        this.itemActionInProgress = { ...this.itemActionInProgress, [item.info.slug]: false };
                    });
                } else {
                    // If already active (e.g., clicking an already active plugin toggle again)
                    this.itemActionInProgress = { ...this.itemActionInProgress, [item.info.slug]: false };
                }
            } else {
                // --- LOGIC FOR DEACTIVATING (Only for Plugins) ---
                if (item.type === 'plugin') {
                    this.do_ajax('deactivate_item', item).then(result => {
                        if (result.success) {
                            item.status = 'installed'; // Update status to 'installed'
                            showNotification(this, result.data?.message || `${item.info.title} deactivated.`, 'success');
                        } else {
                            event.target.checked = true; // Revert toggle on failure
                        }
                        this.itemActionInProgress = { ...this.itemActionInProgress, [item.info.slug]: false };
                    });
                } else {
                    // This block should theoretically not be reached for themes
                    this.itemActionInProgress = { ...this.itemActionInProgress, [item.info.slug]: false };
                }
            }
        },

        show_purchase_modal(item) {
            // Simply show the modal. The content is now in the template.
            this.purchaseModal?.show();
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