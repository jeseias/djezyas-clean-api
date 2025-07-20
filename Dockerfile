# Use the official Bun image
FROM oven/bun:latest
# Set working directory
WORKDIR /app

# Copy package.json and bun.lockb (if exists)
COPY package.json ./
COPY bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Copy environment file if it exists
COPY .env* ./

# Expose the port dynamically (will be read from env at runtime)
EXPOSE ${PORT:-3333}

# Start the application
CMD ["bun", "run", "src/server.ts"] 