# =========================
# Stage 1: Build Nuxt app
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps first (better cache)
COPY package*.json ./
RUN npm ci

# Copy rest of the app
COPY . .

# Build static site
RUN npm run generate

# =========================
# Stage 2: Nginx
# =========================
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Nuxt static output
COPY --from=builder /app/.output/public /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
