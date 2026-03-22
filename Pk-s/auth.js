// ================= FIREBASE IMPORTS =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// ================= FIREBASE CONFIG =================

const firebaseConfig = {
    apiKey: "AIzaSyB8TpspgRB49SJos3Jr6TjIb2CgUaJw5KA",
    authDomain: "lumiskin-e2dba.firebaseapp.com",
    projectId: "lumiskin-e2dba",
    storageBucket: "lumiskin-e2dba.firebasestorage.app",
    messagingSenderId: "530130297490",
    appId: "1:530130297490:web:664375d22b2f0ae190fc4b",
    measurementId: "G-E73FF0FB6Y"
};
// Initialize Firebase
let app, analytics, auth, db, googleProvider;

try {
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    console.log("✅ Firebase initialized successfully");
} catch (error) {
    console.error("❌ Firebase initialization failed:", error);
}

// ================= DOM ELEMENTS =================
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const toastContainer = document.getElementById('toastContainer');

// ================= TAB SWITCHING =================
if (loginTab && signupTab && loginForm && signupForm) {
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
    });

    signupTab.addEventListener('click', () => {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
    });
}

// ================= TOAST NOTIFICATIONS =================
function showToast(message, type = 'info') {
    const icons = {
        success: '<i class="fa-solid fa-circle-check"></i>',
        error: '<i class="fa-solid fa-circle-xmark"></i>',
        info: '<i class="fa-solid fa-circle-info"></i>'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `${icons[type]} ${message}`;
    toastContainer.appendChild(toast);

    // Remove after animation
    setTimeout(() => {
        toast.remove();
    }, 3500);
}

// ================= PASSWORD TOGGLE =================
document.querySelectorAll('.password-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
        const input = toggle.parentElement.querySelector('input');
        const icon = toggle.querySelector('i');

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
});

// ================= SET BUTTON LOADING =================
function setLoading(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.dataset.originalText = button.textContent;
        button.textContent = 'Please wait...';
    } else {
        button.classList.remove('loading');
        button.textContent = button.dataset.originalText || 'Submit';
    }
}

// ================= SIGNUP =================
if (signupForm) signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const submitBtn = signupForm.querySelector('.auth-submit');

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    setLoading(submitBtn, true);

    try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update display name
        await updateProfile(user, { displayName: name });

        // Store user info in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            name: name,
            email: email,
            role: 'user',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            provider: 'email'
        });

        showToast('Account created successfully! Redirecting...', 'success');

        // Redirect after short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

    } catch (error) {
        console.error("Signup error code:", error.code, "| message:", error.message);
        const errorMessages = {
            'auth/email-already-in-use': 'This email is already registered. Try logging in.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/operation-not-allowed': 'Email/Password sign-in is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method.',
            'auth/admin-restricted-operation': 'Email/Password sign-in is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method.',
        };

        showToast(errorMessages[error.code] || `Error: ${error.code || error.message}`, 'error');
    } finally {
        setLoading(submitBtn, false);
    }
});

// ================= LOGIN =================
if (loginForm) loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const submitBtn = loginForm.querySelector('.auth-submit');

    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    setLoading(submitBtn, true);

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update last login in Firestore
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                lastLogin: serverTimestamp()
            });
        } catch (firestoreErr) {
            // User doc might not exist if they signed up before Firestore was added
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                name: user.displayName || '',
                email: user.email,
                lastLogin: serverTimestamp(),
                provider: 'email'
            });
        }

        showToast('Login successful! Welcome back.', 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

    } catch (error) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/too-many-requests': 'Too many attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/invalid-credential': 'Invalid email or password. Please try again.'
        };

        showToast(errorMessages[error.code] || error.message, 'error');
    } finally {
        setLoading(submitBtn, false);
    }
});

// ================= GOOGLE SIGN-IN =================
document.querySelectorAll('.google-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Store/update user info in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                name: user.displayName || 'Google User',
                email: user.email,
                role: 'user',
                photoURL: user.photoURL || '',
                lastLogin: serverTimestamp(),
                provider: 'google'
            }, { merge: true });

            showToast('Google sign-in successful!', 'success');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            if (error.code !== 'auth/popup-closed-by-user') {
                showToast('Google sign-in failed. Please try again.', 'error');
            }
        }
    });
});

// ================= FLOATING PARTICLES =================
function createParticles() {
    const bg = document.querySelector('.auth-bg');
    if (!bg) return;

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = (Math.random() * 4 + 2) + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDuration = (Math.random() * 10 + 8) + 's';
        particle.style.animationDelay = (Math.random() * 5) + 's';
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        bg.appendChild(particle);
    }
}

createParticles();
