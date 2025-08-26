// Theme init/toggle (unchanged behaviour)
export function initTheme(ctx) {
    const saved = localStorage.getItem('asf_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    ctx.theme = saved ? saved : (prefersDark ? 'dark' : 'light');
    ctx.$watch?.('theme', (v) => localStorage.setItem('asf_theme', v));
}
export function toggleTheme(ctx) {
    ctx.theme = ctx.theme === 'light' ? 'dark' : 'light';
}
