// Keep global API shape for renderer; no-op if already present.
(function () {
    if (typeof window !== 'undefined') {
        if (!window.asfFieldRenderer) {
            // If you still enqueue your old field-renderer.js, this does nothing.
            // If not, you’ll see a console warning (so you know to migrate it next).
            console.warn('asfFieldRenderer global is not present. Ensure field-renderer.js is enqueued or migrate the renderer next.');
            window.asfFieldRenderer = {}; // prevent crashes on first load
        }
    }
})();
