FROM node:latest
WORKDIR /ec2-user/server
COPY package*.json ./
RUN npm install
COPY . .
RUN npm build
EXPOSE 8080
CMD [ "npm" , "start" ]