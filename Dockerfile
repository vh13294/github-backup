FROM node:16-alpine

WORKDIR /usr
COPY package.json ./
COPY tsconfig.json ./
COPY index.ts ./
# RUN ls -a
RUN npm install
RUN npm run build


## this is stage two , where the app actually runs
FROM node:16-alpine

ENV NODE_ENV production
ENV GITHUB_TOKEN please_enter_your_token
ENV BACKUP_DIR /github_backup
ENV TZ Asia/Phnom_Penh

WORKDIR /usr
COPY package.json ./
COPY --from=0 /usr/dist .
RUN npm install --only=production

# Cron
COPY ./cron/root /etc/crontabs/
COPY ./cron/daily_backup /etc/periodic/daily/
RUN chmod +x /etc/periodic/daily/daily_backup

CMD ["crond", "-f", "-l", "8"]