export function shouldShowField(ctx, field) {
    if (!field.show_if) return true;
    try {
        // Pass the context (either settings or editingField) down to the evaluator
        return evaluateCondition(ctx, field.show_if);
    }
    catch (e) { console.error(`Error evaluating show_if for "${field.id}":`, e); return true; }
}
export function evaluateCondition(ctx, rule) {
    // Replace placeholders with actual values
    const populated = rule.replace(/\[%(\w+)%\]/g, (m, id) => {
        const v = ctx[id];
        if (typeof v === 'string') return `'${v.replace(/'/g, "\\'")}'`;
        if (typeof v === 'boolean' || typeof v === 'number') return v;
        return 'null';
    });

    // Evaluate the expression with parentheses support
    return evaluateExpression(populated);
}

function evaluateExpression(expr) {
    expr = expr.trim();

    // Handle parentheses recursively
    while (expr.includes('(')) {
        // Find the innermost parentheses
        const regex = /\(([^()]+)\)/;
        const match = expr.match(regex);

        if (!match) {
            throw new Error('Mismatched parentheses');
        }

        // Evaluate the content inside parentheses
        const innerExpr = match[1];
        const innerResult = evaluateExpression(innerExpr);

        // Replace the parentheses with the result
        expr = expr.replace(match[0], innerResult ? 'true' : 'false');
    }

    // Now evaluate the expression without parentheses
    // Handle OR operations (||)
    if (expr.includes('||')) {
        const orGroups = expr.split('||');
        for (const orGroup of orGroups) {
            if (evaluateExpression(orGroup.trim())) {
                return true;
            }
        }
        return false;
    }

    // Handle AND operations (&&)
    if (expr.includes('&&')) {
        const andGroups = expr.split('&&');
        for (const andGroup of andGroups) {
            if (!evaluateExpression(andGroup.trim())) {
                return false;
            }
        }
        return true;
    }

    // Single comparison or boolean value
    return evaluateSimpleComparison(expr);
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
