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

const searchRes = "<div id='search-res-container'class='search-res-container'><div id='search-empty' class='search-empty'></div><div id='search-result' class='search-result'><div id='search-icon'></div><div id='search-name'></div><div id='search-username'></div><div id='add-known'></div></div></div>";
const inboxoption = "<div id='inbox-option'><div id='chats-btn' class='chats-btn-on'>Chats</div><div id='known-list-btn' class='known-list-btn'>Known people</div></div>"
const inboxcontent = "<div id='inbox-content' class='inbox-content'></div>"
const inboxknown = "<div id='inbox-known' class='inbox-known-x'>HEY YOU!</div>";
const inboxCont = "<div id='inbox-container' class='inbox-container'>"+inboxoption+inboxcontent+inboxknown+"</div>";
const nochat = "<div id='nochat' class='nochat'>Select a person<br>to start a conversation.</div>"
const chatCont = "<div id='chat-container' class='chat-container inbox-opened'>"+nochat+"</div>";
const inboxWrapper = "<div id='inbox-wrapper' class='inbox-wrapper'>"+inboxCont+chatCont+"</div>";

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

function chatTime(date) {
  const target = new Date(date);
  const now = new Date();
  const diffMs = now - target;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const isToday =
    target.getDate() === now.getDate() &&
    target.getMonth() === now.getMonth() &&
    target.getFullYear() === now.getFullYear();

  if (isToday) {
    return target.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  }
  if (diffDays >= 365) {
    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? "year" : "years"}`;
  }
  if (diffDays <= 7) {
    const days = Math.max(1, diffDays);
    return `${days} ${days === 1 ? "day" : "days"}`;
  }
  return target.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

function stylechange(el, x){
    $("#"+el).className = "";
    x = x? "-"+x:"";
    $("#"+el).classList.add(el+x);
}

function inboxgenerate(){
    optionCont.innerHTML = searchBtn+profileBtn+profileMenu;
    searchCont.classList.remove("hidden");
    searchCont.innerHTML = searchInput;
    container.innerHTML = searchRes+inboxWrapper;
}

function classname(id, cls, action){
    action = action || "contains";
    cls = cls || id;
    return $('#'+id).classList[action](cls);
}

function inboxupdate(data, username){
    let partnerprofile = data.receiverprofile;
    let partnerfullname = data.receiverfullname;
    if(data.partner == data.sender){
        partnerfullname = data.senderfullname;
        partnerprofile = data.senderprofile;
    }

    const sender = username == data.sender? ("<text style='color:black'>You: </text>"):"";
    const icon = `<div class='inbox-icon'style='background-image:url("${partnerprofile}")'></div>`;
    const fullname = `<div class='inbox-name'>${partnerfullname}</div>`;
    const lmsg = `<div class='last-msg'>${sender}${data.content}</div>`;
    const time = `<div class='inbox-last-time'>${chatTime(data.created_at)}</div>`;
    const unseen = `<div class='inbox-unseen'>${data.unseen=="0"? "":data.unseen}</div>`;
    const item = `<div id='${data.partner}' class='inbox-item'>${icon}${fullname}${lmsg}${time}${unseen}</div>`;

    if(inboxdata.includes(data.partner)){
        $(`#${data.partner}`).outerHTML = "";
        const inboxHtml = $("#inbox-content").innerHTML;
        $("#inbox-content").innerHTML = item+inboxHtml;
    }
    else {
        inboxdata.push(data.partner);
        const inboxHtml = $("#inbox-content").innerHTML;
        $("#inbox-content").innerHTML = item+inboxHtml;
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

function searchResult(){

}