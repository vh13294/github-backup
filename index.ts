import { Octokit } from '@octokit/rest';
import { components } from '@octokit/openapi-types';
import { writeFileSync } from 'fs';

type repository = components['schemas']['repository'];

const octokit = new Octokit({
    auth: 'token',
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

    writeFileSync(`repo/${repo.name}-${repo.default_branch}.zip`, Buffer.from(data as ArrayBuffer));
}

function printRepoDetails(repo: repository) {
    console.log(repo.full_name);
    console.log('Download Completed \n');
}

listAllRepos();
