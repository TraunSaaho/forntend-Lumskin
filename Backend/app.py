"""
AI Skin Analysis Backend
- POST /api/analyze-image  → Keras MobileNetV2 model
- POST /api/analyze-skin   → XGBoost model
- GET  /api/health         → Health check
"""

from flask import Flask, request, jsonify  # type: ignore
import os, base64, io, random, traceback, copy
import math

app = Flask(__name__)

# allow larger image uploads (16MB)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024

# ---------------- CORS ----------------

@app.after_request
def add_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return response

# ---------------- HEALTH ----------------

@app.route("/", methods=["GET"])
def home():
    return "LumiSkin AI Backend Running ✅"

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "models": ["keras_mobilenetv2", "xgboost_skin"]
    })

# ---------------- LABELS ----------------

KERAS_CLASSES = [
    "Normal Skin",
    "Acne",
    "Pigmentation",
    "Wrinkles",
    "Dark Circles",
    "Redness",
    "Dryness",
    "Oiliness"
]

XGB_SEVERITY_LABELS = {
    0: "Mild",
    1: "Moderate",
    2: "Severe"
}

# ---------------- SKINCARE ROUTINES ----------------
# Pre-built routines based on detected skin condition

ROUTINES = {
    "Acne": {
        "morning": [
            "Gentle foaming cleanser with salicylic acid",
            "Niacinamide 10% serum",
            "Oil-free moisturizer (gel-based)",
            "SPF 50 sunscreen (non-comedogenic)"
        ],
        "evening": [
            "Double cleanse (oil cleanser + water-based cleanser)",
            "BHA 2% exfoliant (every other night)",
            "Benzoyl peroxide spot treatment",
            "Lightweight night moisturizer"
        ],
        "ingredients_to_look_for": [
            "Salicylic Acid (BHA)", "Niacinamide", "Tea Tree Oil",
            "Zinc", "Benzoyl Peroxide", "Retinol"
        ],
        "avoid": [
            "Heavy oils (coconut oil)", "Alcohol-based toners",
            "Fragranced products", "Over-exfoliation"
        ]
    },
    "Pigmentation": {
        "morning": [
            "Vitamin C serum (15-20%)",
            "Hydrating moisturizer",
            "SPF 50+ broad-spectrum sunscreen (reapply every 2hrs)"
        ],
        "evening": [
            "Gentle cleanser",
            "Alpha Arbutin serum",
            "Retinoid cream (start low, 0.025%)",
            "Nourishing night cream"
        ],
        "ingredients_to_look_for": [
            "Vitamin C", "Alpha Arbutin", "Kojic Acid",
            "Niacinamide", "Azelaic Acid", "Licorice Root Extract"
        ],
        "avoid": [
            "Sun exposure without SPF", "Harsh scrubs",
            "Lemon juice on skin", "Picking at dark spots"
        ]
    },
    "Wrinkles": {
        "morning": [
            "Hyaluronic acid serum",
            "Peptide-rich moisturizer",
            "SPF 50 sunscreen"
        ],
        "evening": [
            "Gentle cleanser",
            "Retinol serum (0.5% - 1%)",
            "Collagen-boosting night cream",
            "Eye cream with peptides"
        ],
        "ingredients_to_look_for": [
            "Retinol/Retinoids", "Hyaluronic Acid", "Peptides",
            "Vitamin C", "Coenzyme Q10", "Bakuchiol"
        ],
        "avoid": [
            "Excessive sun exposure", "Smoking",
            "Sleeping on face", "Skipping moisturizer"
        ]
    },
    "Normal Skin": {
        "morning": [
            "Gentle hydrating cleanser",
            "Vitamin C serum",
            "Lightweight moisturizer",
            "SPF 30+ sunscreen"
        ],
        "evening": [
            "Micellar water or gentle cleanser",
            "Hydrating toner",
            "Moisturizer with ceramides"
        ],
        "ingredients_to_look_for": [
            "Ceramides", "Hyaluronic Acid", "Vitamin E",
            "Green Tea Extract", "Niacinamide"
        ],
        "avoid": [
            "Over-exfoliation", "Too many active ingredients at once",
            "Harsh sulfate cleansers"
        ]
    },
    "Dark Circles": {
        "morning": [
            "Caffeine eye cream",
            "Vitamin C serum around eyes",
            "Hydrating moisturizer",
            "SPF sunscreen (including around eyes)"
        ],
        "evening": [
            "Gentle cleanser",
            "Retinol eye cream (low strength)",
            "Peptide serum",
            "Rich moisturizer"
        ],
        "ingredients_to_look_for": [
            "Caffeine", "Vitamin K", "Retinol",
            "Peptides", "Hyaluronic Acid", "Arnica"
        ],
        "avoid": [
            "Rubbing eyes", "Late-night screen time",
            "Dehydration", "Lack of sleep"
        ]
    },
    "Redness": {
        "morning": [
            "Soothing cleanser (fragrance-free)",
            "Centella Asiatica serum",
            "Barrier repair moisturizer",
            "Mineral SPF sunscreen"
        ],
        "evening": [
            "Gentle micellar water",
            "Azelaic acid serum (15%)",
            "Calming night cream with ceramides"
        ],
        "ingredients_to_look_for": [
            "Centella Asiatica", "Azelaic Acid", "Aloe Vera",
            "Chamomile", "Ceramides", "Oat Extract"
        ],
        "avoid": [
            "Hot water on face", "Spicy food triggers",
            "Alcohol-based products", "Harsh exfoliants"
        ]
    },
    "Dryness": {
        "morning": [
            "Cream-based hydrating cleanser",
            "Hyaluronic acid serum (on damp skin)",
            "Rich moisturizer with ceramides",
            "SPF 30+ moisturizing sunscreen"
        ],
        "evening": [
            "Oil-based cleanser",
            "Hydrating toner (multi-layer)",
            "Facial oil (jojoba, rosehip)",
            "Overnight sleeping mask (2x/week)"
        ],
        "ingredients_to_look_for": [
            "Hyaluronic Acid", "Ceramides", "Squalane",
            "Glycerin", "Shea Butter", "Jojoba Oil"
        ],
        "avoid": [
            "Hot showers on face", "Alcohol-based toners",
            "Foaming cleansers", "Over-exfoliation"
        ]
    },
    "Oiliness": {
        "morning": [
            "Gel-based or foaming cleanser",
            "Niacinamide 10% serum",
            "Oil-free gel moisturizer",
            "Mattifying SPF sunscreen"
        ],
        "evening": [
            "Double cleanse (oil + water cleanser)",
            "BHA 2% exfoliant (3x/week)",
            "Lightweight hydrating serum",
            "Oil-free night moisturizer"
        ],
        "ingredients_to_look_for": [
            "Niacinamide", "Salicylic Acid", "Clay (Kaolin)",
            "Zinc", "Witch Hazel", "Green Tea"
        ],
        "avoid": [
            "Heavy creams", "Coconut oil",
            "Over-washing face", "Skipping moisturizer"
        ]
    }
}

