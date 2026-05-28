# FROM node:22-alpine AS build
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci
# COPY . .
# RUN npm run build --configuration=production

FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY config/nginx.conf /etc/nginx/conf.d/default.conf
# COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY --from=build src/index.html /usr/share/nginx/html/index.html
EXPOSE 8081
