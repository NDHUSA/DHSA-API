# https://hub.docker.com/_/node
FROM node:18

WORKDIR /usr/src/app
COPY package*.json ./

RUN apt update && apt install tzdata -y
ENV TZ="Asia/Taipei"

ARG PRIVATE_REPO_TOKEN
RUN npm install -g npm@9.6.2
RUN npm install git+https://yc97463:$PRIVATE_REPO_TOKEN@github.com/yc97463/DHSA-API-Private-Libs.git
RUN npm install pm2 -g

COPY . .

CMD ["pm2-runtime", "src/server.js"]