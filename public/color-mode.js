const preferredColorScheme = matchMedia('(prefers-color-scheme: dark)');
const colorModeRoot = document.documentElement;

try {
  const savedMode = localStorage.getItem('handbook.color-mode');
  if (savedMode === 'dark' || savedMode === 'light') {
    colorModeRoot.dataset.colorPreference = savedMode;
  }
} catch {
  // Fall back to the system preference if storage is unavailable.
}

const applyColorScheme = ({ matches }) => {
  colorModeRoot.dataset.mode =
    colorModeRoot.dataset.colorPreference ?? (matches ? 'dark' : 'light');
};

applyColorScheme(preferredColorScheme);
preferredColorScheme.addEventListener('change', applyColorScheme);
