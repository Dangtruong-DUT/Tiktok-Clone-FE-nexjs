Laravel Docker Development Setup
This project uses Docker and Docker Compose to provide a fully containerized development environment for a Laravel application.

The setup follows the official Docker Laravel development guide: https://docs.docker.com/guides/frameworks/laravel/development-setup/

Services
The development environment includes:

PHP-FPM – Runs the Laravel application
Nginx – Web server
PostgreSQL – Database
Workspace – CLI container (Artisan, Composer, NPM, etc.)
Xdebug – Enabled in development only
All services run inside Docker containers. No PHP, database, or web server installation is required on the host machine.

Architecture Overview
Browser
   ↓
Nginx (container)
   ↓
PHP-FPM (container with Xdebug)
   ↓
PostgreSQL (container)
The workspace container is used for running CLI commands and development tooling.

Docker Structure
docker/
├── common/
│   └── php-fpm/
├── development/
│   ├── php-fpm/
│   ├── workspace/
│   └── nginx/
├── production/
compose.dev.yaml
compose.prod.yaml
common/ → Shared base image
development/ → Development configuration (Xdebug, permissions)
production/ → Production-ready setup
compose.dev.yaml → Development environment
compose.prod.yaml → Production environment
Getting Started (Development)
Build and start containers
docker compose -f compose.dev.yaml up --build -d
Install dependencies
docker compose -f compose.dev.yaml exec workspace composer install
Run migrations
docker compose -f compose.dev.yaml exec workspace php artisan migrate
Access the application
Open in browser:

http://localhost
Running Artisan Commands
Use the workspace container:

docker compose -f compose.dev.yaml exec workspace php artisan <command>
Example:

docker compose -f compose.dev.yaml exec workspace php artisan make:model User -m
Xdebug Configuration
Xdebug is enabled in the development image.

Default configuration:

Mode: develop, debug, coverage, profile
Client host: host.docker.internal
Port: 9003
Make sure your IDE is listening for debug connections.

Database
PostgreSQL runs in a container.

Configure your .env file:

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=laravel
DB_USERNAME=laravel
DB_PASSWORD=secret
Stopping Containers
docker compose -f compose.dev.yaml down
To remove volumes:

docker compose -f compose.dev.yaml down -v
Production Build
To run the production environment:

docker compose -f compose.prod.yaml up --build -d
Production image:

No Xdebug
Optimized for performance
No development tooling
Benefits of This Setup
Environment consistency
No host dependency conflicts
Easy onboarding
Production-aligned development
Isolated services
Clean architecture