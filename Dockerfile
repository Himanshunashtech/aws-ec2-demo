# Use the latest Node.js image
FROM node:latest

# Set the working directory
WORKDIR /home/app/

# Copy package files first (for better caching during builds)
COPY package*.json ./

# Install dependencies early to leverage Docker cache
RUN npm install

# Copy the entire project (except files specified in .dockerignore)
COPY . .

# Expose port 3030
EXPOSE 3030

# Start the application
CMD ["node", "index.js"]
