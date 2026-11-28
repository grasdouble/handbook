# Handbook

Bilingual learning paths and reference guides for AI, software architecture, and developer tools.

## Run locally

Use the Node.js and pnpm versions in `.tool-versions`. The Lufa Design System is installed from GitHub Packages; set `NODE_AUTH_TOKEN` to a token with package read access.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm build` creates a static site in `dist/client`. Run `pnpm preview` to serve those exact files locally. To check changes, run `pnpm lint`, `pnpm format:check`, `pnpm typecheck` (after the build), `pnpm test`, and `pnpm test:e2e` (after `pnpm exec playwright install chromium`).

French is served at `/`, `/guides/`, and unprefixed catalog and guide URLs. English uses the same paths under `/en/`. Old `/fr/` URLs are not redirected. The former `/en/library/` URL still redirects to `/en/`.

## Site theme

Handbook uses a dark theme regardless of the system color preference. `src/handbook.css` defines the shared palette, `src/catalog-library.css` styles the homepage and catalog cards, and `src/guide-page.css` styles the reading layout.

Guide index filters for topics and difficulty can be shared in the URL.

## Edit a guide

- Keep French and English bodies in sibling `<guide-id>.fr.md` and `<guide-id>.en.md` files.
- Edit localized titles and descriptions and shared publication metadata in the catalog’s `catalog.json`. `content/library.json` sets category and catalog order; the `guides` array in each catalog sets guide order.
- Keep unfinished guides marked `draft`. Set the shared status to `published` once both translations and `publishedAt` are ready. A publication date is displayed, not scheduled. Drafts are not included in the site.
- Add a bullet list immediately after an `À retenir` / `Key takeaways` heading to surface it in the reading sidebar. Place `<!-- guide-steps -->` on a separate line before an ordered list to display it as step cards.

## Publish

The repository can stay private if the organization’s GitHub plan supports Pages for private repositories. In Pages settings, select **GitHub Actions**, verify ownership of the domain, and set `handbook.grasdouble.fr` as the custom domain before creating a DNS `CNAME` that points to `grasdouble.github.io`. Enable **Enforce HTTPS** when available. GitHub ignores a repository `CNAME` file for custom Actions workflows.

Grant the repository read access to the Lufa packages in GitHub Packages. The workflow checks pull requests, then builds, verifies, and publishes `dist/client` on `main`.
