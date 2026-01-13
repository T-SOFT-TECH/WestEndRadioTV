# Stage 1: Build the Angular SSR app
FROM node:20 AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Explicitly remove any .runtime folder that might cause TS errors
RUN rm -rf .runtime

# Build the Angular app for SSR
RUN npm run build

# Stage 2: Create a lightweight production image
FROM node:20-slim AS runner

# Set working directory
WORKDIR /app

# Copy built files from the builder stage
COPY --from=builder /app/dist /app/dist

# Expose the port that the app will run on
EXPOSE 4000

# Run the SSR server
CMD ["node", "dist/westendradiotv-v2/server/server.mjs"]
