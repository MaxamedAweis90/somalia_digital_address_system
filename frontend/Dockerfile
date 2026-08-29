# --- Stage 1: Build the React application ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: Serve using Nginx ---
FROM nginx:alpine

# Copy built assets from the builder stage to Nginx html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Nginx starts automatically by default