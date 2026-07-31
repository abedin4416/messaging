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

const signbtn = $("#sign");


async function updateUI(path){
    if(path=="/"){
        const res = await server("/api/session");
        const data = await res.json();
        if(data.loggedIn){
            alert("You are logged in. " + data.user.fullname);
        }
        else {
            signin_form();
            signbtn.textContent = "Sign up";
        }
    }
    else if(path=="/signup"){
        signup_form();
        signbtn.textContent = "Sign in";
    }
}

document.addEventListener("DOMContentLoaded", async ()=> {
    await updateUI(window.location.pathname);
});

signbtn.addEventListener("click", async ()=> {
    const path = window.location.pathname;
    const targetPath = path === "/"? "/signup":"/";
    history.pushState({path: targetPath}, "", targetPath);
    updateUI(targetPath);
});

window.addEventListener("popstate", async ()=> {
    updateUI(window.location.pathname);
});

submit.addEventListener("click", async (e)=> {
    e.preventDefault();
    const path = window.location.pathname;
    const fullname = $("#fullname");
    const username = $("#username");
    const password = $("#password");

    if(path == "/"){
        if(!username.value){
            inputstate(username, "Username cannot be empty");
        }
        else if(!password.value){
            inputstate(password, "Password cannot be empty");
        }
        else {
        }
    }
    else if(path == "/signup"){
        if(!fullname.value){
            inputstate(fullname, "Name is required");
        }
        else if(!username.value){
            inputstate(username, "Username cannot be empty");
        }
        else if(!password.value){
            inputstate(password, "Password cannot be empty");
        }
        else {
            const response = await server("/create", "POST", {fullname:fullname.value, username:username.value, password:password.value});
            if(response.status == 409){
                const data = await response.json();
                signmsg.textContent = data.error;
                signmsg.classList.add("error");
            }
            else if(response.status == 201){

            }
        }
    }
});