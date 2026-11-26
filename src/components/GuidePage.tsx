import { useEffect, useId, useMemo, useState } from 'react';
import { Badge, Container, Text } from '@grasdouble/lufa_design-system';
import { Link } from '@tanstack/react-router';
import ReactMarkdown, { type Components } from 'react-markdown';
import { unified, type Plugin } from 'unified';
import type { Heading, Parent, Root } from 'mdast';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import type { Catalog, Guide, Language } from '../library';

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

const addHeadingMetadata: Plugin<[], Root> = () => (tree) => {
  applyHeadingMetadata(tree);
};

const markdownParser = unified().use(remarkParse).use(remarkGfm);

function readHeadings(markdown: string): HeadingItem[] {
  return applyHeadingMetadata(markdownParser.parse(markdown));
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

export function GuidePage({ language, catalog, guide, markdown }: GuidePageProps) {
  const isFrench = language === 'fr';
  const strings = isFrench
    ? {
        back: catalog.title.fr,
        contents: 'Dans ce guide',
        published: 'Publié le',
        updated: 'Mis à jour le',
        previous: 'Guide précédent',
        next: 'Guide suivant',
        diagram: 'Diagramme',
      }
    : {
        back: catalog.title.en,
        contents: 'In this guide',
        published: 'Published',
        updated: 'Updated',
        previous: 'Previous guide',
        next: 'Next guide',
        diagram: 'Diagram',
      };
  const headings = useMemo(() => readHeadings(markdown), [markdown]);
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeZone: 'UTC' }).format(
      new Date(value),
    );
  const guideIndex = catalog.guides.findIndex(({ id }) => id === guide.id);
  const previous = guideIndex > 0 ? catalog.guides[guideIndex - 1] : undefined;
  const next = guideIndex >= 0 ? catalog.guides[guideIndex + 1] : undefined;
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
          return <MermaidDiagram source={plainText(props.children)} label={strings.diagram} />;
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
  const contents = (
    <ol>
      {headings.map((heading) => (
        <li key={heading.id} className={`toc-level-${heading.level}`}>
          <a href={`#${heading.id}`}>{heading.text}</a>
        </li>
      ))}
    </ol>
  );

  return (
    <Container size="xl" className="library-page guide-page">
      <nav className="breadcrumb" aria-label={isFrench ? 'Fil d’Ariane' : 'Breadcrumb'}>
        <Link to="/$lang/$catalogId/" params={{ lang: language, catalogId: catalog.id }}>
          {strings.back}
        </Link>
      </nav>
      <header className="guide-heading">
        <Text as="h1" variant="h1">
          {guide.title[language]}
        </Text>
        <Text as="p" variant="body-large" color="secondary">
          {guide.description[language]}
        </Text>
        <div className="guide-meta">
          <Badge variant="default">
            {isFrench
              ? { beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé' }[
                  guide.difficulty
                ]
              : { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }[
                  guide.difficulty
                ]}
          </Badge>
          <span>
            {strings.published}{' '}
            <time dateTime={guide.publishedAt}>{formatDate(guide.publishedAt)}</time>
          </span>
          {guide.updatedAt && guide.updatedAt !== guide.publishedAt && (
            <span>
              {strings.updated}{' '}
              <time dateTime={guide.updatedAt}>{formatDate(guide.updatedAt)}</time>
            </span>
          )}
          <ul className="tag-list" aria-label={isFrench ? 'Thèmes' : 'Topics'}>
            {guide.tags.map((tag) => (
              <li className="tag" key={tag}>
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </header>
      <div className="guide-reading-layout">
        {headings.length > 0 && (
          <>
            <nav className="guide-toc" aria-label={strings.contents}>
              <Text as="h2" variant="h4">
                {strings.contents}
              </Text>
              {contents}
            </nav>
            <details className="guide-toc guide-toc-mobile">
              <summary>{strings.contents}</summary>
              <nav aria-label={strings.contents}>{contents}</nav>
            </details>
          </>
        )}
        <article className="markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm, addHeadingMetadata]} components={components}>
            {markdown}
          </ReactMarkdown>
        </article>
      </div>
      {(previous || next) && (
        <nav
          className="guide-pagination"
          aria-label={isFrench ? 'Navigation entre les guides' : 'Guide navigation'}
        >
          {previous ? (
            <Link
              className="guide-pagination-link previous"
              to="/$lang/$catalogId/$guideId/"
              params={{ lang: language, catalogId: catalog.id, guideId: previous.id }}
            >
              <span>{strings.previous}</span>
              <strong>{previous.title[language]}</strong>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              className="guide-pagination-link next"
              to="/$lang/$catalogId/$guideId/"
              params={{ lang: language, catalogId: catalog.id, guideId: next.id }}
            >
              <span>{strings.next}</span>
              <strong>{next.title[language]}</strong>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </Container>
  );
}
