FROM php:8.2-apache

# Install required system dependencies for Moodle extensions
RUN apt-get update && apt-get install -y \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libzip-dev \
    libxml2-dev \
    libicu-dev \
    libpq-dev \
    libsodium-dev \
    && rm -rf /var/lib/apt/lists/*

# Install and configure PHP extensions for Moodle
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        gd \
        intl \
        zip \
        soap \
        opcache \
        pgsql \
        pdo_pgsql \
        sodium

# Enable Apache rewrite module
RUN a2enmod rewrite

# Copy custom php.ini configuration
COPY php.ini /usr/local/etc/php/php.ini

# Create the Moodle data directory (outside the web root for security)
RUN mkdir -p /var/moodledata && chown -R www-data:www-data /var/moodledata

# Copy the moodle files into /var/www/html/learning to serve Moodle on the /learning subpath
COPY . /var/www/html/learning

# Set proper permissions on Moodle directory
RUN chown -R www-data:www-data /var/www/html/learning

# Expose port 80
EXPOSE 80
