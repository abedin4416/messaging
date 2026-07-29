async function receive(api, method = "GET", data = null) {
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

        if (!res.ok) {
            throw new Error(`HTTP Error! Status: ${res.status}`);
        }
        return await res.json();
    } catch (error) {
        console.error("Fetch request failed:", error);
        throw error;
    }
}

function $(a){return document.querySelector(a);}

const signmsg = $("#sign-msg");
const nameinput = $("#name");
const signbtn = $("#sign");
const submit = $("#submit");
const username = $("#username")
const password = $("#password");

async function updateUI(path){
    const data = await receive(path, "POST");
    if(path=="/"){
        signmsg.textContent = data.signtext;
        nameinput.classList.add("hidden");
        nameinput.disabled = true;
        signbtn.textContent = "Sign up";
    }
    else if(path=="/signup"){
        signmsg.textContent = data.signtext;
        nameinput.classList.remove("hidden");
        nameinput.disabled = false;
        signbtn.textContent = "Sign in";
    }
}

document.addEventListener("DOMContentLoaded", async ()=> {
    updateUI(window.location.pathname);
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

function inputstate(element, placeholder, isError = true){
    if(isError) {
        element.classList.add("emptyinput")
        element.classList.remove("active-input");
    }
    else {
        element.classList.remove("emptyinput");
        element.classList.add("active-input");
    }
    element.placeholder = placeholder;
}

submit.addEventListener("click", async (e)=> {
    e.preventDefault();
    const path = window.location.pathname;
    if(path == "/"){
        if(!username.value){
            inputstate(username, "Username cannot be empty");
        }
        else if(!password.value){
            inputstate(password, "Password cannot be empty");
        }
    }
})

username.addEventListener("focus", ()=> {
    inputstate(username, "Username", false);
});

password.addEventListener("focus", ()=> {
    inputstate(password, "Password", false);
})