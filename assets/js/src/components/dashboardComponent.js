/**
 * A reusable Alpine.js component for a Dashboard page.
 * @param {object} config The configuration object for this specific dashboard page.
 */
export default function dashboardComponent(config) {

    // --- THE FIX ---
    // Prepare the initial state for all AJAX widgets BEFORE the component is created.
    // This ensures the data structure exists immediately and prevents race conditions.
    const initialWidgetData = {};
    const initialIsLoading = {};
    config?.widgets?.forEach(widget => {
        if (widget.ajax_action) {
            initialWidgetData[widget.id] = {};
            initialIsLoading[widget.id] = true;
        }
    });

    return {
        config,
        // Initialize with the pre-built, stable objects.
        widgetData: initialWidgetData,
        isLoading: initialIsLoading,

        /**
         * Component initialization.
         */
        init() {
            // The init method now only needs to start the data fetching process.
            this.config?.widgets?.forEach((widget) => {
                if (widget.ajax_action) {
                    this.fetch_widget_data(widget.id, widget.ajax_action, widget.params || {});
                }
            });
        },

        /**
         * Fetches data for a specific widget via AJAX.
         * @param {string} widgetId The unique ID of the widget.
         * @param {string} ajaxAction The specific tool action to run.
         * @param {object} params Optional parameters to send with the request.
         */
        async fetch_widget_data(widgetId, ajaxAction, params = {}) {
            try {
                const ajaxUrl = window?.ayecodeSettingsFramework?.ajax_url;
                const action = window?.ayecodeSettingsFramework?.tool_ajax_action;
                const nonce = window?.ayecodeSettingsFramework?.tool_nonce;

                if (!ajaxUrl || !action || !nonce) {
                    this._set_widget_data(widgetId, { error: 'Missing AJAX configuration.' });
                    return;
                }

                const response = await fetch(ajaxUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        action: action,
                        nonce: nonce,
                        tool_action: ajaxAction,
                        params: JSON.stringify(params),
                    }),
                });

                const data = await response.json();
                if (data?.success) {
                    this._set_widget_data(widgetId, data.data || {});
                } else {
                    this._set_widget_data(widgetId, { error: data?.data?.message || 'Failed to load.' });
                }
            } catch (error) {
                this._set_widget_data(widgetId, { error: 'A network error occurred.' });
            } finally {
                this.isLoading[widgetId] = false;
            }
        },

        /**
         * Helper to set widget data in a way that guarantees Alpine reactivity.
         */
        _set_widget_data(widgetId, payload) {
            this.widgetData = {
                ...this.widgetData,
                [widgetId]: payload,
            };
        },
    };
}