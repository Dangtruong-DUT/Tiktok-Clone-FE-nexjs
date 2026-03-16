# docker/nginx/Dockerfile
# Stage 1: Build assets
FROM debian AS builder

# Install Node.js and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    nodejs \
    npm \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Set working directory
WORKDIR /var/www

# Copy Laravel backend source from the mono-repo root context
COPY ./backend /var/www

# Install Node.js dependencies and build assets
RUN npm install && npm run build

# Stage 2: Nginx production image
FROM nginx:alpine

# Copy custom Nginx configuration template.
# The official nginx entrypoint renders this template with envsubst at container start.
COPY ./docker/production/backend/nginx/nginx.conf /etc/nginx/templates/nginx.conf.template

# Render only CORS_ALLOW_ORIGIN to avoid touching native nginx variables like $uri.
ENV NGINX_ENVSUBST_TEMPLATE_DIR=/etc/nginx/templates \
    NGINX_ENVSUBST_TEMPLATE_SUFFIX=.template \
    NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx \
    NGINX_ENVSUBST_FILTER=^CORS_ALLOW_ORIGIN$

# Copy Laravel's public assets from the builder stage
# -----------------------------------------------------------
# We only need the 'public' directory from our Laravel app.
# -----------------------------------------------------------
COPY --from=builder /var/www/public /var/www/public

# Laravel uploaded files are typically exposed via the `public/storage` symlink.
# Since `storage` is a runtime volume, create the symlink in the image.
RUN ln -sfn /var/www/storage/app/public /var/www/public/storage

# Set the working directory to the public folder
WORKDIR /var/www/public

# Expose port 80 and start Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
