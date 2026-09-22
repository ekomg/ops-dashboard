const fs = require('fs');
const { loadApp, requireApp, APP_PATH } = require('./setup/loadApp');

const THEME_STORAGE_KEY = 'ops-dashboard-theme';

describe('theme: pure helpers', () => {
  const { nextTheme, themeLabel } = requireApp();

  test('nextTheme toggles between dark and light', () => {
    expect(nextTheme('dark')).toBe('light');
    expect(nextTheme('light')).toBe('dark');
  });

  test('themeLabel names the mode it stands for', () => {
    expect(themeLabel('dark')).toMatch(/dark/i);
    expect(themeLabel('light')).toMatch(/light/i);
  });
});

describe('theme: defaults and toggling', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('AC-4: defaults to the dark theme when nothing is stored', async () => {
    const { document } = await loadApp();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  test('AC-4: an unrecognised stored value falls back to dark', async () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'sepia');
    const { document } = await loadApp();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  test('AC-1: the toggle button names the theme a click will apply', async () => {
    const { document } = await loadApp();
    // Starts dark by default, so the button should offer to switch to light.
    expect(document.getElementById('theme-toggle').textContent).toMatch(/light/i);
  });

  test('AC-1/AC-2: clicking the toggle flips data-theme on <html> and the button label', async () => {
    const { document } = await loadApp();
    const button = document.getElementById('theme-toggle');

    button.click();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(button.textContent).toMatch(/dark/i);

    button.click();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(button.textContent).toMatch(/light/i);
  });

  test('AC-3: the chosen theme is persisted to localStorage', async () => {
    const { document } = await loadApp();
    document.getElementById('theme-toggle').click();
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  test('AC-3: a previously stored theme is restored on load', async () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
    const { document } = await loadApp();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.getElementById('theme-toggle').textContent).toMatch(/dark/i);
  });
});

describe('theme: no colour literals in app.js (AC-2)', () => {
  test('app.js contains no hex or rgb() colour literals', () => {
    const source = fs.readFileSync(APP_PATH, 'utf8');
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(source).not.toMatch(/rgb\(/i);
  });
});
