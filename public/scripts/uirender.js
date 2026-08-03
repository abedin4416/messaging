const welcomeText = "<h2>Welcome to Textbit</h2>";
const signinMsg = "<text id='sign-msg'></text>";
const nameInput = "<input type='text' id='Fullname' class='user-input active-input' placeholder='Fullname'/>";
const usernameInput = "<input type='text' id='Username' class='user-input active-input' placeholder='Username'/>";
const passwordInput = "<input type='password' id='Password' class='user-input active-input' placeholder='Password'/>";
const submitBtn = "<button type='submit' id='submit'></button>";
const signinForm = "<form id='user-form'>"+welcomeText+signinMsg+usernameInput+passwordInput+submitBtn+"</form>";
const signupForm = "<form id='user-form'>"+ welcomeText+signinMsg+nameInput+usernameInput+passwordInput+submitBtn+"</form>";

const searchClose = "<div id='search-close'></div>";
const searchInput = "<input id='search-box' class='search-box' placeholder='Search for people'></input>"+searchClose;
const searchBtn = "<div id='search-btn'>Search</div>";
const profileBtn = "<div id='profile-btn'></div>";
const signinBtn = "<div id='sign-btn'>Sign in</div>";
const signupBtn = "<div id='sign-btn'>Sign up</div>";

const profilePic = "<div id='profile-pic' class='profile-menu-item'>Profile image</div>";
const profileName = "<div id='profile-name' class='profile-menu-item'>Change Name</div>";
const deleteProf = "<div id='delete-profile' class='profile-menu-item'>Delete profile</div>";
const signoutBtn = "<div id='signout-btn' class='profile-menu-item'>Sign out</div>";
const profileMenu = "<div id='profile-menu' class='profile-menu'>"+profilePic+profileName+deleteProf+signoutBtn+"</div>";


function $(a){return document.querySelector(a);}
function createEl(a){return document.createElement(a);}

const header = $("#header");
const back = $("#back");
const icon = $("#icon");
const title = $("#title");
const container = $("#container");
const optionCont = $("#option-container");
const searchCont = $("#search-container");

function inputstate(e, ph, err = true){
    e.classList.toggle("emptyinput", err);
    e.classList.toggle("active-input", !err);
    e.placeholder = `${ph}${err? " is required" : ""}`;
}

function stylechange(e, x){
    x = x==undefined? e.classList.contains(e.id):x;
    e.classList.toggle(e.id, !x);
    e.classList.toggle(e.id+"-float", x);
}

function inboxgenerate(){
    optionCont.innerHTML = searchBtn+profileBtn+profileMenu;
    searchCont.innerHTML = searchInput;
    container.innerHTML = "";
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
    $("#sign-msg").textContent = "Create a new account.";
    $("#submit").textContent = "Sign up";
    inputfocus();
}

function signin_form(){
    container.innerHTML = signinForm;
    optionCont.innerHTML = signupBtn;
    $("#sign-msg").textContent = "Sign in to your account.";
    $("#submit").textContent = "Sign in";
    inputfocus();
}