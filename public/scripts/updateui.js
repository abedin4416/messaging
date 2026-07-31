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

const back = $("#back");
const icon = $("#icon");
const title = $("#title");
const searchCont = $("#search-container");
const search = $("#search");
const signBtn = $("#sign-btn");
const profileBtn = $("#profile-btn");
const container = $("#container");

const welcomeText = "<h2>Welcome to Textbit</h2>";
const signinMsg = "<text id='sign-msg'></text>";
const nameInput = "<input type='text' id='Fullname' class='user-input active-input' placeholder='Fullname' required/>";
const usernameInput = "<input type='text' id='Username' class='user-input active-input' placeholder='Username' required/>";
const passwordInput = "<input type='password' id='Password' class='user-input active-input' placeholder='Password' required/>";
const submitBtn = "<button type='submit' id='submit'></button>"
const signinForm = "<form id='user-form'>"
            + welcomeText + signinMsg
            + usernameInput + passwordInput
            + submitBtn + "</form>";
const signupForm = "<form id='user-form'>"
            + welcomeText + signinMsg + nameInput
            + usernameInput + passwordInput
            + submitBtn + "</form>";

function inboxgenerate(){
    signBtn.classList.remove("sign");
    signBtn.textContent = "";
    profileBtn.classList.add("profile-btn");
    searchCont.classList.add("search-container");
    container.innerHTML = "Welcome. This is your inbox.";
}

function signup_form(){
    container.innerHTML = signupForm;
    signBtn.classList.add("sign");
    profileBtn.classList.remove("profile-btn");
    signBtn.textContent = "Sign in";
    searchCont.classList.remove("search-container");
    const signmsg = $("#sign-msg");
    const submit = $("#submit");
    signmsg && (signmsg.textContent = "Create a new account.");
    $("#user-form")?.addEventListener("focusin", (e)=> {
        if(e.target.matches('.user-input')) 
            inputstate(e.target, e.target.id, false);
    });
    submit && (submit.textContent = "Sign up");
    submit?.addEventListener("click", async (e)=> {
        e.preventDefault();
        const fullname = $("#Fullname");
        const username = $("#Username");
        const password = $("#Password");
        const signmsg = $("#sign-msg");
        if(!fullname?.value){
            inputstate(fullname, "Name is required");
        }
        else if(!username?.value){
            inputstate(username, "Username cannot be empty");
        }
        else if(!password?.value){
            inputstate(password, "Password cannot be empty");
        }
        else {
            const response = await server("/create", "POST", {
                fullname:fullname.value, 
                username:username.value,
                password:password.value
            });
            if(response.status == 409){
                const data = await response.json();
                signmsg && (signmsg.textContent = data.error);
                signmsg?.classList.add("error");
            }
            else if(response.status == 201){
                history.pushState({path: "/"}, "", "/");
                inboxgenerate();
            }
        }/
    });
}

function signin_form(){
    container.innerHTML = signinForm;
    signBtn.classList.add("sign");
    profileBtn.classList.remove("profile-btn");
    signBtn.textContent = "Sign up";
    searchCont.classList.remove("search-container");
    const signmsg = $("#sign-msg");
    const submit = $("#submit");
    console.log($("#user-form"));
    signmsg && (signmsg.textContent = "Sign in to your account.");
    $("#user-form")?.addEventListener("focusin", (e)=> {
        if(e.target.matches('.user-input')) 
            inputstate(e.target, e.target.id, false);
    });
    submit && (submit.textContent = "Sign in");
    submit?.addEventListener("click", async (e)=> {
        e.preventDefault();
        const username = $("#Username");
        const password = $("#Password");
        const signmsg = $("#sign-msg");
        if(!username?.value){
            inputstate(username, "Username cannot be empty");
        }
        else if(!password?.value){
            inputstate(password, "Password cannot be empty");
        }
        else {
            const response = await server("/signin", "POST", {
                username: username.value,
                password: password.value
            });
            if(response.status == 401 || response.status == 500){
                const data = await response.json();
                signmsg && (signmsg.textContent = data.error);
                signmsg?.classList.add("error");
            }
            else if(response.status == 201){
                inboxgenerate();
            }
        }
    });
}