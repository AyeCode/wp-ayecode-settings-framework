// assets/js/src/settings.js
// Alpine and Sort are now loaded via WordPress, so we remove the imports.

// ---- Alpine component (glue only) ----
import alpineApp from '@/app/alpineApp';

// ---- Import our new, modular list table component ----
import listTableComponent from '@/components/listTableComponent';

// Import the dashboard component
import dashboardComponent from '@/components/dashboardComponent';

// Import the extension list component
import extensionListComponent from '@/components/extensionListComponent';

// ---- Renderer dispatcher (publishes window.asfFieldRenderer and fallback logic) ----
import '@/renderer/index';

// ---- Register field renderers (self-register on import) ----
// Basic fields
import '@/renderer/fields/hidden';
import '@/renderer/fields/alert';
import '@/renderer/fields/text';
import '@/renderer/fields/password';
import '@/renderer/fields/number';
import '@/renderer/fields/textarea';

// Selectables & groups
import '@/renderer/fields/toggle';
import '@/renderer/fields/select';
import '@/renderer/fields/range';
import '@/renderer/fields/checkbox';
import '@/renderer/fields/radio';
import '@/renderer/fields/multiselect';
import '@/renderer/fields/checkboxGroup';
import '@/renderer/fields/group';
import '@/renderer/fields/accordion';

// Media & special
import '@/renderer/fields/image';
import '@/renderer/fields/color';
import '@/renderer/fields/icon';
import '@/renderer/fields/actionButton';
import '@/renderer/fields/linkButton';
import '@/renderer/fields/gdMap';
import '@/renderer/fields/helperTags';
import '@/renderer/fields/customRenderer';
import '@/renderer/fields/conditions';

// Optional extras (match your old file types if used)
import '@/renderer/fields/file';
import '@/renderer/fields/googleApiKey';



// ---- Expose the same global used by your HTML: x-data="ayecodeSettingsApp()" ----
if (typeof window !== 'undefined') {
    window.ayecodeSettingsApp = alpineApp;

}

// ---- Alpine Initialization ----
// This is the safest way to initialize Alpine and its plugins
// when scripts are loaded with `defer`.
// document.addEventListener('alpine:init', () => {
//     // The Sort plugin's script creates `window.AlpineSort`, which we use here.
//     window.Alpine.plugin(window.AlpineSort);
// });


// ---- Minimal readiness check (keeps original behaviour/logs) ----
document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.Alpine === 'undefined') {
        console.error('Alpine.js is required for AyeCode Settings Framework');
        return;
    }
    // Alpine is started globally now, so this can be simplified.
    console.log('AyeCode Settings Framework ready');
});

document.addEventListener("alpine:init", () => {
    if (Alpine.directive("sort")) {
        console.log("x-sort directive is available ✅");
        // Register our new list table component globally with Alpine.
        // Now, any element with `x-data="listTableComponent"` will use our new component.
        window.Alpine.data('listTableComponent', listTableComponent);

        // Register the dashboard component
        window.Alpine.data('dashboardComponent', dashboardComponent);

        // Register the extension list component
        window.Alpine.data('extensionListComponent', extensionListComponent);
    } else {
        console.log("x-sort directive not found ❌");
    }
});