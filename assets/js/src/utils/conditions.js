export function shouldShowField(ctx, field) {
    if (!field.show_if) return true;
    try { return evaluateCondition(ctx, field.show_if); }
    catch (e) { console.error(`Error evaluating show_if for "${field.id}":`, e); return true; }
}
export function evaluateCondition(ctx, rule) {
    const populated = rule.replace(/\[%(\w+)%\]/g, (m, id) => {
        const v = ctx.settings[id];
        if (typeof v === 'string') return `'${v.replace(/'/g, "\\'")}'`;
        if (typeof v === 'boolean' || typeof v === 'number') return v;
        return 'null';
    });
    const orGroups = populated.split('||');
    for (const or of orGroups) {
        const ands = or.split('&&');
        let ok = true;
        for (const cond of ands) { if (!evaluateSimpleComparison(cond.trim())) { ok = false; break; } }
        if (ok) return true;
    }
    return false;
}
export function evaluateSimpleComparison(expr) {
    if (!['==','!=','>','<','>=','<='].some(op => expr.includes(op))) {
        let v;
        try { v = JSON.parse(expr.toLowerCase()); }
        catch { v = expr.trim() !== ''; }
        return !!v;
    }
    const m = expr.match(/^(.*?)\s*(==|!=|>|<|>=|<=)\s*(.*)$/);
    if (!m) throw new Error(`Invalid comparison: "${expr}"`);
    let [, l, op, r] = m;
    const parse = (val) => {
        val = val.trim();
        if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) return val.slice(1, -1);
        if (!isNaN(val) && val !== '') return parseFloat(val);
        if (val === 'true') return true; if (val === 'false') return false; if (val === 'null') return null;
        return val;
    };
    const L = parse(l), R = parse(r);
    switch (op) { case '==': return L == R; case '!=': return L != R; case '>': return L > R; case '<': return L < R; case '>=': return L >= R; case '<=': return L <= R; default: throw new Error('op'); }
}
