const paths = {
  book: 'M12 6c-3-2-6-2-10-1v14c4-1 7-1 10 1 3-2 6-2 10-1V5c-4-1-7-1-10 1Zm0 0v14',
  arrow: 'M4 12h15m-6-6 6 6-6 6',
  globe:
    'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18m-2-5H5m14 10H5M12 3c4 4 4 14 0 18-4-4-4-14 0-18Z',
  robot:
    'M3 9H1m2 4H1m22-4h-2m2 4h-2M9 5V1m6 4V1M9 19v4m6-4v4M7 5h10a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4Zm2 6h.01m6 0h.01m-5 4h4',
  wrench:
    'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-7.9 7.9a2.1 2.1 0 0 1-3-3l7.9-7.9a6 6 0 0 1 7.9-7.9l-3.8 3.8Z',
  layers: 'm12 2 10 5-10 5L2 7l10-5Zm6 9 4 2-10 5-10-5 4-2m12 6 4 2-10 5-10-5 4-2',
  home: 'm2 11 10-9 10 9M5 9v12h5v-6h4v6h5V9',
  chevron: 'm9 5 7 7-7 7',
  down: 'm5 9 7 7 7-7',
  calendar: 'M3 7h18v14H3zM3 11h18M7 3v6m10-6v6',
  clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-5v5l3 2',
  tag: 'M13 3h7l1 8-10 10-8-8L13 3Zm4 4h.01',
  filter: 'M4 6h16M7 12h10m-7 6h4',
  check: 'm4 12 5 5L20 6',
  bolt: 'M12 2 4 14h7l-1 8 10-12h-7l3-8z',
  chain:
    'm10 14 4-4m-5 7-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0-1 2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0',
  external: 'M13 3h8v8m0-8L11 13m7-1v8H4V6h8',
};

export function HandbookIcon({ name }: { name: keyof typeof paths }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}
