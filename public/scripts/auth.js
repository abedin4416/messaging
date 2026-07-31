async function server(api, method = "GET", data = null) {
    try {
        const fetchOptions = {
            method: method.toUpperCase(),
            headers: {}
        };
        if (data && fetchOptions.method !== "GET") {
            fetchOptions.headers["Content-Type"] = "application/json";
            fetchOptions.body = JSON.stringify(data);
        }
        const res = await fetch(api, fetchOptions);
        return await res;
    } catch (error) {
        console.error("Fetch request failed:", error);
        throw error;
    }
}


async function updateUI(path){
    if(path=="/"){
        const res = await server("/session");
        const data = await res.json();
        if(data.loggedIn){
            inboxgenerate();
        }
        else {
            signin_form();
        }
    }
    else if(path=="/signup"){
        signup_form();
    }
}

document.addEventListener("DOMContentLoaded", async ()=> {
    await updateUI(window.location.pathname);
});

signBtn.addEventListener("click", async ()=> {
    const path = window.location.pathname;
    const targetPath = path === "/"? "/signup":"/";
    history.pushState({path: targetPath}, "", targetPath);
    updateUI(targetPath);
});

window.addEventListener("popstate", async ()=> {
    updateUI(window.location.pathname);
});
