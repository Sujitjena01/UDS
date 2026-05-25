// captcha.js

const captchaDisplay = document.getElementById('captchaDisplay');
const captchaRefreshBtn = document.getElementById('captchaRefreshBtn');
const captchaInput = document.getElementById('captchaInput');
const captchaStatus = document.getElementById('captchaStatus');

let currentCaptcha = '';

function generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    currentCaptcha = Array.from({ length: 5 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    captchaDisplay.textContent = currentCaptcha;
    captchaInput.value = '';
    captchaStatus.textContent = '';
    captchaStatus.className = 'captcha-status';
}

function validateCaptcha() {
    if (captchaInput.value === currentCaptcha) {
        captchaStatus.textContent = '✓';
        captchaStatus.className = 'captcha-status valid';
        return true;
    } else {
        captchaStatus.textContent = '✗ Invalid';
        captchaStatus.className = 'captcha-status invalid';
        generateCaptcha();
        return false;
    }
}

captchaRefreshBtn.addEventListener('click', generateCaptcha);

captchaInput.addEventListener('input', () => {
    if (captchaInput.value.length === 5) validateCaptcha();
});

generateCaptcha();