# Lifestyle tips based on severity
LIFESTYLE_TIPS = {
    "Mild": [
        "Maintain a consistent skincare routine",
        "Drink at least 2L of water daily",
        "Get 7-8 hours of sleep each night",
        "Apply sunscreen daily, even indoors"
    ],
    "Moderate": [
        "Review your diet — avoid excess sugar and dairy",
        "Consider switching to fragrance-free products",
        "Clean pillowcases 2x per week",
        "Avoid touching your face throughout the day",
        "Include antioxidant-rich foods in your diet"
    ],
    "Moderate-Severe": [
        "Consult a dermatologist for a personalized plan",
        "Introduce actives one at a time (wait 2 weeks each)",
        "Track skin changes with weekly photos",
        "Manage stress — try meditation or yoga",
        "Avoid picking or squeezing any blemishes"
    ],
    "Severe": [
        "See a dermatologist as soon as possible",
        "Consider prescription-strength treatments",
        "Simplify your routine to gentle basics only",
        "Apply cold compress for inflammation relief",
        "Avoid all harsh exfoliants and actives until symptoms calm"
    ],
    "Very Severe": [
        "Urgent dermatologist visit recommended",
        "Stop all active ingredients immediately",
        "Use only a gentle cleanser + moisturizer + SPF",
        "Consider oral medication options with your doctor",
        "Prioritize skin barrier repair"
    ],
    "Critical": [
        "Seek professional dermatological care immediately",
        "Avoid all cosmetic products except prescribed ones",
        "Focus on barrier repair and hydration only",
        "Document symptoms for your dermatologist"
    ],
    "Extreme": [
        "Emergency dermatological consultation needed",
        "Stop all non-prescribed skincare immediately",
        "Keep skin clean with gentle water rinse only",
        "Follow only doctor-prescribed treatment"
    ]
}

