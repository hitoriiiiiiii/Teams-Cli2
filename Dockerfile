#Use official Node 20 image
FROM node:20-alpine

#Set working directory
WORKDIR /app

#Copy package.json and package-lock.json
COPY package*.json ./

#Install dependencies
RUN npm install

#Copy the rest of the application code
COPY . . .

#Build the TypeScript code
RUN npm run build

#Command to run the CLI application
CMD ["node", "dist/cli/index.js"]