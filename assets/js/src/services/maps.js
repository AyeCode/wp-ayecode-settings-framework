export function initGdMap(ctx, fieldId, latField, lngField) {
    if (typeof window.GeoDirectoryMapManager === 'undefined' || typeof window.geodirMapData === 'undefined') {
        console.error(`Cannot initialize GD Map for '${fieldId}': GeoDirectory map scripts are not loaded on this page.`);
        const container = ctx.$refs[fieldId + '_map_canvas'];
        if (container) container.innerHTML = '<div class="alert alert-danger m-3">Error: GeoDirectory map scripts are not available.</div>';
        return;
    }
    ctx.$nextTick(() => {
        const container = ctx.$refs[fieldId + '_map_canvas'];
        if (!container) { console.error(`Map container not found for field '${fieldId}'.`); return; }
        const mapData = JSON.parse(JSON.stringify(window.geodirMapData));
        mapData.lat = ctx.settings[latField] || mapData.default_lat;
        mapData.lng = ctx.settings[lngField] || mapData.default_lng;
        mapData.lat_lng_blank = !ctx.settings[latField] && !ctx.settings[lngField];
        mapData.prefix = `${fieldId}_`;
        const callbacks = { onMarkerUpdate: (c) => { ctx.settings[latField] = parseFloat(c.lat).toFixed(6); ctx.settings[lngField] = parseFloat(c.lng).toFixed(6); } };
        window.GeoDirectoryMapManager.initMap(container.id, mapData, callbacks);
    });
}
