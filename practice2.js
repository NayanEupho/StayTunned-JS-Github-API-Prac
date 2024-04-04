import { Octokit } from "https://cdn.skypack.dev/@octokit/core";
const token = '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'
let node_url = "https://github.com/nodejs/node";
let deno_url = "https://github.com/denoland/deno";
let map = new Map();

const octokit = new Octokit();

async function repoFetch(url){
    try{
        let [, , , owner, repo] = String(url).split('/');

        const response = await octokit.request(`GET /repos/${owner}/${repo}`, {
            owner: owner,
            repo: repo
        });

        return response.data;
    }

    catch (error){
        console.error("couldn't fetch the data frrom Repo", error);
        throw error;
    }
}

// repoFetch(deno_url).then(repoDetails => {
//         console.log('Repository details:', repoDetails);})
//     .catch(error => {console.error(`couldn't get repo details`, error);});

console.log("\nRepository details of Node:", await repoFetch(node_url));
console.log("\nRepository details of Deno:", await repoFetch(deno_url));


// repoFetch(node_url).then(repoDetails => {
//         console.log('Repository details:', repoDetails);})
//         .catch(error => {console.error(`couldn't get repo details`, error);});

let deno_obj = await repoFetch(deno_url);
let node_obj = await repoFetch(node_url);


console.log('deno issue count', deno_obj.open_issues_count);
console.log('node issue count', node_obj.open_issues_count);

async function labels_count(repo_obj){
    let labels_count = 0;
    let page = 1;
    let page_limit = 100;
    let labels_arr = [];
    while(true){
        
        let labels_ulr = `${repo_obj.url}/labels?page=${page}&per_page=${page_limit}`
        let response = await fetch(labels_ulr, {
            headers: {
                Authorization: `token ${token}`
              }
        })
        
        let label = await response.json()
        if (label.length == 0){
            break;
        }

        let label_map = label.map(label => label.name);
        labels_arr.push(...label_map);
        labels_count += label.length;
        page++;
    }
    return {issue_count: repo_obj.open_issues_count, label_count: labels_count, labels_arr: labels_arr,};
}

let node_i_l = await labels_count(node_obj);
let deno_i_l = await labels_count(deno_obj);

map.set('node', node_i_l)
map.set('deno', deno_i_l);

console.log('lable count deno:', (await labels_count(deno_obj)).label_count);
console.log('lable count node:', (await labels_count(node_obj)).label_count);

console.log('\ndeno labels\n', (await labels_count(deno_obj)).labels_arr);
console.log('\nnode labels\n', (await labels_count(node_obj)).labels_arr);

console.log('node issues:', (map.get('node')).issue_count);
console.log('deno issues:', (map.get('deno')).issue_count);

let labels_common = (node_i_l.labels_arr).filter(label => (deno_i_l.labels_arr).includes(label));

console.log(labels_common);
console.log("common labels in Node and Deno repo" ,labels_common.length);

async function repo_contributors(repo_obj){
    let contributors_count = 0;
    let contributors_arr = [];
    let page = 1;
    let page_limit = 100;
    
    while(true){
        let contributors_url = `${repo_obj.url}/contributors?page=${page}&per_page=${page_limit}`
        let response = await fetch(contributors_url, {
            headers: {
                Authorization: `token ${token}`
              }
        })

        let contributors = await response.json();
        if(contributors.length == 0){
            break;
        }
        let contributors_map = contributors.map(contributors => contributors.login);
        contributors_arr.push(...contributors_map);
        contributors_count += contributors.length;
        page++;
    }

    return {contributor_count: contributors_count, contributor_arr: contributors_arr}
}

let deno_contributor_obj = await repo_contributors(deno_obj);
let node_contributor_obj = await repo_contributors(node_obj);

console.log("\nDeno contributers", deno_contributor_obj.contributor_arr);
console.log(deno_contributor_obj.contributor_count);

console.log("\nNode contributers", node_contributor_obj.contributor_arr);
console.log(node_contributor_obj.contributor_count);

let deno_contributors = deno_contributor_obj.contributor_arr;
let node_contributors = node_contributor_obj.contributor_arr;
let max_contri = (node_contributors.length >= deno_contributors.length) ? node_contributors : deno_contributors;
let min_contri = (max_contri === node_contributors) ? deno_contributors : node_contributors;

let common_contributors = max_contri.reduce((common, contri) => {
    if(min_contri.includes(contri)){
        common.push(contri);
    }
    return common;
}, []);

console.log("\ncommon contributers in Node and Deno repo", common_contributors);
console.log(common_contributors.length);