import { memo, useEffect, useId, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import ReactMarkdown, { type Components } from 'react-markdown';
import { unified, type Plugin } from 'unified';
import type { Heading, Parent, Root } from 'mdast';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { categories, type Catalog, type Guide, type Language } from '../library';
import { HandbookIcon } from './HandbookIcon';

export interface GuidePageProps {
  language: Language;
  catalog: Catalog;
  guide: Guide;
  markdown: string;
}

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

function plainText(node: unknown): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(plainText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    const props = node.props;
    if (props && typeof props === 'object' && 'children' in props) return plainText(props.children);
  }
  return '';
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}_\-\s]/gu, '')
    .replace(/\s+/g, '-');
}

function headingText(nodes: Heading['children']): string {
  return nodes
    .map((node) => {
      if ('value' in node && typeof node.value === 'string') return node.value;
      if ('alt' in node && typeof node.alt === 'string') return node.alt;
      if ('children' in node) return headingText(node.children);
      return '';
    })
    .join('');
}

function applyHeadingMetadata(tree: Root): HeadingItem[] {
  const nodes: Heading[] = [];
  const collect = (parent: Parent) => {
    for (const child of parent.children) {
      if (child.type === 'heading') nodes.push(child);
      if ('children' in child) collect(child);
    }
  };
  collect(tree);

  const used = new Set<string>();
  const baseline = nodes[0]?.depth ?? 1;
  let previousLevel = 1;
  return nodes.map((node) => {
    const text = headingText(node.children);
    const base = slugify(text) || 'section';
    let id = base;
    for (let suffix = 1; used.has(id); suffix++) id = `${base}-${suffix}`;
    used.add(id);
    const level = Math.max(2, Math.min(6, node.depth - baseline + 2, previousLevel + 1));
    previousLevel = level;
    node.data = {
      ...node.data,
      hName: `h${level}`,
      hProperties: { ...node.data?.hProperties, id },
    };
    return { id, text, level };
  });
}

const formatGuideMarkdown: Plugin<[], Root> = () => (tree) => {
  applyHeadingMetadata(tree);
  for (let index = 1; index < tree.children.length; index++) {
    const marker = tree.children[index - 1];
    const list = tree.children[index];
    if (
      marker.type === 'html' &&
      marker.value.trim() === '<!-- guide-steps -->' &&
      list.type === 'list' &&
      list.ordered
    ) {
      list.data = { ...list.data, hProperties: { className: ['guide-steps'] } };
      tree.children.splice(index - 1, 1);
      index--;
    }
  }
};

const markdownParser = unified().use(remarkParse).use(remarkGfm);

function readGuide(markdown: string) {
  const tree = markdownParser.parse(markdown);
  const headings = applyHeadingMetadata(tree);
  const summaryIndex = tree.children.findIndex(
    (node) =>
      node.type === 'heading' &&
      ['À retenir', 'Key takeaways'].includes(headingText(node.children)),
  );
  const list = summaryIndex === -1 ? undefined : tree.children[summaryIndex + 1];
  const takeaways =
    list?.type === 'list' && !list.ordered
      ? list.children.flatMap(({ children }) =>
          children.length === 1 && children[0].type === 'paragraph'
            ? [headingText(children[0].children)]
            : [],
        )
      : [];
  return {
    headings,
    takeaways,
    minutes: Math.max(1, Math.ceil(markdown.trim().split(/\s+/u).length / 220)),
  };
}

