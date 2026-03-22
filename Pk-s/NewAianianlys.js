const API="http://localhost:10000";

async function checkHealth(){

const dot=document.getElementById("statusDot");
const text=document.getElementById("statusText");

try{

await fetch(`${API}/api/health`);

dot.className="status-dot online";
text.innerText="Backend Online";

}catch{

dot.className="status-dot offline";
text.innerText="Backend Offline";

}

}

checkHealth();

const imgInput=document.getElementById("imageInput");
const previewImg=document.getElementById("previewImg");

imgInput.addEventListener("change",()=>{

const file=imgInput.files[0];

const reader=new FileReader();

reader.onload=e=>{

previewImg.src=e.target.result;
previewImg.style.display="block";

};

reader.readAsDataURL(file);

});

document.querySelectorAll(".pill").forEach(p=>{

p.onclick=()=>p.classList.toggle("active");

});

function getSelectedConcerns(){

return [...document.querySelectorAll(".pill.active")].map(p=>p.dataset.v);

}

async function runImageModel(){

const imgSrc=previewImg.src;

if(!imgSrc) return alert("Upload image first");

const res=await fetch(`${API}/api/analyze-image`,{

method:"POST",
headers:{"Content-Type":"application/json"},

body:JSON.stringify({

image:imgSrc,
concerns:getSelectedConcerns()

})

});

const data=await res.json();

renderImageResult(data);

}

function renderImageResult(d){

const panel=document.getElementById("imageResult");

panel.classList.add("visible");

document.getElementById("detectedClass").innerText=d.predicted_class;

document.getElementById("imageJson").innerText=
JSON.stringify(d,null,2);

document.getElementById("showSeverityBtn").style.display="block";

}

function showSeverityForm(){

const card=document.getElementById("severityCard");

card.style.display="block";

card.scrollIntoView({

behavior:"smooth"

});

}

async function runSkinModel(){

const features={

age:+document.getElementById("f_age").value,
gender:+document.getElementById("f_gender").value,
skin_type:+document.getElementById("f_skin_type").value,
climate_type:+document.getElementById("f_climate").value

};

const res=await fetch(`${API}/api/analyze-skin`,{

method:"POST",
headers:{"Content-Type":"application/json"},

body:JSON.stringify(features)

});

const data=await res.json();

renderSkinResult(data);

}

function renderSkinResult(d){

const panel=document.getElementById("skinResult");

panel.classList.add("visible");

document.getElementById("severityLabel").innerText=d.severity_label;

document.getElementById("skinJson").innerText=
JSON.stringify(d,null,2);

document.getElementById("lifestyleTips").innerHTML=
(d.lifestyle_tips||[]).map(t=>`<div class="tip">${t}</div>`).join("");

}