# Concern-specific tips
CONCERN_TIPS = {
    "Acne": [
        "Change pillowcases every 2-3 days",
        "Keep phones and hands away from face",
        "Avoid dairy and high-glycemic foods",
        "Don't pop or pick at pimples"
    ],
    "Pigmentation": [
        "Wear SPF 50 religiously — reapply every 2 hours",
        "Wear a hat when outdoors",
        "Avoid picking at dark spots",
        "Be patient — pigmentation takes 3-6 months to fade"
    ],
    "Wrinkles": [
        "Sleep on your back to avoid sleep lines",
        "Stay hydrated — dehydration worsens fine lines",
        "Consider collagen supplements",
        "Avoid repetitive facial expressions when possible"
    ],
    "Dryness": [
        "Use a humidifier in your bedroom",
        "Apply moisturizer on damp skin for better absorption",
        "Avoid long hot showers",
        "Drink herbal teas for hydration"
    ],
    "Oiliness": [
        "Don't skip moisturizer — dehydrated skin produces more oil",
        "Use blotting papers instead of washing repeatedly",
        "Choose gel-based products over creams",
        "Avoid over-exfoliation"
    ]
}

# ---------------- MODEL CACHE ----------------

keras_model = None
xgb_model = None

# ---------------- LOAD KERAS MODEL ----------------

def load_keras_model():
    global keras_model
    if keras_model is not None:
        return keras_model
    try:
        import json
        import keras  # type: ignore

        base_dir = os.path.dirname(__file__)
        model_dir = os.path.join(base_dir, "keras_model")
        config_path = os.path.join(model_dir, "config.json")
        weight_path = os.path.join(model_dir, "model.weights.h5")

        # Method 1: Load model from config.json + weights (Keras 3)
        with open(config_path, "r") as f:
            config = json.load(f)

        model = keras.saving.deserialize_keras_object(config)  # type: ignore
        model.load_weights(weight_path)  # type: ignore
        keras_model = model
        print("✅ Keras model loaded from config.json + weights (Keras 3)")
        print(f"   Input: {model.input_shape}, Output: {model.output_shape}")  # type: ignore

    except Exception as e1:
        print(f"⚠ Keras config load failed: {e1}")
        # Method 2: Manual architecture rebuild
        try:
            import tensorflow as tf  # type: ignore
            from tensorflow.keras.applications import MobileNetV2  # type: ignore
            from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout  # type: ignore
            from tensorflow.keras.models import Sequential  # type: ignore

            base_dir = os.path.dirname(__file__)
            weight_path = os.path.join(base_dir, "keras_model", "model.weights.h5")

            base_model = MobileNetV2(
                input_shape=(224, 224, 3),
                include_top=False,
                weights=None
            )
            base_model.trainable = False

            model = Sequential([  # type: ignore
                base_model,
                GlobalAveragePooling2D(),
                Dense(128, activation="relu", kernel_initializer="he_normal"),
                Dropout(0.3),
                Dense(8, activation="softmax")
            ])

            model.load_weights(weight_path)  # type: ignore
            keras_model = model
            print("✅ Keras model loaded via manual rebuild")

        except Exception as e2:
            print(f"⚠ Keras manual load also failed: {e2}")
            import traceback
            traceback.print_exc()
            keras_model = "simulation"

    return keras_model

