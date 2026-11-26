const preferredColorScheme = matchMedia('(prefers-color-scheme: dark)');

const applyColorScheme = ({ matches }) => {
  document.documentElement.dataset.mode = matches ? 'dark' : 'light';
};

applyColorScheme(preferredColorScheme);
preferredColorScheme.addEventListener('change', applyColorScheme);
