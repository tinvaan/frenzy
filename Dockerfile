
FROM node:14-alpine

RUN mkdir -p /frenzy
WORKDIR /frenzy
ADD . /frenzy

RUN npm install --verbose

EXPOSE 3000

CMD ["npm", "start"]
