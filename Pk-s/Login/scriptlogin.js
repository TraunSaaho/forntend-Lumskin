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

// ================= INITIALIZE FIREBASE =================
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
    showStatus("Firebase initialization failed. Please refresh the page.", "error");
}

// ================= STATUS MESSAGE HELPER =================
function showStatus(message, type = 'info') {
    // Try to use an existing status element, or create one
    let statusEl = document.getElementById('statusMessage');
    if (!statusEl) {
        statusEl = document.createElement('div');
        statusEl.id = 'statusMessage';
        const formBox = document.querySelector('.form-box');
        if (formBox) {
            formBox.insertBefore(statusEl, formBox.firstChild);
        } else {
            document.body.prepend(statusEl);
        }
    }

    // Style the message
    statusEl.textContent = message;
    statusEl.style.padding = '12px 16px';
    statusEl.style.borderRadius = '8px';
    statusEl.style.marginBottom = '16px';
    statusEl.style.fontSize = '14px';
    statusEl.style.fontWeight = '500';
    statusEl.style.textAlign = 'center';
    statusEl.style.transition = 'opacity 0.3s ease';

    if (type === 'success') {
        statusEl.style.background = 'rgba(16, 185, 129, 0.15)';
        statusEl.style.color = '#10b981';
        statusEl.style.border = '1px solid rgba(16, 185, 129, 0.3)';
    } else if (type === 'error') {
        statusEl.style.background = 'rgba(239, 68, 68, 0.15)';
        statusEl.style.color = '#ef4444';
        statusEl.style.border = '1px solid rgba(239, 68, 68, 0.3)';
    } else {
        statusEl.style.background = 'rgba(59, 130, 246, 0.15)';
        statusEl.style.color = '#3b82f6';
        statusEl.style.border = '1px solid rgba(59, 130, 246, 0.3)';
    }

    // Auto-hide after 4 seconds
    setTimeout(() => {
        statusEl.style.opacity = '0';
        setTimeout(() => {
            if (statusEl.parentNode) statusEl.remove();
        }, 300);
    }, 4000);
}

// ================= SET BUTTON LOADING =================
function setLoading(button, loading) {
    if (!button) return;
    if (loading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.textContent = 'Please wait...';
        button.style.opacity = '0.7';
        button.style.cursor = 'not-allowed';
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || 'Submit';
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    }
}

// ================= DETECT CURRENT PAGE =================
const currentPage = window.location.pathname;
const isLoginPage = currentPage.includes('login.html') || currentPage.endsWith('/Login/');
const isSignupPage = currentPage.includes('signup.html');

// ================= LOGIN FORM HANDLER =================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById('loginEmail') || loginForm.querySelector('input[type="email"]');
        const passwordInput = document.getElementById('loginPassword') || loginForm.querySelector('input[type="password"]');
        const submitBtn = loginForm.querySelector('.primary-btn') || loginForm.querySelector('button[type="submit"]');

        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';
        const rememberMe = document.getElementById('rememberMe')?.checked || false;

        if (!email || !password) {
            showStatus('Please fill in all fields.', 'error');
            return;
        }

        if (!auth) {
            showStatus('Firebase not initialized. Please refresh the page.', 'error');
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

            showStatus('Login successful! Redirecting...', 'success');

            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);

        } catch (error) {
            console.error("Login error:", error);
            const errorMessages = {
                'auth/user-not-found': 'No account found with this email.',
                'auth/wrong-password': 'Incorrect password. Please try again.',
                'auth/invalid-email': 'Please enter a valid email address.',
                'auth/too-many-requests': 'Too many attempts. Please try again later.',
                'auth/network-request-failed': 'Network error. Please check your connection.',
                'auth/invalid-credential': 'Invalid email or password. Please try again.'
            };

            showStatus(errorMessages[error.code] || error.message, 'error');
        } finally {
            setLoading(submitBtn, false);
        }
    });
}

// ================= SIGNUP FORM HANDLER =================
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('signupName') || signupForm.querySelector('input[type="text"]');
        const emailInput = document.getElementById('signupEmail') || signupForm.querySelector('input[type="email"]');
        const passwordInput = document.getElementById('signupPassword') || signupForm.querySelector('input[type="password"]');
        const submitBtn = signupForm.querySelector('.primary-btn') || signupForm.querySelector('button[type="submit"]');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';

        // Validation
        if (!name || !email || !password) {
            showStatus('Please fill in all fields.', 'error');
            return;
        }

        if (password.length < 6) {
            showStatus('Password must be at least 6 characters.', 'error');
            return;
        }

        if (!auth) {
            showStatus('Firebase not initialized. Please refresh the page.', 'error');
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

            showStatus('Account created successfully! Redirecting...', 'success');

            // Redirect after short delay
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);

        } catch (error) {
            console.error("Signup error:", error);
            const errorMessages = {
                'auth/email-already-in-use': 'This email is already registered. Try logging in.',
                'auth/invalid-email': 'Please enter a valid email address.',
                'auth/weak-password': 'Password should be at least 6 characters.',
                'auth/network-request-failed': 'Network error. Please check your connection.',
            };

            showStatus(errorMessages[error.code] || error.message, 'error');
        } finally {
            setLoading(submitBtn, false);
        }
    });
}

// ================= GOOGLE SIGN-IN =================
document.querySelectorAll('.google-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        if (!auth) {
            showStatus('Firebase not initialized. Please refresh the page.', 'error');
            return;
        }

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

            showStatus('Google sign-in successful! Redirecting...', 'success');

            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);

        } catch (error) {
            console.error("Google sign-in error:", error);
            if (error.code !== 'auth/popup-closed-by-user') {
                showStatus('Google sign-in failed. Please try again.', 'error');
            }
        }
    });
});

localStorage.setItem("lsUserLoggedIn", "true");