FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (devDependencies included for Prisma CLI and TS compilation)
RUN npm ci

# Generate Prisma Client specifically for the Alpine Linux runtime
RUN npx prisma generate

# Copy the remaining source code
COPY . .

EXPOSE 5000

# Run migrations to sync DB schema, then start the server
CMD ["sh", "-c", "npx prisma db push && node server.js"]