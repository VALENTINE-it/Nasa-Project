# Contributing to AURA-MED

Thank you for contributing to the NASA Space Apps hackathon project!

## Branch Naming

Create branches from `develop` using the format:
- `feat/<short-description>` — new features
- `fix/<short-description>` — bug fixes
- `chore/<short-description>` — maintenance, tooling, CI
- `docs/<short-description>` — documentation only
- `refactor/<short-description>` — code restructuring without behavior change

Example: `feat/frontend-add-vitals-chart`

## Commit Format

Use conventional commits: `<type>(<scope>): <subject>`

- **type**: feat, fix, chore, docs, refactor, style, test
- **scope**: backend, frontend, ci, repo, etc.
- **subject**: lowercase, imperative, under 72 chars, no period

Examples:
- `feat(frontend): add heart rate trend chart`
- `fix(backend): handle nil pointer in wearable parser`
- `chore(ci): add go build workflow`

## Pull Request Rules

- Target `develop` branch only
- At least one approving review required
- All CI checks must pass (go build/test, npm lint/build)
- No secrets, certs, keys, or `.env` files committed
- Keep PRs focused — one logical change per PR

## Running the Project

See [README.md](README.md) for detailed setup instructions.

Quick start:
```bash
make dev          # starts backend + frontend
# or
docker-compose up # single-origin container
```

## Code Style

- Go: `gofmt` (enforced in CI)
- Frontend: `oxlint` (enforced in CI)
- Line endings: LF (enforced via `.gitattributes`)

## Reporting Issues

Use GitHub Issues with the appropriate template. Include steps to reproduce, expected vs actual behavior, and environment details.