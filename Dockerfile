# ---------- Build stage ----------
FROM node:22-alpine AS build
WORKDIR /app

# Instala dependencias
COPY package*.json ./
RUN npm ci

# Copia el código y compila
COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:alpine

# Copia el build de Angular al docroot de nginx
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist/open-api-wizard/browser .

# Configuración nginx para SPA (fallback)
# (creamos el default.conf dentro de la imagen)
RUN cat > /etc/nginx/conf.d/default.conf <<'EOF'
server {
  listen 80 default_server;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(?:js|css|png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|eot)$ {
    try_files $uri =404;
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  location = /index.html {
    add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate";
    expires -1;
  }
}
EOF

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
