# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /usr/src/bot

# Copy package.json and package-lock.json to the working directory
COPY ../package*.json ./

# Install project dependencies
RUN npm install

# Copy the .env file (assuming it's in the same directory as Dockerfile)
COPY ../.env ./

# Copy the rest of the application code
COPY ../bot.js ./

# Expose a port (if your app uses one)
EXPOSE 3000

# Command to start your application
CMD ["node", "bot.js"]