function MermaidDiagram({ source, label }: { source: string; label: string }) {
  const id = useId().replace(/:/g, '');
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    void import('mermaid')
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'default' });
        const rendered = await mermaid.render(`mermaid-${id}`, source);
        if (active) setSvg(rendered.svg);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [id, source]);

  if (!svg || error)
    return (
      <pre className="mermaid-fallback">
        <code>{source}</code>
      </pre>
    );
  return (
    <div
      className="mermaid-diagram"
      role="img"
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

const GuideArticle = memo(function GuideArticle({
  markdown,
  diagramLabel,
}: {
  markdown: string;
  diagramLabel: string;
}) {
  const components: Components = {
    pre: ({ children }) => {
      if (children && typeof children === 'object' && 'props' in children) {
        const props = children.props;
        if (
          props &&
          typeof props === 'object' &&
          'className' in props &&
          props.className === 'language-mermaid' &&
          'children' in props
        ) {
          return <MermaidDiagram source={plainText(props.children)} label={diagramLabel} />;
        }
      }
      return <pre>{children}</pre>;
    },
    a: ({ href, children }) => (
      <a href={href} {...(href?.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {children}
      </a>
    ),
  };
  return (
    <article className="markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm, formatGuideMarkdown]} components={components}>
        {markdown}
      </ReactMarkdown>
    </article>
  );
});

const guideLabels = {
  fr: {
    home: 'Accueil',
    breadcrumb: 'Fil d’Ariane',
    contents: 'Dans cette page',
    published: 'Publié le',
    updated: 'Mis à jour le',
    previous: 'Guide précédent',
    next: 'Guide suivant',
    pagination: 'Navigation entre les guides',
    diagram: 'Diagramme',
    topics: 'Thèmes',
    help: 'Besoin d’aide ?',
    helpText: 'Une question ou une suggestion ? Signalez-la sur GitHub.',
    github: 'Ouvrir une issue',
    takeaways: 'À retenir',
    related: 'Pages liées',
    reading: 'min de lecture',
    difficulty: { beginner: 'Fondamentaux', intermediate: 'Intermédiaire', advanced: 'Avancé' },
  },
  en: {
    home: 'Home',
    breadcrumb: 'Breadcrumb',
    contents: 'On this page',
    published: 'Published',
    updated: 'Updated',
    previous: 'Previous guide',
    next: 'Next guide',
    pagination: 'Guide navigation',
    diagram: 'Diagram',
    topics: 'Topics',
    help: 'Need help?',
    helpText: 'Have a question or suggestion? Let us know on GitHub.',
    github: 'Open an issue',
    takeaways: 'Key takeaways',
    related: 'Related pages',
    reading: 'min read',
    difficulty: { beginner: 'Fundamentals', intermediate: 'Intermediate', advanced: 'Advanced' },
  },
};

export function GuidePage({ language, catalog, guide, markdown }: GuidePageProps) {
  const strings = guideLabels[language];
  const { headings, takeaways, minutes } = useMemo(() => readGuide(markdown), [markdown]);
  const [currentHeading, setCurrentHeading] = useState<string>();
  const activeHeading = headings.some(({ id }) => id === currentHeading)
    ? currentHeading
    : headings[0]?.id;
  const category = categories.find(({ catalogs }) => catalogs.some(({ id }) => id === catalog.id));
  const guideIndex = catalog.guides.findIndex(({ id }) => id === guide.id);
  const previous = catalog.guides[guideIndex - 1];
  const next = catalog.guides[guideIndex + 1];
  const related = catalog.guides.slice(guideIndex + 1, guideIndex + 4);
  if (related.length < 3) {
    related.push(
      ...catalog.guides.slice(Math.max(0, guideIndex - (3 - related.length)), guideIndex).reverse(),
    );
  }
  const updated = guide.updatedAt === guide.publishedAt ? undefined : guide.updatedAt;
  const date = updated ?? guide.publishedAt;
  const dateLabel = new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(date));

  useEffect(() => {
    const items = headings.flatMap(({ id }) => {
      const element = document.getElementById(id);
      return element ? [element] : [];
    });
    if (items.length === 0) return;
    let frame = 0;
    function update() {
      frame = 0;
      const readingLine = window.innerHeight * 0.28;
      let current = items[0];
      for (const item of items) {
        if (item.getBoundingClientRect().top > readingLine) break;
        current = item;
      }
      setCurrentHeading(current.id);
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [headings]);

  const contents = (
    <ol>
      {headings.map(({ id, text, level }) => (
        <li key={id} className={level > 2 ? 'toc-nested' : undefined}>
          <a href={`#${id}`} aria-current={id === activeHeading ? 'location' : undefined}>
            {text}
          </a>
        </li>
      ))}
    </ol>
  );
  const categoryIcon =
    category?.id === 'ia-llm' ? 'robot' : category?.id === 'tooling' ? 'wrench' : 'layers';

  return (
    <div className="guide-reading-layout">
      <div className="guide-main">
        <nav className="guide-breadcrumb" aria-label={strings.breadcrumb}>
          <Link to="/$lang/" params={{ lang: language }} aria-label={strings.home}>
            <HandbookIcon name="home" />
          </Link>
          {category && (
            <>
              <HandbookIcon name="chevron" />
              <Link to="/$lang/" params={{ lang: language }} hash={`category-${category.id}`}>
                {category.title[language]}
              </Link>
            </>
          )}
          <HandbookIcon name="chevron" />
          <Link to="/$lang/$catalogId/" params={{ lang: language, catalogId: catalog.id }}>
            {catalog.title[language]}
          </Link>
          <HandbookIcon name="chevron" />
          <span aria-current="page">{guide.title[language]}</span>
        </nav>
        <header className="guide-heading">
          <span className="guide-difficulty">{strings.difficulty[guide.difficulty]}</span>
          <h1>{guide.title[language]}</h1>
          <p>{guide.description[language]}</p>
          <div className="guide-meta">
            <span>
              <HandbookIcon name="calendar" />
              {updated ? strings.updated : strings.published}{' '}
              <time dateTime={date}>{dateLabel}</time>
            </span>
            <span>
              <HandbookIcon name="clock" />~ {minutes} {strings.reading}
            </span>
            {guide.tags.length > 0 && (
              <span aria-label={strings.topics}>
                <HandbookIcon name="tag" />
                {guide.tags.join(', ')}
              </span>
            )}
          </div>
        </header>
        {catalog.id === 'llm-fundamentals' && (
          <img
            className="guide-cover"
            src="/guides/llm-cover.webp"
            alt=""
            width="816"
            height="202"
          />
        )}
        {headings.length > 0 && (
          <details className="guide-toc guide-toc-mobile">
            <summary>{strings.contents}</summary>
            <nav aria-label={strings.contents}>{contents}</nav>
          </details>
        )}
        <GuideArticle markdown={markdown} diagramLabel={strings.diagram} />
        {(previous || next) && (
          <nav className="guide-pagination" aria-label={strings.pagination}>
            {previous && (
              <Link
                className="guide-pagination-link"
                to="/$lang/$catalogId/$guideId/"
                params={{ lang: language, catalogId: catalog.id, guideId: previous.id }}
              >
                <span>{strings.previous}</span>
                <strong>{previous.title[language]}</strong>
              </Link>
            )}
            {next && (
              <Link
                className="guide-pagination-link next"
                to="/$lang/$catalogId/$guideId/"
                params={{ lang: language, catalogId: catalog.id, guideId: next.id }}
              >
                <span>{strings.next}</span>
                <strong>{next.title[language]}</strong>
              </Link>
            )}
          </nav>
        )}
      </div>

      <aside className="guide-rail">
        <h2 className="guide-rail-title">
          <HandbookIcon name={categoryIcon} />
          {category?.title[language] ?? catalog.title[language]}
        </h2>
        <nav
          className="guide-catalogs"
          aria-label={category?.title[language] ?? catalog.title[language]}
        >
          {(category?.catalogs ?? [catalog]).map((entry) => (
            <details key={entry.id} open={entry.id === catalog.id}>
              <summary>
                <HandbookIcon name="chevron" />
                {entry.title[language]}
              </summary>
              <ul>
                {entry.guides.map((item) => (
                  <li key={item.id}>
                    <Link
                      to="/$lang/$catalogId/$guideId/"
                      params={{ lang: language, catalogId: entry.id, guideId: item.id }}
                      activeOptions={{ exact: true }}
                    >
                      {item.title[language]}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </nav>
        <section className="guide-panel guide-help">
          <img src="/guides/help.webp" alt="" width="160" height="128" loading="lazy" />
          <h2>{strings.help}</h2>
          <p>{strings.helpText}</p>
          <a href="https://github.com/grasdouble/Handbook/issues/new">
            {strings.github}
            <HandbookIcon name="external" />
          </a>
        </section>
      </aside>

      <aside className="guide-outline">
        {headings.length > 0 && (
          <nav className="guide-toc" aria-label={strings.contents}>
            <h2>{strings.contents}</h2>
            {contents}
          </nav>
        )}
        {takeaways.length > 0 && (
          <section className="guide-panel">
            <h2>
              <HandbookIcon name="bolt" />
              {strings.takeaways}
            </h2>
            <ul className="guide-checklist">
              {takeaways.map((takeaway, index) => (
                <li key={index}>
                  <HandbookIcon name="check" />
                  {takeaway}
                </li>
              ))}
            </ul>
          </section>
        )}
        {related.length > 0 && (
          <section className="guide-panel guide-outline-links">
            <h2>
              <HandbookIcon name="chain" />
              {strings.related}
            </h2>
            <ul>
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    to="/$lang/$catalogId/$guideId/"
                    params={{ lang: language, catalogId: catalog.id, guideId: item.id }}
                  >
                    {item.title[language]}
                    <HandbookIcon name="arrow" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>
    </div>
  );
}
