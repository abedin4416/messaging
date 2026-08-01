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