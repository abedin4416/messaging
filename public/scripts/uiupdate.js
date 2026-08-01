function $(a){return document.querySelector(a);}
function createEl(a){return document.createElement(a);}

function inputstate(element, placeholder, isError = true){
    if(isError) {
        element.classList.add("emptyinput")
        element.classList.remove("active-input");
        element.placeholder = placeholder+" is required";
    }
    else {
        element.classList.remove("emptyinput");
        element.classList.add("active-input");
        element.placeholder = placeholder;
    }
}

const welcomeText = "<h2>Welcome to Textbit</h2>";
const signinMsg = "<text id='sign-msg'></text>";
const nameInput = "<input type='text' id='Fullname' class='user-input active-input' placeholder='Fullname'/>";
const usernameInput = "<input type='text' id='Username' class='user-input active-input' placeholder='Username'/>";
const passwordInput = "<input type='password' id='Password' class='user-input active-input' placeholder='Password'/>";
const submitBtn = "<button type='submit' id='submit'></button>";
const signinForm = "<form id='user-form'>"+welcomeText+signinMsg+usernameInput+passwordInput+submitBtn+"</form>";
const signupForm = "<form id='user-form'>"+ welcomeText+signinMsg+nameInput+usernameInput+passwordInput+submitBtn+"</form>";

const searchBox = "<input id='search-box' placeholder='Search for people'></input>";
const searchBtn = "<div id='search-btn'></div>";
const profileBtn = "<div id='profile-btn'></div>";
const signinBtn = "<div id='sign-btn'>Sign in</div>";
const signupBtn = "<div id='sign-btn'>Sign up</div>";

const back = $("#back");
const icon = $("#icon");
const title = $("#title");
const container = $("#container");
const optionCont = $("#option-container")

function inboxgenerate(){
    optionCont.innerHTML = searchBox+searchBtn+profileBtn;
    container.innerHTML = "Welcome. This is your inbox.";
}

function inputfocus(){
    $("#user-form")?.addEventListener("focusin", (e)=> {
        if(e.target.matches(".user-input")){
            inputstate(e.target, e.target.id, false);
        }
    });
}

function signup_form(){
    container.innerHTML = signupForm;
    optionCont.innerHTML = signinBtn;
    const signmsg = $("#sign-msg");
    const submit = $("#submit");
    signmsg && (signmsg.textContent = "Create a new account.");
    inputfocus();
    submit && (submit.textContent = "Sign up");
}

function signin_form(){
    container.innerHTML = signinForm;
    optionCont.innerHTML = signupBtn;
    const signmsg = $("#sign-msg");
    const submit = $("#submit");
    signmsg && (signmsg.textContent = "Sign in to your account.");
    inputfocus();
    submit && (submit.textContent = "Sign in");
}