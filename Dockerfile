# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the Angular app (SPA mode, no SSR)
RUN npm run build

# Production stage - serve static files
FROM node:20-alpine AS runner

WORKDIR /app

# Install serve to host static files
RUN npm install -g serve

# Copy the built browser files
COPY --from=builder /app/dist/westendradiotv-v2/browser ./dist

# Expose the port
EXPOSE 3000

# Serve the static files with SPA fallback
CMD ["serve", "-s", "dist", "-l", "3000"]