# ---------------- LOAD XGBOOST MODEL ----------------

def load_xgb_model():
    global xgb_model
    if xgb_model is not None:
        return xgb_model
    try:
        import pickle
        model_path = os.path.join(
            os.path.dirname(__file__),
            "SKINCARE",
            "skin_xgb_model.pkl"
        )
        with open(model_path, "rb") as f:
            xgb_model = pickle.load(f)  # type: ignore
        print("✅ XGBoost model loaded")
    except Exception as e:
        print("⚠ XGBoost load failed:", e)
        xgb_model = "simulation"
    return xgb_model

# ---------------- IMAGE PREPROCESS ----------------

def preprocess_image(image_b64):
    try:
        import numpy as np  # type: ignore
        from PIL import Image  # type: ignore

        # remove base64 header
        if "," in image_b64:
            image_b64 = image_b64.split(",")[1]

        img_bytes = base64.b64decode(image_b64)
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

        # resize to model input
        img = img.resize((224,224))
        arr = np.array(img).astype("float32") / 255.0
        arr = arr.reshape(1,224,224,3)
        return arr
    except Exception as e:
        print("🔥 Image preprocess error:", e)
        traceback.print_exc()
        return None

# ---------------- SIMULATION ----------------

def simulate_keras(data=None):
    # Deterministic simulation based on concerns
    import hashlib, json
    
    # Default to normal skin
    idx = 0 
    
    if data and data.get("concerns"):
        # Use first concern to determine result
        c = data.get("concerns")[0]
        if c in KERAS_CLASSES:
            idx = KERAS_CLASSES.index(c)
        else:
            # Hash it
            idx = int(hashlib.md5(c.encode()).hexdigest(), 16) % len(KERAS_CLASSES)
    
    predicted_class = KERAS_CLASSES[idx]
    
    # Deterministic confidence based on data
    seed_val = json.dumps(data, sort_keys=True) if data else "default"
    conf_hash = int(hashlib.md5(seed_val.encode()).hexdigest(), 16)
    confidence = 85.0 + (conf_hash % 1400) / 100.0 # 85% to 99%
    
    all_probs = {}
    for i, cls in enumerate(KERAS_CLASSES):
        if i == idx:
            all_probs[cls] = confidence
        else:
            # Distribute remaining
            rem = (100.0 - confidence) / (len(KERAS_CLASSES) - 1)
            print(rem)
            all_probs[cls] = round(rem,2)
            print(all_probs)

    # Get routine for the predicted class
    routine = copy.deepcopy(ROUTINES.get(predicted_class, ROUTINES["Normal Skin"]))

    return {
        "predicted_class": predicted_class,
        "confidence": confidence,
        "all_probabilities": all_probs,
        "routine": routine,
        "model_mode": "simulation"
    }


def simulate_xgb(data=None):
    import hashlib, json
    
    idx = 0
    if data:
        # Features: "sleep_hours", "sunscreen_usage", "smoking", 
        # "alcohol_consumption", "physical_activity_level", "screen_time_hours"
        s = json.dumps(data, sort_keys=True)
        idx = int(hashlib.md5(s.encode()).hexdigest(), 16) % 3
    else:
        idx = random.randint(0, 2)
        
    severity = XGB_SEVERITY_LABELS[idx]
    tips = LIFESTYLE_TIPS.get(severity, LIFESTYLE_TIPS["Mild"])

    return {
        "severity_label": severity,
        "severity_index": idx,
        "lifestyle_tips": tips,
        "model_mode": "simulation"
    }

# ---------------- IMAGE ANALYSIS (Keras) ----------------

