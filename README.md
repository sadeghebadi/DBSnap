# DBSnap 📸

DBSnap is a lightweight, developer-first monorepo for automated database backups and visual diffing. It supports MongoDB and PostgreSQL, providing a simple way to see exactly what changed in your data.

## 🏗 Project Structure

This is a monorepo managed by [Turbo](https://turbo.build/).

- `apps/api`: The backend service.
- `apps/web`: The Next.js frontend application.
- `apps/worker`: Background worker for backups and diffing jobs.
- `packages/shared`: Shared types, utilities, and business logic.
- `issues/`: Individualized MVP task descriptions.
- `readyToDev/`: AI-ready prompts for each issue.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) (for local infrastructure)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd DBSnap

# Install dependencies
npm install
```

### Running Locally

To start all applications (`api`, `web`, `worker`) in development mode using Turbo:

```bash
npm run dev
```

This will run all services concurrently. You can visit the frontend at `http://localhost:3000` (default Next.js port).

### Building

To build all apps and packages:

```bash
npm run build
```

### Linting and Formatting

```bash
# Run linting
npm run lint

# Format code with Prettier
npm run format
```

## 📋 Issue Management

DBSnap uses a frozen MVP scope defined in `ISSUE_MASTER.md`. To work on an issue:

1. Refer to the corresponding file in `/issues`.
2. For AI-assisted development, use the corresponding prompt in `/readyToDev`.

If you update `ISSUE_MASTER.md`, regenerate the files using:

```bash
node scripts/split-issues.js
node scripts/split-issues-with-prompts.js
```

## 🤝 Contributing

Please see [CONTRIBUTING.md](./Minimal%20CONTRIBUTING.md) for guidelines on how to contribute to this project. One Issue = One PR.

---
Built with ❤️ by the DBSnap Team.
