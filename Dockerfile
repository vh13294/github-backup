FROM node:alpine

WORKDIR /usr
COPY package.json ./
COPY tsconfig.json ./
COPY index.ts ./
RUN ls -a
RUN npm install
RUN npm run build


## this is stage two , where the app actually runs
FROM node:alpine

ENV NODE_ENV production
ENV GITHUB_TOKEN please_enter_your_token
ENV BACKUP_DIR /github_backup

WORKDIR /usr
COPY package.json ./
COPY --from=0 /usr/dist .
RUN npm install --only=production
CMD ["node","index.js"]