# Back Up github repo

Docker Hub:
https://hub.docker.com/r/vh13294/github-backup

In your docker

-   Volume

    -   /docker/github-backup : /github_backup

-   Environment
    -   GITHUB_TOKEN please_enter_your_token
    -   BACKUP_DIR /github_backup

# Details

-   Image is based of linux alpine which has built-in cron
-   Cron job is running daily at 2:00am
