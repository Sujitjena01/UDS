const toggle = document.getElementById('modeToggle');
const saved = localStorage.getItem('theme') || 'dark';

document.documentElement.setAttribute('data-theme', saved);
toggle.checked = saved === 'light';
swapImages(saved);

toggle.addEventListener('change', () => {
    const theme = toggle.checked ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    swapImages(theme);
});

function swapImages(theme) {
    document.querySelectorAll('img[data-dark]').forEach(img => {
        img.src = theme === 'light' ? img.dataset.light : img.dataset.dark;
    });
}