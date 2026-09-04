# ---- Build stage: compile the React/Vite frontend ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json vite.config.ts index.html metadata.json ./
COPY src ./src

RUN npx vite build

# ---- Serve stage: nginx serves static files + proxies /api to the backend ----
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
