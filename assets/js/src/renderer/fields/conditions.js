import { registerRenderer } from '../index';

registerRenderer('conditions', (field) => {
    // Read config from the renderer's field
    const key  = field && field.warning_key ? String(field.warning_key) : null;
    const list = Array.isArray(field && field.warning_fields) ? field.warning_fields.slice(0) : [];

    // Only allow safe identifiers for dot access (no brackets in Alpine)
    const safeIdent = key && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : null;

    // Build a flat OR-chain with no braces/parentheses/arrays in the Alpine expression
    // e.g. editingField && editingField.htmlvar_name==="post_title" || editingField && ...
    const orChain = (safeIdent && list.length)
        ? list.map(v => `editingField && editingField.${safeIdent}===${JSON.stringify(v)}`).join(' || ')
        : '';

    // Escape double quotes for HTML attributes
    const exprAttr = orChain.replace(/"/g, '&quot;');

    return `
    <div>
        ${orChain ? `
        <div class="alert alert-warning small" x-show="${exprAttr}">
            This is a mandatory field. If hidden when submitted, it will fail.
        </div>` : ''}

        <template x-for="(condition, index) in editingField.conditions" :key="index">
            <div class="row g-2 mb-2 align-items-center">
                <div class="col">
                    <select class="form-select form-select-sm" x-model="condition.action">
                        <option value="">ACTION</option>
                        <option value="show">show</option>
                        <option value="hide">hide</option>
                    </select>
                </div>
                <div class="col-auto">if</div>
                <div class="col">
                    <select
                        class="form-select form-select-sm"
                        x-model="condition.field"
                        x-effect="$nextTick(()=>($el.value!==condition.field)&&($el.value=condition.field))"
                    >
                        <option value="">FIELD</option>
                        <template x-for="otherField in otherFields" :key="otherField._uid">
                            <option :value="otherField.value" x-text="otherField.label"></option>
                        </template>
                    </select>
                </div>
                <div class="col">
                    <select class="form-select form-select-sm" x-model="condition.condition">
                        <option value="">CONDITION</option>
                        <option value="empty">empty</option>
                        <option value="not empty">not empty</option>
                        <option value="equals to">equals to</option>
                        <option value="not equals">not equals</option>
                        <option value="greater than">greater than</option>
                        <option value="less than">less than</option>
                        <option value="contains">contains</option>
                    </select>
                </div>
                <div class="col">
                    <input type="text" class="form-control form-control-sm"
                        x-model="condition.value"
                        placeholder="VALUE"
                        :disabled="condition.condition === 'empty' || condition.condition === 'not empty'">
                </div>
                <div class="col-auto">
                    <button class="btn btn-sm btn-outline-danger" @click="removeCondition(index)">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        </template>

        <button class="btn btn-sm btn-primary mt-2" @click="addCondition()">
            <i class="fa-solid fa-plus me-1"></i> Add Rule
        </button>
    </div>
    `;
});
