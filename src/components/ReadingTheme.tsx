import { useEffect, useState } from 'react';
import type { Language } from '../library';
import { HandbookIcon } from './HandbookIcon';

const modes = ['light', 'dark'] as const;
type Mode = (typeof modes)[number];
const labels = {
  fr: { theme: 'Apparence', light: 'Mode clair', dark: 'Mode sombre' },
  en: { theme: 'Appearance', light: 'Light mode', dark: 'Dark mode' },
};

export function ReadingTheme({ language }: { language: Language }) {
  const [mode, setMode] = useState<string>();

  useEffect(() => {
    const root = document.documentElement;
    const syncMode = () => setMode(root.dataset.mode);
    const observer = new MutationObserver(syncMode);
    observer.observe(root, { attributes: true, attributeFilter: ['data-mode'] });
    syncMode();
    return () => observer.disconnect();
  }, []);

  function selectMode(next: Mode) {
    const { dataset } = document.documentElement;
    dataset.colorPreference = next;
    dataset.mode = next;
    try {
      localStorage.setItem('handbook.color-mode', next);
    } catch {
      // The preference still applies to the current document.
    }
  }

  return (
    <div className="reading-theme" role="group" aria-label={labels[language].theme} hidden={!mode}>
      {modes.map((option) => (
        <button
          key={option}
          type="button"
          aria-label={labels[language][option]}
          aria-pressed={mode === option}
          onClick={() => selectMode(option)}
        >
          <HandbookIcon name={option === 'light' ? 'sun' : 'moon'} />
        </button>
      ))}
    </div>
  );
}
