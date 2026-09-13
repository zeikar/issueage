# Contributing to Repozine

First off, thanks for taking the time to contribute! ❤️

## Getting Started

### Installation

You need lastest version of npm.

```bash
npm install
```

Node 22.22.2+, 24.15+ or 26+ is required (Astro needs 22.12+; the stricter requirement comes from jsdom).

### Scripts

Posts are fetched from the GitHub GraphQL API at build time, so `dev`, `build` and `check` all need a `GITHUB_TOKEN` (e.g. `GITHUB_TOKEN=$(gh auth token)`).

- `npm run dev` - start the dev server
- `npm run build` - build the static site and generate the Pagefind search index
- `npm run preview` - preview the built site
- `npm run check` - run `astro check`
- `npm test` - run the Vitest suite
- `npm run format` - format with Prettier

### Issues

Feel free to create new features, fix bugs issues.

### Pull requests

Create pull requests to contribute.