@app.route("/api/analyze-image", methods=["POST","OPTIONS"])
def analyze_image():
    if request.method == "OPTIONS":
        return jsonify({})

    try:
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({"error": "No JSON received"}), 400

        image = data.get("image")
        if not image:
            return jsonify({"error": "No image provided"}), 400

        concerns = data.get("concerns", [])
        print(f"Image received (length: {len(image)}), concerns: {concerns}")

        model = load_keras_model()

        if model == "simulation":
            result = simulate_keras(data)
            # Add concern-specific tips
            also_consider = []
            for c in concerns:
                also_consider.extend(CONCERN_TIPS.get(c, []))
            if also_consider and isinstance(result.get("routine"), dict):
                result["routine"]["also_consider_for_concerns"] = also_consider  # type: ignore
            return jsonify(result)

        arr = preprocess_image(image)
        if arr is None:
            return jsonify({"error": "Image processing failed"}), 400

        import numpy as np  # type: ignore
        preds = model.predict(arr)[0]  # type: ignore
        idx = int(np.argmax(preds))

        predicted_class = KERAS_CLASSES[idx]
        confidence = round(float(preds[idx])*100, 2)  # type: ignore
        all_probs = {
            KERAS_CLASSES[i]: round(float(preds[i])*100, 2)  # type: ignore
            for i in range(len(KERAS_CLASSES))
        }

        # Get routine for the predicted class
        routine = copy.deepcopy(ROUTINES.get(predicted_class, ROUTINES["Normal Skin"]))

        # Add concern-specific tips
        also_consider = []
        for c in concerns:
            also_consider.extend(CONCERN_TIPS.get(c, []))
        if also_consider:
            routine["also_consider_for_concerns"] = also_consider

        return jsonify({
            "predicted_class": predicted_class,
            "confidence": confidence,
            "all_probabilities": all_probs,
            "routine": routine,
            "model_mode": "keras"
        })

    except Exception as e:
        print("🔥 ANALYZE IMAGE ERROR:")
        traceback.print_exc()
        return jsonify({
            "error": "internal server error",
            "message": str(e)
        }), 500

# ---------------- SKIN SEVERITY ANALYSIS (XGBoost) ----------------

@app.route("/api/analyze-skin", methods=["POST","OPTIONS"])
def analyze_skin():
    if request.method == "OPTIONS":
        return jsonify({})

    try:
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({"error": "No JSON received"}), 400

        model = load_xgb_model()
        if model == "simulation":
            return jsonify(simulate_xgb(data))

        # XGBoost model expects exactly these 6 features:
        XGB_FEATURES = [
            "sleep_hours", "sunscreen_usage", "smoking",
            "alcohol_consumption", "physical_activity_level",
            "screen_time_hours"
        ]

        # Extract features with defaults for missing values
        import numpy as np  # type: ignore
        feature_values = []
        for feat in XGB_FEATURES:
            val = data.get(feat, 0)
            feature_values.append(float(val))

        features = np.array([feature_values])
        pred = model.predict(features)[0]  # type: ignore

        severity = XGB_SEVERITY_LABELS.get(int(pred), "Unknown")
        tips = LIFESTYLE_TIPS.get(severity, LIFESTYLE_TIPS["Mild"])

        return jsonify({
            "severity_label": severity,
            "severity_index": int(pred),
            "lifestyle_tips": tips,
            "model_mode": "xgboost"
        })

    except Exception as e:
        print("🔥 ANALYZE SKIN ERROR:")
        traceback.print_exc()
        return jsonify({
            "error": "internal server error",
            "message": str(e)
        }), 500

# ---------------- MAIN ----------------

if __name__ == "__main__":
    print("\n🚀 AI Skin Analysis Backend Running")
    print("Health: https://lumiskin-ai-backend.onrender.com/api/health")
    print("Image Model: https://lumiskin-ai-backend.onrender.com/api/analyze-image")
    print("Skin Model: https://lumiskin-ai-backend.onrender.com/api/analyze-skin\n")
   
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=False)


    