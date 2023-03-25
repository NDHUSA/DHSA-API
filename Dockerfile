# Use the official lightweight Node.js 10 image.
# https://hub.docker.com/_/node
FROM node:18
# FROM node:18
# -slim

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY package*.json ./

RUN apt update && apt install tzdata -y
ENV TZ="Asia/Taipei"

# RUN --mount=type=secret,id=GITHUB_REPO_TOKEN
ARG PRIVATE_REPO_TOKEN

RUN npm install -g npm@9.6.2 && \ 
  npm install git+https://yc97463:$PRIVATE_REPO_TOKEN@github.com/yc97463/DHSA-API-Private-Libs.git
RUN npm install pm2 -g


# Copy local code to the container image.
COPY . .

# Run the web service on container startup.
# CMD [ "npm", "run", "start" ]
CMD ["pm2-runtime", "src/server.js"]