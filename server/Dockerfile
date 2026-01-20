# Use the official Puppeteer image which includes Chrome
# This is critical for PDF generation reliability
FROM ghcr.io/puppeteer/puppeteer:19.7.5

# Switch to root to install dependencies and copy files
USER root

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
# We use npm install instead of ci to be flexible, but ci is better for stability
RUN npm install
# or RUN npm ci --omit=dev

# Copy the rest of the application code
COPY . .

# Ensure permissions for the pptruser (default user in this image)
RUN chown -R pptruser:pptruser /usr/src/app

# Switch back to the non-root user provided by the image
USER pptruser

# Expose the API port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV DOCKER_CONTAINER=true
ENV PORT=5000

# Start command
CMD ["npm", "start"]
