FROM node:16

# Web clinet installs
WORKDIR /usr/src/guppe/web
COPY ./web/package*.json ./
RUN npm ci

# server installs
WORKDIR /usr/src/guppe
COPY package*.json ./
RUN npm ci

# source
COPY . .

# web client build
WORKDIR /usr/src/guppe/web
RUN npm run build

# entry
WORKDIR /usr/src/guppe
EXPOSE 443 80
CMD [ "node", "index.js" ]
