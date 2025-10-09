/**
 * A reusable Alpine.js component for the Extension List Page.
 */
export default function extensionListComponent() {
    return {
        /**
         * Returns the appropriate price text for an item.
         * @param {object} item The extension item.
         */
        get_price_text(item) {
            if (item.info.price === 0 || item.info.price === '0.00') {
                return 'Free';
            }
            return `$${item.info.price}`;
        },

        /**
         * Determines the button's text, class, and action based on the item's status.
         * @param {object} item The extension item.
         */
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

        /**
         * Handles the action when a button is clicked.
         * @param {object} item The extension item.
         * @param {string} action The action to perform ('activate' or 'install').
         */
        handle_action(item, action) {
            if (!action) return;

            alert(`Performing action: ${action} for ${item.info.title}`);
            // You would typically make an AJAX call here to handle the action.
        }
    };
}