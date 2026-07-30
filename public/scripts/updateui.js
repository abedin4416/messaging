function $(a){return document.querySelector(a);}
function createEl(a){return document.createElement(a);}

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

const inputcontainer = $("#input-container");
const signmsg = $("#sign-msg");
const submit = $("#submit");

function formgen(a){
    const username = createEl("input");
    Object.assign(username, {
        id: "username",
        className: "user-input active-input",
        type: "text",
        placeholder: "Username"
    })
    const password = createEl("input");
    Object.assign(password, {
        id: "password", 
        className: "user-input active-input",
        type: "text",
        placeholder: "Password"
    });

    username.addEventListener("focus", ()=> {
        inputstate(username, "Username", false);
    });

    password.addEventListener("focus", ()=> {
        inputstate(password, "Password", false);
    });

    inputcontainer.appendChild(username);
    inputcontainer.appendChild(password);
    signmsg.classList.remove("error");
}

function signup_form(){
    inputcontainer.replaceChildren();
    signmsg.textContent = "Create a new account.";
    submit.textContent = "Sign up";
    const fullname = createEl("input");
    Object.assign(fullname, {
        id: "fullname",
        className: "user-input active-input",
        type: "text",
        placeholder: "Fullname"
    });
    fullname.addEventListener("focus", ()=> {
        inputstate(fullname, "Fullname", false);
    })
    inputcontainer.appendChild(fullname);
    formgen("Sign up");
}

function signin_form(){
    inputcontainer.replaceChildren();
    signmsg.textContent = "Sign in to your account.";
    submit.textContent = "Sign in";
    formgen("Sign in");
}