/* ================= APP DATA ================= */

const appData = {
    image: null,
    source: null,
    time: null
};

let selectedConcerns = [];

/* Store image data globally so api.js can access it */
window.uploadData = { image: null };

/* ================= STEP 1: IMAGE UPLOAD ================= */

document.addEventListener("DOMContentLoaded", function () {

    const cameraBtn = document.getElementById("cameraBtn");
    const galleryBtn = document.getElementById("galleryBtn");
    const fileInput = document.getElementById("fileInput");
    const continueBtn = document.getElementById("continueBtn");
    const backHome = document.getElementById("backHome");

    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const previewImage = document.getElementById("previewImage");

    let stream = null;

    console.log("App Loaded Correctly");

    /* BACK BUTTON */
    if (backHome) {
        backHome.addEventListener("click", function () {
            window.location.href = "index.html";
        });
    }

    /* CAMERA BUTTON */
    if (cameraBtn) {
        cameraBtn.addEventListener("click", async function () {
            try {
                if (!stream) {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    video.srcObject = stream;
                    video.style.display = "block";
                    previewImage.style.display = "none";
                    cameraBtn.innerHTML = '<i class="fa-solid fa-camera"></i> Capture Photo';
                } else {
                    capturePhoto();
                }
            } catch (error) {
                alert("Please allow camera permission.");
                console.error(error);
            }
        });
    }

    function capturePhoto() {
        if (!stream) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);

        const imageData = canvas.toDataURL("image/png");

        stream.getTracks().forEach(track => track.stop());
        stream = null;

        video.style.display = "none";

        previewImage.src = imageData;
        previewImage.style.display = "block";

        cameraBtn.innerHTML = '<i class="fa-solid fa-camera"></i> Take Photo';

        activateAfterImage(imageData, "camera");
    }

    /* GALLERY */
    if (galleryBtn) {
        galleryBtn.addEventListener("click", function () {
            fileInput.click();
        });
    }

    if (fileInput) {
        fileInput.addEventListener("change", function () {
            if (!this.files[0]) return;

            const reader = new FileReader();

            reader.onload = function (e) {
                previewImage.src = e.target.result;
                previewImage.style.display = "block";
                video.style.display = "none";

                activateAfterImage(e.target.result, "gallery");
            };

            reader.readAsDataURL(this.files[0]);
        });
    }

    /* AFTER IMAGE CAPTURED/UPLOADED */
    function activateAfterImage(imageData, source) {
        appData.image = imageData;
        appData.source = source;
        appData.time = new Date().toISOString();

        // Store globally for api.js to access
        window.uploadData = { image: imageData };

        if (continueBtn) {
            continueBtn.classList.remove("hidden");
        }

        // Change 'Tips for Best Results' empty circles into green checkmarks
        document.querySelectorAll('.tips-card ul li i').forEach(icon => {
            icon.className = 'fa-solid fa-circle-check';
            icon.style.color = '#10b981'; // Green color
            icon.style.transition = 'transform 0.3s ease';
            icon.style.transform = 'scale(1.2)';
            setTimeout(() => { icon.style.transform = 'scale(1)'; }, 300);
        });

        console.log("===== IMAGE STORED =====");
        console.log("Image length:", imageData.length);
    }
});


/* ================= STEP 2: SKIN CONCERNS ================= */

var concernButtons = document.querySelectorAll(".concern");
const description = document.getElementById("description");
const startAnalysis = document.getElementById("startAnalysis");

concernButtons.forEach(button => {
    button.addEventListener("click", function () {
        const value = this.getAttribute("data-value");
        this.classList.toggle("selected");
        this.classList.toggle("active");

        if (selectedConcerns.includes(value)) {
            selectedConcerns = selectedConcerns.filter(item => item !== value);
        } else {
            selectedConcerns.push(value);
        }

        console.log("Selected Concerns:", selectedConcerns);
    });
});


/* ================= STEP 3: ANALYSIS FLOW ================= */

