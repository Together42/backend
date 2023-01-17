FROM node:18

RUN mkdir -p /app
WORKDIR /app
ADD . /app/

RUN rm yarn.lock || true
RUN rm package-lock.json || true
RUN yarn
RUN yarn install
RUN yarn swagger || true

ENV HOST 0.0.0.0
EXPOSE 9999

CMD ["yarn", "prod"]