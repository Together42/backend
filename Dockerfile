FROM node:18

RUN mkdir -p /app
WORKDIR /app
ADD . /app/

RUN rm yarn.lock || true
RUN rm package-lock.json || true
RUN yarn
RUN yarn install

ENV HOST 0.0.0.0
EXPOSE 3000

CMD [ "yarn", "dev"]