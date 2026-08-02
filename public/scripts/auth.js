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

optionCont.addEventListener("click", async (e)=>{
    const search = $("#search-container");
    const searchBox = $("#search-box");
    const searchClose = $("#search-close");
    if(e.target.closest("#sign-btn")){
        const path = window.location.pathname;
        const newPath = path === "/"? "/signup":"/";
        history.pushState({path: newPath}, "", newPath);
        updateUI(newPath);
    }
    else if(e.target.closest("#search-btn")){
        switchStyle(search);
        switchStyle(searchBox);
        searchBox.focus();
        searchClose.classList.add("search-close");
    }
    else if(e.target.closest("#search-close")){
        switchStyle(search);
        switchStyle(searchBox);
        searchClose.classList.remove("search-close");
    }
    else if(e.target.closest("#profile-btn")){
        switchStyle($("#profile-menu"));
    }
});

container.addEventListener("click", async (e)=> {
    $("#profile-menu")?.classList.remove("profile-menu-float");
    $("#profile-menu")?.classList.add("profile-menu");
    if(e.target.closest("#submit")){
        e.preventDefault();
        const path = window.location.pathname;
        const fullname = $("#Fullname")?.value.trim();
        const username = $("#Username")?.value.trim();
        const password = $("#Password")?.value.trim();
        if(fullname==="") inputstate($("#Fullname"), "Name");
        else if(!username) inputstate($("#Username"), "Username");
        else if(!password) inputstate($("#Password"), "Password");
        else {
            const api = path === "/"? "/signin":"/create";
            const response = await server(api, "POST", {
                ...(path !== '/' && {fullname:fullname}),
                username:username,
                password:password
            });
            if(response.status >= 400){
                const data = await response.json();
                $("#sign-msg").textContent = data.error;
                $("#sign-msg").classList.add("error");
            }
            else if(response.status == 201){
                path == '/signup' && history.pushState({path: "/"}, "", "/");
                inboxgenerate();
            }
        }
    }
});

window.addEventListener("popstate", async ()=> {
    updateUI(window.location.pathname);
});
