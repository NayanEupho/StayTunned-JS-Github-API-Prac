let owner = 'denoland';
let repo = 'deno';
const token = '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'
let repoData;
let starData;
let arr = [];
let f_arr = [];
let map = new Map();

await Promise.all([fetch('https://api.github.com/repos/denoland/deno', {
    headers: {
        Authorization: `token ${token}`
      }
}),
fetch(`https://api.github.com/repos/${owner}/${repo}/stargazers`, {
    headers: {
        Authorization: `token ${token}`
      }
})]).then(responses => {
    
    const promises = responses.map(response => response.json());
    return Promise.all(promises);
}).then(data => {
    repoData = data[0];
    starData = data[1];

}).catch(error => {
    console.log(`can't fetch data from api`, error);
});

console.log(repoData);
console.log("=============================================================================================");
console.log(starData);
console.log("=============================================================================================");
for (let star in starData){
    let user_url = starData[star].url;
    let user_url_Obj = await fetch(user_url, {
        headers: {
            Authorization: `token ${token}`
          }
    });
    // .then(response => response.json());

    // arr.push(user_url_Obj.location);s

    user_url_Obj = await user_url_Obj.json();
    arr.push(user_url_Obj.location);
}

console.log(arr);
let max = 0;

for(let i = 0; i < arr.length; i++){
    let count = 0;
    for(let j = i; j < arr.length; j++){
        if(arr[i] == arr[j] || String(arr[j]).includes(String(arr[i])) || String(arr[i]).includes(String(arr[j]))){
            count++;
        }
    }
    if (count >= max && f_arr.length <= 3){
        f_arr.unshift(String(arr[i]));
        max = count;
    }
}

console.log(f_arr);