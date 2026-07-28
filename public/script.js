const ch = document.querySelector("#ch");

async function recieve(api){
    const res = await fetch(api, {method: "POST"});
    const data = await res.json();
    return data;
}

