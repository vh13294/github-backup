import { Octokit } from '@octokit/rest';
import { components } from '@octokit/openapi-types';
import { writeFileSync } from 'fs';

type repository = components['schemas']['repository'];

function start() {
    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
    });
    listAllRepos(octokit);
}

async function listAllRepos(octokit: Octokit) {
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
        visibility: 'all',
        affiliation: 'owner',
        sort: 'full_name',
    });

    console.log(`*** total repos: ${data.length}\n`);

    for (const repo of data) {
        await downloadZip(octokit, repo);
        printRepoDetails(repo);
    }
}

async function downloadZip(octokit: Octokit, repo: repository) {
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

start();
