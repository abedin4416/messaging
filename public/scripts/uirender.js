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

const profileTitle = "<div id='profile-title'></div>";
const profilePic = "<div id='profile-pic' class='profile-menu-item'>Profile image</div>";
const profileName = "<div id='profile-name' class='profile-menu-item'>Change Name</div>";
const deleteProf = "<div id='delete-profile' class='profile-menu-item'>Delete profile</div>";
const signoutBtn = "<div id='signout-btn' class='profile-menu-item'>Sign out</div>";
const profileMenu = "<div id='profile-menu' class='profile-menu'>"+profileTitle+profilePic+profileName+deleteProf+signoutBtn+"</div>";

const searchRes = "<div id='search-res-container'class='search-res-container'><div id='search-result'><div id='search-icon'></div><div id='search-name'></div><div id='search-username'></div><div id='add-known'></div></div></div>";
const inboxCont = "<div id='inbox-container' class='inbox-container'></div>";
const chatCont = "<div id='chat-container' class='chat-container inbox-opened'></div>";
const inboxWrapper = "<div id='inbox-wrapper'>"+inboxCont+chatCont+"</div>";

function $(a){return document.querySelector(a);}
function createEl(a){return document.createElement(a);}

const header = $("#header");
const back = $("#back");
const icon = $("#icon");
const title = $("#title");
const container = $("#container");
const optionCont = $("#option-container");
const searchCont = $("#search-container");

let inboxdata = [];

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
    searchCont.classList.remove("hidden");
    searchCont.innerHTML = searchInput;
    container.innerHTML = searchRes+inboxWrapper;
}

function inboxupdate(data){
    const icon = `<div id='inbox-icon'>${data.senderprofile}</div>`;
    const fullname = `<div id='inbox-name'>${data.senderfullname}</div>`;
    const lmsg = `<div id='last-msg'>${data.content}</div>`;
    const time = `<div id='inbox-last-time'>${data.created_at}</div>`;
    const unseen = `<div id='inbox-unseen'>${data.unseen}</div>`;
    const item = `<div id='${data.sender}' class='inbox-item'>${icon}${fullname}${lmsg}${time}${unseen}</div>`;
    const inboxHtml = $("#inbox-wrapper").innerHTML;

    if(inboxdata.includes(data.sender)){
        $("#"+data.sender) && ($("#"+data.sender).outerHTML = "");
        $("#inbox-wrapper").innerHTML = item+inboxHtml;
    }
    else {
        inboxdata.push(data.sender);
        $("#inbox-wrapper").innerHTML = item+inboxHtml;
    }
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
    searchCont.classList.add("hidden");
    optionCont.innerHTML = signinBtn;
    $("#sign-msg").textContent = "Create a new account.";
    $("#submit").textContent = "Sign up";
    inputfocus();
}

function signin_form(){
    container.innerHTML = signinForm;
    searchCont.classList.add("hidden");
    optionCont.innerHTML = signupBtn;
    $("#sign-msg").textContent = "Sign in to your account.";
    $("#submit").textContent = "Sign in";
    inputfocus();
}