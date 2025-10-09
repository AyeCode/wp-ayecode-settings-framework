/**
 * A reusable Alpine.js component for the Extension List Page.
 * @param {object} config The configuration object for this specific extension list instance.
 */
export default function extensionListComponent(config) {
    return {
        // Component-specific state
        config: config,
        isLoading: true,
        extensions: [],
        searchQuery: '',
        priceFilter: 'all',

        // Alpine's init() function, called when the component is loaded
        init() {
            this.fetchExtensions();
        },

        // Fetch data for this component
        async fetchExtensions() {
            this.isLoading = true;
            this.extensions = [];

            // Note: We are calling the main app's service method here.
            // This could be moved into a dedicated service if preferred.
            try {
                const response = await fetch(window.ayecodeSettingsFramework.ajax_url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        action: window.ayecodeSettingsFramework.tool_ajax_action,
                        nonce: window.ayecodeSettingsFramework.tool_nonce,
                        tool_action: 'get_extension_data',
                        data: JSON.stringify(this.config.api_config)
                    })
                });
                const data = await response.json();
                if (data.success) {
                    this.extensions = data.data.items;
                } else {
                    // You might want to access a global notification function here
                    console.error(data.data.message || 'Failed to fetch extensions.');
                }
            } catch (error) {
                console.error('An error occurred while fetching extensions.');
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

        get_button_state(item) {
            switch (item.status) {
                case 'active':
                    return { text: 'Active', class: 'btn-success', action: null };
                case 'installed_not_active':
                    return { text: 'Activate', class: 'btn-warning', action: 'activate' };
                default:
                    return { text: 'Install', class: 'btn-primary', action: 'install' };
            }
        },

        handle_action(item, action) {
            if (!action) return;
            // In a real app, you would likely dispatch a global event or call a service here
            alert(`Performing action: ${action} for ${item.info.title}`);
        }
    };
}