FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Install root dependencies
RUN npm install

# Copy backend
COPY backend ./backend

# Copy frontend and build it
COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm install && npm run build

# Set working directory to backend
WORKDIR /app/backend

# Expose port
EXPOSE 5000

# Start the backend
CMD ["npm", "start"]
