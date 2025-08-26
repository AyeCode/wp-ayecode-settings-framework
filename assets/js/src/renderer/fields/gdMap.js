import { registerRenderer } from '../index';
import { renderExtraAttributes } from '../helpers/attrs';
import { renderCustomDesc } from '../helpers/desc';

registerRenderer('gd_map', (field) => {
    if (!field.lat_field || !field.lng_field) {
        return `<div class="alert alert-danger">Error: 'gd_map' field type requires 'lat_field' and 'lng_field' properties.</div>`;
    }
    const mapId = `${field.id}_map_canvas`;
    const extra = renderExtraAttributes(field);
    const customDescHtml = renderCustomDesc(field);

    return `
    <div x-init="initGdMap('${field.id}', '${field.lat_field}', '${field.lng_field}')">
      <div class="row">
        <div class="col-md-4">
          <label class="form-label fw-bold mb-0">${field.label || field.id}</label>
          ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
        </div>
        <div class="col-md-8">
          <div class="row g-3 mb-3">
            <div class="col">
              <label for="${field.lat_field}" class="form-label small">Latitude</label>
              <input type="text" class="form-control" id="${field.lat_field}" name="${field.lat_field}" x-model="settings.${field.lat_field}" ${extra}>
            </div>
            <div class="col">
              <label for="${field.lng_field}" class="form-label small">Longitude</label>
              <input type="text" class="form-control" id="${field.lng_field}" name="${field.lng_field}" x-model="settings.${field.lng_field}" ${extra}>
            </div>
          </div>
          <div id="${mapId}" x-ref="${field.id}_map_canvas" style="height: 350px; width: 100%;" class="border rounded bg-light"></div>
          ${customDescHtml}
        </div>
      </div>
    </div>
  `;
});
