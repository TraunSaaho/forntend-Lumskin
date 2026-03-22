/* ===============================
GLOBAL APP STATE
=============================== */

const appState = {
    uploadedImage: null,
    selectedConcerns: [],
    description: ""
};

console.log("App Started");


/* ===============================
SCREEN CONTROLLER
=============================== */

function showScreen(screenId){

    const screens = document.querySelectorAll(".screen");

    screens.forEach(screen=>{
        screen.classList.remove("active");
    });

    document.getElementById(screenId).classList.add("active");

}


/* ===============================
STEP 1 : IMAGE UPLOAD
=============================== */

var cameraBtn = document.getElementById("cameraBtn");
var galleryBtn = document.getElementById("galleryBtn");
var fileInput = document.getElementById("fileInput");
var previewImage = document.getElementById("previewImage");
var continueBtn = document.getElementById("continueBtn");

galleryBtn.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", function(){

    const file = this.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){

        previewImage.src = e.target.result;
        previewImage.style.display = "block";

        appState.uploadedImage = file.name;

        console.log("Uploaded Image:",file.name);

        continueBtn.classList.remove("hidden");

    };

    reader.readAsDataURL(file);

});


/* GO TO STEP 2 */

continueBtn.addEventListener("click",function(){

    if(!appState.uploadedImage){
        alert("Please upload image first");
        return;
    }

    showScreen("concernScreen");

    console.log("Moved to Step 2");

});


/* ===============================
STEP 2 : CONCERN SELECTION
=============================== */

var concernButtons = document.querySelectorAll(".concern");
var descriptionInput = document.getElementById("description");
var startAnalysisBtn = document.getElementById("startAnalysis");

concernButtons.forEach(button=>{

    button.addEventListener("click",function(){

        const value = this.getAttribute("data-value");

        this.classList.toggle("active");

        if(appState.selectedConcerns.includes(value)){

            appState.selectedConcerns =
            appState.selectedConcerns.filter(item=>item!==value);

        }else{

            appState.selectedConcerns.push(value);

        }

        console.log("Selected Concerns:",appState.selectedConcerns);

    });

});


descriptionInput.addEventListener("input",function(){

    appState.description = descriptionInput.value;

});


/* GO TO STEP 3 */

startAnalysisBtn.addEventListener("click",function(){

    console.log("Starting AI Analysis");

    console.log("User Data:",appState);

    showScreen("loadingScreen");

    startLoadingAnimation();

});


/* ===============================
STEP 3 : AI LOADING
=============================== */

function startLoadingAnimation(){

    const progressBar = document.getElementById("progress");
    const loadingText = document.getElementById("loadingText");

    let progress = 0;

    const steps = [
        "Analyzing pigmentation...",
        "Measuring wrinkle depth...",
        "Scanning pores...",
        "Evaluating skin texture...",
        "Finalizing AI report..."
    ];

    let stepIndex = 0;

    const interval = setInterval(function(){

        progress += 2;

        progressBar.style.width = progress + "%";

        if(progress % 20 === 0 && stepIndex < steps.length){

            loadingText.innerText = steps[stepIndex];

            stepIndex++;

        }

        if(progress >= 100){

            clearInterval(interval);

            console.log("AI Analysis Complete");

            setTimeout(function(){

                showScreen("unlockScreen");

            },800);

        }

    },80);

} 


showScreen("unlockScreen");


if(progress >= 100){

    clearInterval(interval);

    console.log("AI Analysis Complete");

    setTimeout(function(){

        showScreen("unlockScreen");   // 👈 THIS OPENS SLIDE 4

    },800);

}

function showScreen(screenId){

    const screens = document.querySelectorAll(".screen");

    screens.forEach(screen=>{
        screen.classList.remove("active");
    });

    document.getElementById(screenId).classList.add("active");

}


const viewReportBtn = document.getElementById("viewReport");

if(viewReportBtn){
viewReportBtn.addEventListener("click",function(){

console.log("User clicked full report");

});
}