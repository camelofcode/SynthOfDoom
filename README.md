# SynthOfDoom

SynthOfDoom is a modern React and Web Audio synthesiser. It is a ground-up modernisation of the original Angular/Web Audio learning project preserved at the `legacy-angular` tag.

The modern shell, typed domain contracts, polyphonic/monophonic audio engine, unified input, accessible controls, complete responsive synth interface, and versioned local preset memory are now assembled; browser hardening is next. See [PROJECT_STATUS.md](PROJECT_STATUS.md) for the current handover and [MODERNISATION_PLAN.md](MODERNISATION_PLAN.md) for the full roadmap.

## Requirements

- Node.js 24 LTS (see `.nvmrc`)
- npm 11

## Local setup

```bash
nvm use
npm ci
npm run test:e2e:install
npm run dev
```

## Commands

| Command                | Purpose                                                   |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | Start the Vite development server                         |
| `npm run build`        | Type-check and build static production assets into `dist` |
| `npm run preview`      | Preview the built `dist` directory locally                |
| `npm run typecheck`    | Run strict TypeScript checks                              |
| `npm run lint`         | Run ESLint                                                |
| `npm run format`       | Format modern project files with Prettier                 |
| `npm run format:check` | Check formatting without changing files                   |
| `npm test`             | Run Vitest in watch mode                                  |
| `npm run test:run`     | Run unit/component tests once                             |
| `npm run test:e2e`     | Run the Playwright browser smoke tests                    |
| `npm run verify`       | Run the complete local quality gate                       |

The eventual production runtime is static: nginx can serve the generated `dist` directory over Certbot-managed HTTPS. Node is only required to develop, test, and build the project.

## Licence

[MIT](LICENSE)
