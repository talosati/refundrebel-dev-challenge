# Development stage
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 4200

# Start the application
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll=2000"]