if (startAnalysis) {
    startAnalysis.addEventListener("click", async function () {

        // Get image
        const imageBase64 = window.uploadData?.image || appData.image;

        if (!imageBase64) {
            alert("No image found. Please upload a photo first.");
            return;
        }

        console.log("Starting analysis with image length:", imageBase64.length);
        console.log("Concerns:", selectedConcerns);

        // Show loading screen
        const uploadScreen = document.getElementById("uploadScreen");
        const concernScreen = document.getElementById("concernScreen");
        const loadingScreen = document.getElementById("loadingScreen");

        if (uploadScreen) uploadScreen.classList.remove("active");
        if (concernScreen) concernScreen.classList.remove("active");
        if (loadingScreen) loadingScreen.classList.add("active");

        // Start loading animation
        startLoadingAnimation();

        try {
            // Build features for XGBoost
            const desc = document.getElementById("description")?.value || "";
            const features = buildFeaturesFromConcerns(selectedConcerns, desc);

            // Call BOTH models in parallel
            const [imageResult, skinResult] = await Promise.all([
                callAnalyzeImage(imageBase64, selectedConcerns),
                callAnalyzeSkin(features)
            ]);

            console.log("Image Result:", imageResult);
            console.log("Skin Result:", skinResult);

            // Store results globally
            window.skinAnalysisResult = {
                ...imageResult,
                ...skinResult,
                concerns: selectedConcerns
            };
            window.lastImageResult = imageResult;
            window.lastSkinResult = skinResult;
            try {
                localStorage.setItem("lastImageResult", JSON.stringify(imageResult));
                localStorage.setItem("lastSkinResult", JSON.stringify(skinResult));
            } catch(e) { console.warn(e); }

            // Wait for loading animation to finish, then show results
            setTimeout(() => {
                showResults(imageResult, skinResult);
            }, 2500);

        } catch (err) {
            console.error("Analysis failed:", err);
            alert(`Analysis failed: ${err.message}\n\nPlease try again in a moment.`);
            // Go back
            if (loadingScreen) loadingScreen.classList.remove("active");
            if (concernScreen) concernScreen.classList.add("active");
        }
    });
}


/* ================= API CALL FUNCTIONS ================= */

async function callAnalyzeImage(imageBase64, concerns) {
    console.log("Calling /api/analyze-image ...");

    const res = await fetch("https://lumiskin-ai-backend.onrender.com/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            image: imageBase64,
            concerns: concerns
        })
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Server error:", errorText);
        throw new Error(`Server error: ${res.status}`);
    }

    return res.json();
}

async function callAnalyzeSkin(features) {
    console.log("Calling /api/analyze-skin ...");

    const res = await fetch("https://lumiskin-ai-backend.onrender.com/api/analyze-skin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(features)
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Server error:", errorText);
        throw new Error(`Server error: ${res.status}`);
    }

    return res.json();
}


/* ================= BUILD FEATURES ================= */

function buildFeaturesFromConcerns(concerns, description) {
    // XGBoost model expects exactly these 6 features:
    return {
        sleep_hours: 7.0,
        sunscreen_usage: concerns.includes("Pigmentation") ? 0.2 : 0.5,
        smoking: 0.0,
        alcohol_consumption: 2.0,
        physical_activity_level: 3.0,
        screen_time_hours: 6.0
    };
}


/* ================= SHOW RESULTS ON UI ================= */

