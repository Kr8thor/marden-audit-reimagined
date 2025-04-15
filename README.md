# Marden Audit Frontend

## Project info

**Repository**: https://github.com/Kr8thor/marden-audit-reimagined.git  
**Production URL**: https://audit.mardenseo.com

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/Kr8thor/marden-audit-reimagined.git

# Step 2: Navigate to the project directory.
cd marden-audit-reimagined

# Step 3: Install the necessary dependencies.
npm ci

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

See the [DEPLOYMENT.md](./DEPLOYMENT.md) file for detailed deployment instructions to the production environment (audit.mardenseo.com).

## Development

```sh
# Install dependencies
npm ci

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Deployment

This project can be deployed in multiple ways:

1. Traditional web server (Nginx/Apache) - See [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Docker deployment - Using the included Dockerfile and docker-compose.yml
3. CI/CD automation - Set up GitHub Actions or similar for automated deployments

For production deployment to audit.mardenseo.com, please follow the instructions in [DEPLOYMENT.md](./DEPLOYMENT.md).
