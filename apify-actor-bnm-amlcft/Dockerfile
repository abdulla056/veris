# Dockerfile for BNM AML/CFT Scraper Actor
# Using Playwright image for JavaScript rendering
FROM apify/actor-node-playwright-chrome:20

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source files
COPY . ./

# Build TypeScript
RUN npm run build

# Run the actor
CMD ["node", "dist/main.js"]
