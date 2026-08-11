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

let pusher = null;
async function sendMsg(receiver, message){
    const socketId = pusher.connection.socket_id;
    await server("/send", "POST", {
        receiver: receiver,
        content: message,
        socket_id: socketId
    });
}

function channel(userA, userB=""){
    const type = userB? "chat-":"inbox";
    const channelName = `private-${type}${[userA, userB].sort().join("-")}`;
    const channel = pusher.subscribe(channelName);
    return channel;
}

function loadInbox(data){
    inboxgenerate();
    $("#profile-title").textContent = data.fullname;
    $("#profile-btn").style.backgroundImage="url('"+data.profilepic+"')";
    $("#profile-btn").style.backgroundSize = "90%";

    const inboxdata = data.inboxdata;
    const inboxlength = inboxdata && Object.keys(inboxdata).length;
    if(inboxdata){
        for(let i = inboxlength-1; i >= 0; i--){
            inboxupdate(inboxdata[i], data.username);
        }
    }

    pusher = new Pusher("69cb07f696d28fd3387b", {
        cluster: "ap2",
        channelAuthorization: {
        endpoint: "/pusher/auth",
        transport: "ajax"
        }
    });
    const ch = channel(data.username);
    ch.bind("new-message", (msg)=>{
        inboxupdate(msg);
    });
}

async function updateUI(path){
    if(path=="/"){
        const res = await server("/session");
        const data = await res.json();
        if(res.status == 200) loadInbox(data);
        else {
            pusher && pusher.disconnect();
            pusher = null;
            signin_form();
        }
    }
    else if(path=="/signup"){
        pusher && pusher.disconnect();
        pusher = null;
        signup_form();
    }
}

document.addEventListener("DOMContentLoaded", async ()=> {
    await updateUI(window.location.pathname);
});

optionCont.addEventListener("click", async (e)=>{
    e.stopPropagation();
    if(e.target.closest("#sign-btn")){
        const path = window.location.pathname;
        const newPath = path === "/"? "/signup":"/";
        history.pushState({path: newPath}, "", newPath);
        updateUI(newPath);
    }
    else if(e.target.closest("#search-btn")){
        stylechange("search-container", "float");
        stylechange("search-box", "float");
        stylechange("profile-menu");
        stylechange("search-close", "float");
        $("#search-box").focus();
    }
    else if(e.target.closest("#search-container")){
        stylechange("profile-menu");
    }
    else if(e.target.closest("#profile-btn")){
        const x = $("#profile-menu").classList.contains("profile-menu-float");
        x || stylechange("profile-menu", "float");
        x && stylechange("profile-menu");
    }
    else if(e.target.closest("#signout-btn")){
        const response = await server("/signout", "POST", {});
        const data = await response.json();
        if(data.success){
            pusher && pusher.disconnect();
            pusher = null;
            signin_form();
        }
    }
});

header.addEventListener("click", (e)=>{
    stylechange("profile-menu");
    if(e.target.closest("#search-close")){
        stylechange("search-container");
        stylechange("search-box");
        stylechange("search-close");
        stylechange("inbox-wrapper");
        stylechange("search-res-container");
        $("#search-box").value = "";
    }
    else if(e.target.closest("#search-container")){
        stylechange("profile-menu");
    }
});

searchCont.addEventListener("keydown", async (e)=>{
    if(e.key === "Enter"){
        e.preventDefault();
        stylechange("search-box", "float");
        const x = $("#search-container").classList.contains("search-container");
        x && stylechange("search-container", "x")
        && stylechange("search-close", "x")
        && stylechange("search-box", "float");
        stylechange("inbox-wrapper", "x");
        const res = await server("/search", "POST", {
            username: $("#search-box").value.trim()
        });
        const data = await res.json();
        stylechange("search-res-container", "float");
        if(data.status == 404){
            stylechange("search-result", "x");
            stylechange("search-empty", "float");
            $("#search-empty").innerHTML = data.msg;
        }
        else{
            stylechange("search-result");
            stylechange("search-empty");
            $("#search-name").innerText = data.fullname;
            $("#search-username").innerText = data.username;
            $("#search-icon").style.background="url("+data.profilepic+")";
            $("#search-icon").style.backgroundSize = "100%";
        }
    }
});

container.addEventListener("click", async (e)=> {
    $("#profile-menu") && stylechange("profile-menu");
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
                loadInbox(data);
            }
        }
    }
    else if(e.target.closest("#known-list-btn")){
        stylechange("known-list-btn", "on");
        stylechange("chats-btn");
        stylechange("inbox-content", "x");
        stylechange("inbox-known");

    }
    else if(e.target.closest("#chats-btn")){
        stylechange("known-list-btn");
        stylechange("chats-btn", "on");
        stylechange("inbox-content");
        stylechange("inbox-known", "x");
    }
});

window.addEventListener("popstate", async ()=> {
    updateUI(window.location.pathname);
});