function showResults(imageResult, skinResult) {
    // Hide loading screen
    const loadingScreen = document.getElementById("loadingScreen");
    if (loadingScreen) loadingScreen.classList.remove("active");

    // Show severity card with full results
    const severityCard = document.getElementById("severityCard");
    if (severityCard) {
        severityCard.style.display = "block";
        severityCard.className = "dashboard-card active slide-up";

        const predicted = imageResult.predicted_class || "Analysis Complete";
        const confidence = imageResult.confidence ? imageResult.confidence.toFixed(1) : 0;
        const severity = skinResult.severity_label || "N/A";
        const allProbs = imageResult.all_probabilities || {};
        const routine = imageResult.routine || {};
        const tips = skinResult.lifestyle_tips || [];

        // Top Header
        const severityLabel = document.getElementById("severityLabel");
        if (severityLabel) {
            severityLabel.innerHTML = `
                <div class="dashboard-header">
                    <div class="badge-premium">AI Analysis Complete</div>
                    <h2 class="main-title">🔬 ${predicted}</h2>
                    <div class="stats-row">
                        <div class="stat-box">
                            <span class="stat-label">Confidence</span>
                            <span class="stat-value text-purple">${confidence}%</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Severity Level</span>
                            <span class="stat-value text-pink">${severity}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        const lifestyleTips = document.getElementById("lifestyleTips");
        if (lifestyleTips) {
            let html = '<div style="display: flex; gap: 25px; flex-wrap: wrap; margin-bottom: 40px; align-items: stretch;">';
            
            // Uploaded Image View (Left Column)
            html += '<div class="dashboard-col glass-card fade-in delay-1" style="flex: 0 0 300px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start;">';
            html += '<div class="card-header" style="width: 100%;"><i class="fa-solid fa-camera-retro text-purple"></i> Your Photo</div>';
            
            let imgSrc = "";
            if (window.uploadData && window.uploadData.image) {
                imgSrc = window.uploadData.image;
            } else {
                const prev = document.getElementById('previewImage');
                if (prev && prev.src && prev.src.includes('data:')) imgSrc = prev.src;
            }
            
            if (imgSrc) {
                html += `<img src="${imgSrc}" style="width: 100%; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); object-fit: cover; border: 4px solid white;" />`;
            } else {
                html += `<div style="width: 100%; height: 250px; background: rgba(0,0,0,0.05); border-radius: 12px; display:flex; align-items:center; justify-content:center; color:#999;"><i class="fa-solid fa-image fa-2x"></i></div>`;
            }
            html += '</div>';

            html += '<div class="dashboard-grid" style="flex: 1; margin-bottom: 0;">';

            // Column 1: Probabilities
            html += '<div class="dashboard-col glass-card fade-in delay-1">';
            html += '<div class="card-header"><i class="fa-solid fa-chart-pie text-purple"></i> Skin Breakdown</div>';
            if (Object.keys(allProbs).length > 0) {
                const sorted = Object.entries(allProbs).sort(([,a],[,b]) => b - a);
                html += '<div class="chart-container">';
                sorted.forEach(([cls, pct]) => {
                    const barColor = pct > 20 ? 'linear-gradient(90deg, #ec4899, #f43f5e)' : 'linear-gradient(90deg, #a855f7, #8b5cf6)';
                    html += `
                        <div class="chart-row">
                            <div class="chart-label">${cls}</div>
                            <div class="chart-bar-bg">
                                <div class="chart-bar-fill" style="width:0%; background:${barColor};" data-width="${pct}%"></div>
                            </div>
                            <div class="chart-pct">${parseFloat(pct).toFixed(1)}%</div>
                        </div>
                    `;
                });
                html += '</div>';
            }
            html += '</div>';

            // Column 2: Routine
            html += '<div class="dashboard-col glass-card fade-in delay-2">';
            html += '<div class="card-header"><i class="fa-solid fa-spray-can-sparkles text-pink"></i> Tailored Routine</div>';
            
            if (routine.morning) {
                html += '<div class="routine-section">';
                html += '<div class="routine-title text-amber"><i class="fa-solid fa-sun"></i> Morning</div>';
                routine.morning.forEach(step => {
                    html += `<div class="routine-item border-amber"><span class="bullet amber"></span><span>${step}</span></div>`;
                });
                html += '</div>';
            }

            if (routine.evening) {
                html += '<div class="routine-section">';
                html += '<div class="routine-title text-indigo"><i class="fa-solid fa-moon"></i> Evening</div>';
                routine.evening.forEach(step => {
                    html += `<div class="routine-item border-indigo"><span class="bullet indigo"></span><span>${step}</span></div>`;
                });
                html += '</div>';
            }
            
            if (routine.ingredients_to_look_for && routine.ingredients_to_look_for.length > 0) {
                html += '<div class="routine-section">';
                html += '<div class="routine-title text-emerald"><i class="fa-solid fa-check-circle"></i> Key Ingredients</div>';
                html += '<div class="tags-container">';
                routine.ingredients_to_look_for.forEach(ing => {
                    html += `<span class="tag emerald">${ing}</span>`;
                });
                html += '</div></div>';
            }
            html += '</div>';

            // Column 3: Tips & Avoid
            html += '<div class="dashboard-col glass-card fade-in delay-3">';
            html += '<div class="card-header"><i class="fa-solid fa-lightbulb text-amber"></i> Lifestyle & Caution</div>';
            
            if (tips.length > 0) {
                html += '<div class="routine-section">';
                html += '<div class="routine-title text-pink"><i class="fa-solid fa-heart"></i> Recommendations</div>';
                tips.forEach(tip => {
                    html += `<div class="routine-item border-pink"><span class="bullet pink"></span><span>${tip}</span></div>`;
                });
                html += '</div>';
            }

            if (routine.avoid && routine.avoid.length > 0) {
                html += '<div class="routine-section">';
                html += '<div class="routine-title text-red"><i class="fa-solid fa-ban"></i> Avoid These</div>';
                routine.avoid.forEach(item => {
                     html += `<div class="routine-item border-red"><span class="bullet red"></span><span>${item}</span></div>`;
                });
                html += '</div>';
            }
            html += '</div>';
            html += '</div>'; // close grid
            html += '</div>'; // close full flex wrapper
            lifestyleTips.innerHTML = html;

            // Trigger animations
            setTimeout(() => {
                document.querySelectorAll('.chart-bar-fill').forEach(bar => {
                    bar.style.width = bar.getAttribute('data-width');
                });
                document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
                const dlBtn = document.getElementById('downloadReportBtn');
                if (dlBtn) dlBtn.style.display = 'flex';
            }, 100);
        }

        const skinJson = document.getElementById("skinJson");
        if (skinJson) {
            skinJson.textContent = JSON.stringify({ imageModel: imageResult, skinModel: skinResult }, null, 2);
        }
        
        // The Model 2 simulator is on a separate page, so no need to unshide it here anymore.
    }
}


/* ================= SCREEN NAVIGATION ================= */

const uploadScreen = document.getElementById("uploadScreen");
const concernScreen = document.getElementById("concernScreen");
const backToUpload = document.getElementById("backToUpload");

/* GO TO STEP 2 */
const continueBtn = document.getElementById("continueBtn");
if (continueBtn) {
    continueBtn.addEventListener("click", function () {
        if (uploadScreen) uploadScreen.classList.remove("active");
        if (concernScreen) concernScreen.classList.add("active");
        console.log("Moved to Step 2");
    });
}

/* BACK TO STEP 1 */
if (backToUpload) {
    backToUpload.addEventListener("click", function () {
        if (concernScreen) concernScreen.classList.remove("active");
        if (uploadScreen) uploadScreen.classList.add("active");
        console.log("Back to Step 1");
    });
}


/* ================= LOADING ANIMATION ================= */

function startLoadingAnimation() {
    const progressFill = document.getElementById("progressFill");
    const progressPercent = document.getElementById("progressPercent");
    const loadingStatus = document.getElementById("loadingStatus");

    let progress = 0;

    const messages = [
        "Measuring skin texture...",
        "Detecting acne patterns...",
        "Analyzing pores & pigmentation...",
        "Running AI classification...",
        "Generating personalized routine..."
    ];

    let messageIndex = 0;

    const interval = setInterval(() => {
        progress++;

        if (progressFill) progressFill.style.width = progress + "%";
        if (progressPercent) progressPercent.innerText = progress + "%";

        if (progress % 20 === 0 && messageIndex < messages.length) {
            if (loadingStatus) loadingStatus.innerText = messages[messageIndex];
            messageIndex++;
        }

        if (progress >= 100) {
            clearInterval(interval);
            if (loadingStatus) loadingStatus.innerText = "Analysis Complete! ✨";
            console.log("AI Analysis Complete");
        }

    }, 25);
}