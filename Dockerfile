
FROM node:14-alpine

RUN mkdir -p /frenzy
WORKDIR /frenzy
ADD . /frenzy

RUN npm ci --verbose
RUN npm run store -- up

EXPOSE 3000

CMD ["npm", "start"]
