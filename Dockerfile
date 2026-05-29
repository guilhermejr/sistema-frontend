FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY /home/guilhermejr/deploy/sistema-frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY /home/guilhermejr/deploy/sistema-frontend/index.html /usr/share/nginx/html/index.html
EXPOSE 8081
