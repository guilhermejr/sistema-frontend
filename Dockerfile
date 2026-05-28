FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY config/nginx.conf /etc/nginx/conf.d/default.conf
COPY src/index.html /usr/share/nginx/html/index.html
EXPOSE 8081
