# Stage 1: Build environment and Composer dependencies
FROM php:8.2-fpm AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    unzip \
    libpq-dev \
    libonig-dev \
    libssl-dev \
    libxml2-dev \
    libcurl4-openssl-dev \
    libicu-dev \
    libzip-dev \
    && docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    pdo_pgsql \
    pgsql \
    intl \
    zip \
    bcmath \
    soap \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get autoremove -y && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /var/www

# Copy only backend source from the mono-repo root context.
COPY ./backend /var/www

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && composer install --no-dev --optimize-autoloader --no-interaction --no-progress --prefer-dist

# Stage 2: Production environment
FROM php:8.2-fpm AS production

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    libicu-dev \
    libzip-dev \
    libfcgi-bin \
    procps \
    && apt-get autoremove -y && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN curl -o /usr/local/bin/php-fpm-healthcheck \
    https://raw.githubusercontent.com/renatomefi/php-fpm-healthcheck/master/php-fpm-healthcheck \
    && chmod +x /usr/local/bin/php-fpm-healthcheck

ARG DOCKER_ENV=production
COPY ./docker/production/backend/php-fpm/entrypoint.sh /usr/local/bin/entrypoint.production.sh
COPY ./docker/development/backend/php-fpm/entrypoint.sh /usr/local/bin/entrypoint.development.sh
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.production.sh /usr/local/bin/entrypoint.development.sh \
    && if [ "$DOCKER_ENV" = "production" ]; then \
        cp /usr/local/bin/entrypoint.production.sh /usr/local/bin/entrypoint.sh; \
    elif [ "$DOCKER_ENV" = "development" ]; then \
        cp /usr/local/bin/entrypoint.development.sh /usr/local/bin/entrypoint.sh; \
    else \
        echo "Unsupported DOCKER_ENV=$DOCKER_ENV (expected 'production' or 'development')" >&2; \
        exit 1; \
    fi \
    && chmod +x /usr/local/bin/entrypoint.sh \
    && rm -f /usr/local/bin/entrypoint.production.sh /usr/local/bin/entrypoint.development.sh

COPY ./backend/storage /var/www/storage-init

COPY --from=builder /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/
COPY --from=builder /usr/local/etc/php/conf.d/ /usr/local/etc/php/conf.d/
COPY --from=builder /usr/local/bin/docker-php-ext-* /usr/local/bin/

RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

COPY ./docker/common/backend/php-fpm/conf.d/*.conf /usr/local/etc/php-fpm.d/

COPY --from=builder /var/www /var/www

WORKDIR /var/www

RUN chown -R www-data:www-data /var/www

USER www-data

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

EXPOSE 9000
CMD ["php-fpm"]

# Stage 3: Development environment
FROM production AS development

ARG XDEBUG_ENABLED=true
ARG XDEBUG_MODE=develop,coverage,debug,profile
ARG XDEBUG_HOST=host.docker.internal
ARG XDEBUG_IDE_KEY=DOCKER
ARG XDEBUG_LOG=/dev/stdout
ARG XDEBUG_LOG_LEVEL=0

USER root

RUN if [ "${XDEBUG_ENABLED}" = "true" ]; then \
        pecl install xdebug && \
        docker-php-ext-enable xdebug && \
        echo "xdebug.mode=${XDEBUG_MODE}" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini && \
        echo "xdebug.idekey=${XDEBUG_IDE_KEY}" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini && \
        echo "xdebug.log=${XDEBUG_LOG}" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini && \
        echo "xdebug.log_level=${XDEBUG_LOG_LEVEL}" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini && \
        echo "xdebug.client_host=${XDEBUG_HOST}" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini && \
        echo "xdebug.start_with_request=yes" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini ; \
fi

ARG UID=1000
ARG GID=1000

RUN if getent group ${GID}; then \
            group_name=$(getent group ${GID} | cut -d: -f1); \
            useradd -m -u ${UID} -g ${GID} -s /bin/bash www; \
        else \
            groupadd -g ${GID} www && \
            useradd -m -u ${UID} -g www -s /bin/bash www; \
            group_name=www; \
        fi \
        && sed -i "s/user = www-data/user = www/g" /usr/local/etc/php-fpm.d/www.conf \
        && sed -i "s/group = www-data/group = ${group_name}/g" /usr/local/etc/php-fpm.d/www.conf

WORKDIR /var/www

COPY ./docker/development/backend/php-fpm/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh \
        && chmod +x /usr/local/bin/entrypoint.sh

USER www

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

EXPOSE 9000
CMD ["php-fpm"]
