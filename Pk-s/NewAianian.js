/* ================= HEALTH CHECK ================= */

const API = "http://localhost:10000";

async function checkHealth() {
    const dot = document.getElementById("statusDot");
    const text = document.getElementById("statusText");

    try {
        const res = await fetch(`${API}/api/health`);
        const data = await res.json();

        dot.className = "status-dot online";
        text.innerText = "Backend Online";
        console.log("✅ Backend health:", data);

    } catch {
        dot.className = "status-dot offline";
        text.innerText = "Backend Offline";
        console.warn("❌ Backend not reachable at", API);
    }
}


checkHealth();

function renderImageModelResult(data){

    console.log("Image Model Result:", data);

    const panel = document.getElementById("skinResult");
    if(panel) panel.classList.add("visible");

    const label = document.getElementById("severityLabel");

    if(label){
        label.innerHTML = `
            <div style="font-size:22px;font-weight:700;color:#7b8cff;">
                ${data.predicted_class}
            </div>

            <div style="margin-top:5px;font-size:14px;color:#666;">
                Confidence: ${data.confidence}%
            </div>
        `;
    }

    const tips = document.getElementById("lifestyleTips");

    let html = "";

    /* Probability Chart */

    if(data.all_probabilities){

        html += `<h4 style="margin-top:10px">Skin Analysis</h4>`;

        Object.entries(data.all_probabilities).forEach(([key,val]) => {

            html += `
            <div style="display:flex;align-items:center;margin:6px 0;">
                <div style="width:120px;font-size:13px">${key}</div>

                <div style="flex:1;height:8px;background:#eee;border-radius:10px;overflow:hidden">
                    <div style="width:${val}%;height:8px;background:#7b8cff"></div>
                </div>

                <div style="width:40px;text-align:right;font-size:12px">${val}%</div>
            </div>
            `;
        });
    }

    /* Routine */

    if(data.routine){

        html += `<h4 style="margin-top:20px">Recommended Routine</h4>`;

        if(data.routine.morning){

            html += `<b>Morning</b>`;

            data.routine.morning.forEach(step=>{
                html += `<div>• ${step}</div>`;
            });

        }

        if(data.routine.evening){

            html += `<br><b>Evening</b>`;

            data.routine.evening.forEach(step=>{
                html += `<div>• ${step}</div>`;
            });

        }
    }

    tips.innerHTML = html;
}

/* ================= SEVERITY MODEL (Manual Run) ================= */

async function runSkinModel() {

    

    const age = +document.getElementById("f_age").value;
    const gender = +document.getElementById("f_gender").value;
    const skinType = +document.getElementById("f_skin_type").value;
    

    // Lifestyle values (dynamic)
    const sleepHours = +document.getElementById("f_sleep").value;
    const sunscreen = +document.getElementById("f_sunscreen").value;
    const smoking = +document.getElementById("f_smoking").value;
    const alcohol = +document.getElementById("f_alcohol").value;
    const activity = +document.getElementById("f_activity").value;
    const screenTime = +document.getElementById("f_screen").value;

    const features = {
        sleep_hours: sleepHours,
        sunscreen_usage: sunscreen,
        smoking: smoking,
        alcohol_consumption: alcohol,
        physical_activity_level: activity,
        screen_time_hours: screenTime
    };

    console.log("Sending Features:", features);

    try {

        const res = await fetch(`${API}/api/analyze-skin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(features)
        });

        const data = await res.json();
        if (typeof showResults === 'function' && window.lastImageResult) {
            showResults(window.lastImageResult, data);
        } else {
            renderSkinResult(data);
        }

    } catch (err) {

        console.error("Skin model error:", err);
        alert("Failed to run severity model. Is the backend running?");
    }
   
    
}

function renderSkinResult(d) {
    const panel = document.getElementById("skinResult");
    if (panel) panel.classList.add("visible");

    const label = document.getElementById("severityLabel");
    if (label) label.innerText = d.severity_label || "—";

    const json = document.getElementById("skinJson");
    if (json) json.style.display = "none"; // hide raw JSON from UI
    console.log("Skin Model Result:", d);

    const tips = document.getElementById("lifestyleTips");
    if (tips) {
        tips.innerHTML = (d.lifestyle_tips || [])
            .map(t => `<div style="padding:6px 12px;margin:4px 0;background:rgba(236,72,153,0.05);border-left:3px solid #ec4899;border-radius:4px;font-size:13px;">• ${t}</div>`)
            .join("");
    }
}