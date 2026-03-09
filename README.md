# Bike Data Project — Web App

The frontend for [bikedataproject.org](https://www.bikedataproject.org), a citizen-driven initiative collecting cycling data to help make cities more bike-friendly.

Built with [SvelteKit](https://svelte.dev/docs/kit), [Svelte 5](https://svelte.dev), [Tailwind CSS](https://tailwindcss.com), and [MapLibre GL](https://maplibre.org).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage — mission statement, how to contribute, partner logos |
| `/share-data` | Authenticated page — GPX upload, mobile app link, provider integrations |
| `/datamap` | Interactive map of contributed cycling data |
| `/faq` | Frequently asked questions |
| `/about` | About the project |
| `/privacy` | Privacy policy |

## Getting started

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5000` by default. Authentication uses the production Keycloak instance — you'll need a valid account on bikedataproject.org to access the share-data page.

## Build

```bash
npm run build
```

Produces a static site in `build/` using `@sveltejs/adapter-static`.

## Configuration

Settings live in `src/lib/settings.ts` (local dev) and `src/lib/settings.prod.ts` (production). The CI pipeline copies the prod file before building.

| Setting | Description |
|---------|-------------|
| `public_url` | Base URL for the app and API proxy |
| `auth.authority` | Keycloak OIDC realm URL |
| `auth.client_id` | OIDC client ID |
| `auth.scope` | OIDC scopes |

## Deployment

Pushes to `main` trigger a CI build. Tagging a commit with `v*` (e.g., `v0.1.7`) triggers a production deploy via rsync and creates a GitHub release.

## Resources

- [Tailwind CSS](https://tailwindcss.com/) — styling
