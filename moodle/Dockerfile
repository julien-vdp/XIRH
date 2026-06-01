FROM php:8.3-apache

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
    unzip \
    git \
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
        sodium \
        exif

# Enable Apache rewrite module
RUN a2enmod rewrite

# Configure Apache Alias and fallback routing for Moodle 5.2 public directory
RUN echo 'Alias /learning /var/www/html/learning/public' > /etc/apache2/conf-available/moodle.conf \
    && echo '<Directory /var/www/html/learning/public>' >> /etc/apache2/conf-available/moodle.conf \
    && echo '    AllowOverride All' >> /etc/apache2/conf-available/moodle.conf \
    && echo '    Require all granted' >> /etc/apache2/conf-available/moodle.conf \
    && echo '    FallbackResource /learning/r.php' >> /etc/apache2/conf-available/moodle.conf \
    && echo '</Directory>' >> /etc/apache2/conf-available/moodle.conf \
    && a2enconf moodle

# Expose environment variables to PHP
RUN echo "PassEnv MOODLE_DB_HOST MOODLE_DB_NAME MOODLE_DB_USER MOODLE_DB_PASS MOODLE_DB_PORT MOODLE_WWWROOT" >> /etc/apache2/apache2.conf

# Copy custom php.ini configuration
COPY php.ini /usr/local/etc/php/php.ini

# Create the Moodle data directory (outside the web root for security)
RUN mkdir -p /var/moodledata && chown -R www-data:www-data /var/moodledata

# Copy the moodle files into /var/www/html/learning to serve Moodle on the /learning subpath
COPY . /var/www/html/learning

# Set working directory for composer
WORKDIR /var/www/html/learning

# Install Composer and download PHP dependencies for Moodle 5.2
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --no-interaction --no-progress --optimize-autoloader

# Set proper permissions on Moodle directory
RUN chown -R www-data:www-data /var/www/html/learning

# Custom entrypoint: purges Moodle theme cache on every startup so CSS changes apply
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port 80
EXPOSE 80

ENTRYPOINT ["docker-entrypoint.sh"]
