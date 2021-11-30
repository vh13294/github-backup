import cron from 'node-cron';
import { Octokit } from '@octokit/rest';
import { components } from '@octokit/openapi-types';
import { writeFileSync } from 'fs';

type repository = components['schemas']['repository'];

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

async function listAllRepos() {
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
        visibility: 'all',
        affiliation: 'owner',
        sort: 'full_name',
    });

    console.log(`*** total repos: ${data.length}\n`);

    data.forEach((repo) => {
        downloadZip(repo);
        printRepoDetails(repo);
    });
}

async function downloadZip(repo: repository) {
    const owner = repo.owner?.login;

    if (owner === undefined) {
        throw Error(`failed to get owner for ${repo.name}`);
    }

    const { data } = await octokit.rest.repos.downloadZipballArchive({
        owner: owner,
        repo: repo.name,
        ref: repo.default_branch,
    });

    const backupDir = process.env.BACKUP_DIR;
    const dir = `${backupDir}/${repo.name}-${repo.default_branch}.zip`;
    writeFileSync(dir, Buffer.from(data as ArrayBuffer));
}

function printRepoDetails(repo: repository) {
    console.log(repo.full_name);
    console.log('Download Completed \n');
}

function isCronValid(expression: string) {
    const cronRegex = new RegExp(
        /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/,
    );
    return cronRegex.test(expression);
}

function start() {
    // every day 2am
    let defaultSchedule = '0 2 * * *';
    let inputSchedule = process.env.CRON;

    if (inputSchedule && isCronValid(inputSchedule)) {
        defaultSchedule = inputSchedule;
    }

    cron.schedule(defaultSchedule, () => {
        console.log('cron start');
        listAllRepos();
    });
}

start();
