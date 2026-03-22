let lamp = document.getElementById("lamp");
let authBox = document.getElementById("authBox");

let loginBox = document.getElementById("loginBox");
let signupBox = document.getElementById("signupBox");

let showSignup = document.getElementById("showSignup");
let showLogin = document.getElementById("showLogin");

let lightOn = false;


/* Lamp Toggle */

lamp.onclick = function(){

lightOn = !lightOn;

if(lightOn){

lamp.src = "lamp-on.png";

authBox.classList.add("active");

}else{

lamp.src = "lamp-off.png";

authBox.classList.remove("active");

}

}


/* Switch to Signup */

showSignup.onclick = function(){

loginBox.style.display = "none";
signupBox.style.display = "flex";

}


/* Switch to Login */

showLogin.onclick = function(){

signupBox.style.display = "none";
loginBox.style.display = "flex";

}