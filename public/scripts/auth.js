async function server(api, method = "GET", data = null) {
    try {
        const fetchOptions = {
            method: method.toUpperCase(),
            headers: {},
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

const pusher = new Pusher("69cb07f696d28fd3387b", {
    cluster: "ap2",
    channelAuthorization: {
        endpoint: "/pusher/auth",
        transport: "ajax"
    }
});

async function sendMsg(a, b){
    const socketId = pusher.connection.socket_id;
    await server("/send", "POST", {
        receiver: a,
        content: b,
        socket_id: socketId
    });
}

async function updateUI(path){
    if(path=="/"){
        const res = await server("/session");
        const data = await res.json();
        if(data.loggedIn){
            inboxgenerate();
            $("#profile-title").textContent = data.fullname;
            $("#profile-btn").style.background="url("+data.profilepic+")";
            $("#profile-btn").style.backgroundSize = "100%";

            const chatPartner = prompt("username");
            const channelName = `private-chat-${[data.username, chatPartner].sort().join("-")}`;

            const channel = pusher.subscribe(channelName);

            channel.bind("new-message", (msg)=>{
                alert(msg.content);
            });
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
    e.stopPropagation();
    const search = $("#search-container");
    const searchBox = $("#search-box");
    const searchCls = $("#search-close");
    if(e.target.closest("#sign-btn")){
        const path = window.location.pathname;
        const newPath = path === "/"? "/signup":"/";
        history.pushState({path: newPath}, "", newPath);
        updateUI(newPath);
    }
    else if(e.target.closest("#search-btn")){
        stylechange(search, 1);
        stylechange(searchBox, 1);
        stylechange($("#profile-menu"), 0);
        searchBox.focus();
        searchCls.classList.add("search-close");
    }
    else if(e.target.closest("#search-container")){
        stylechange($("#profile-menu"), 0);
    }
    else if(e.target.closest("#profile-btn")){
        stylechange($("#profile-menu"));
    }
    else if(e.target.closest("#signout-btn")){
        const response = await fetch("/signout",{
            method: "POST",
            credentials: "include"
        });
        const data = await response.json();
        if(data.success) signin_form();
    }
});

header.addEventListener("click", (e)=>{
    stylechange($("#profile-menu"), false);
    const search = $("#search-container");
    const searchBox = $("#search-box");
    const searchCls = $("#search-close");
    if(e.target.closest("#search-close")){
        stylechange(search, 0);
        stylechange(searchBox, 0);
        searchCls.classList.remove("search-close");
    }
    else if(e.target.closest("#search-container")){
        stylechange($("#profile-menu"), 0);
    }
});

searchCont.addEventListener("keydown", async (e)=>{
    if(e.key === "Enter"){
        e.preventDefault();
        const res = await server("/search", "POST", {
            username: $("#search-box").value.trim()
        });
        const data = await res.json();
        stylechange($("#search-res-container"), 1);
        $("#search-name").innerText = data.fullname;
        $("#search-username").innerText = data.username;
        $("#search-icon").style.background="url("+data.profilepic+")";
        $("#search-icon").style.backgroundSize = "100%";
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
            const data = await response.json();
            if(response.status >= 400){
                $("#sign-msg").textContent = data.error;
                $("#sign-msg").classList.add("error");
            }
            else if(response.status == 201){
                path == '/signup' && history.pushState({path: "/"}, "", "/");
                inboxgenerate();
                $("#profile-title").textContent = data.fullname;
                $("#profile-btn").style.background="url("+data.profilepic+")";
                $("#profile-btn").style.backgroundSize = "100%";
            }
        }
    }
});

window.addEventListener("popstate", async ()=> {
    updateUI(window.location.pathname);
});
