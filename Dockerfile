# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the Angular SSR app
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy the built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev --legacy-peer-deps

# Expose the port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Start the SSR server
CMD ["node", "dist/westendradiotv-v2/server/server.mjs"]
