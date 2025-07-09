# Use a small Node image
FROM node:18-alpine

WORKDIR /usr/src/app

# install deps
COPY package.json package-lock.json* ./
RUN npm install --production

# copy code
COPY . .

# expose and run
EXPOSE 3000
CMD ["npm", "start"]
