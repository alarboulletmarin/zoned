# Zoned

A static web app showcasing 136 scientific running workouts based on the 6-zone training system.

**Live demo:** https://zoned-blond.vercel.app/

## Quick Start

```bash
bun install
bun run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build

```bash
bun run build    # outputs to dist/
bun run preview  # preview production build
```

## Self-Hosted Deployment

### Docker Compose

```bash
docker compose up -d
```

Open [http://localhost:8080](http://localhost:8080)

### Manual Docker

```bash
docker build -t zoned .
docker run -d -p 8080:80 zoned
```

## Tech Stack

- React 19
- Vite 7
- Tailwind CSS 4
- Recharts
- i18next (FR/EN)

## License

MIT
