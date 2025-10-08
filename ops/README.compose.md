# Compose usage

Base file: `docker-compose.yml` (root)
Dev override: `ops/docker_compose_archon_dev.override.yml`

Start stack:

```bash
docker compose -f docker-compose.yml -f ops/docker_compose_archon_dev.override.yml up --build
```

Secrets:

- `policies/env/archon_api.env` (local only; gitignored)
- Example: `policies/env/archon_api.env.example`
