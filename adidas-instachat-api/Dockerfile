FROM php:7.2

RUN apt-get update && apt-get install -y libpng-dev git

RUN mkdir -p /app
WORKDIR /app
COPY . /app
RUN php -r "readfile('http://getcomposer.org/installer');" | php -- --install-dir=/usr/bin/ --filename=composer
RUN docker-php-ext-install gd exif
RUN composer install

ENTRYPOINT ["php"]
CMD ["-f", "/app/src/test.php"]

EXPOSE 1307