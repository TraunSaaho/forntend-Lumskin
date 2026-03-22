// ================= FIREBASE IMPORTS =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    sendPasswordResetEmail,
    sendEmailVerification,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    updateDoc,
    getDoc,
    serverTimestamp,
    enableIndexedDbPersistence
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
let currentUser = null;

try {
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    
    // Enable offline persistence for better UX
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn("Persistence failed - multiple tabs open");
        } else if (err.code === 'unimplemented') {
            console.warn("Browser doesn't support persistence");
        }
    });
    
    console.log("✅ Firebase initialized successfully");
} catch (error) {
    console.error("❌ Firebase initialization failed:", error);
    // Use a simpler alert if showStatus isn't available yet
    alert("Firebase initialization failed. Please refresh the page.");
}

// ================= TAB SWITCHING =================
document.addEventListener('DOMContentLoaded', () => {
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginTab && signupTab && loginForm && signupForm) {
        loginTab.addEventListener('click', (e) => {
            e.preventDefault();
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
        });

        signupTab.addEventListener('click', (e) => {
            e.preventDefault();
            signupTab.classList.add('active');
            loginTab.classList.remove('active');
            signupForm.classList.add('active');
            loginForm.classList.remove('active');
        });
    }
});

// ================= AUTHENTICATION STATE LISTENER =================
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        console.log("✅ User authenticated:", user.email);
        // User is signed in
        document.body.dataset.authenticated = 'true';
        updateUserSession(user);
        // If on login or signup page, redirect to index
        if (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html')) {
            window.location.href = "../index.html";
        }
    } else {
        console.log("❌ User not authenticated");
        document.body.dataset.authenticated = 'false';
        clearUserSession();
    }
});

// ================= SESSION MANAGEMENT =================
function updateUserSession(user) {
    const sessionData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        lastLogin: new Date().toISOString()
    };
    sessionStorage.setItem('lumiskinUser', JSON.stringify(sessionData));
    localStorage.setItem('lumiskinUserEmail', user.email);
}

function clearUserSession() {
    sessionStorage.removeItem('lumiskinUser');
}

function getStoredUser() {
    const stored = sessionStorage.getItem('lumiskinUser');
    return stored ? JSON.parse(stored) : null;
}

// ================= STATUS MESSAGE HELPER =================
function showStatus(message, type = 'info', duration = 4000) {
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

    statusEl.textContent = message;
    statusEl.style.padding = '12px 16px';
    statusEl.style.borderRadius = '8px';
    statusEl.style.marginBottom = '16px';
    statusEl.style.fontSize = '14px';
    statusEl.style.fontWeight = '500';
    statusEl.style.textAlign = 'center';
    statusEl.style.transition = 'opacity 0.3s ease';
    statusEl.style.display = 'block';
    statusEl.style.opacity = '1';

    if (type === 'success') {
        statusEl.style.background = 'rgba(16, 185, 129, 0.15)';
        statusEl.style.color = '#10b981';
        statusEl.style.border = '1px solid rgba(16, 185, 129, 0.3)';
    } else if (type === 'error') {
        statusEl.style.background = 'rgba(239, 68, 68, 0.15)';
        statusEl.style.color = '#ef4444';
        statusEl.style.border = '1px solid rgba(239, 68, 68, 0.3)';
    } else if (type === 'warning') {
        statusEl.style.background = 'rgba(245, 158, 11, 0.15)';
        statusEl.style.color = '#f59e0b';
        statusEl.style.border = '1px solid rgba(245, 158, 11, 0.3)';
    } else {
        statusEl.style.background = 'rgba(59, 130, 246, 0.15)';
        statusEl.style.color = '#3b82f6';
        statusEl.style.border = '1px solid rgba(59, 130, 246, 0.3)';
    }

    // Auto-hide after duration
    if (duration > 0) {
        setTimeout(() => {
            statusEl.style.opacity = '0';
            setTimeout(() => {
                if (statusEl.parentNode) statusEl.remove();
            }, 300);
        }, duration);
    }
}

// ================= SET BUTTON LOADING =================
function setLoading(button, loading) {
    if (!button) return;
    if (loading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.innerHTML = '<span class="spinner"></span> Please wait...';
        button.style.opacity = '0.7';
        button.style.cursor = 'not-allowed';
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || 'Submit';
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    }
}

// ================= FORM VALIDATION =================
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

function getPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[@$!%*?&]/)) strength++;
    return ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][strength] || 'Very Weak';
}

// ================= PASSWORD VISIBILITY TOGGLE =================
document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const input = btn.closest('.input-group')?.querySelector('input[type="password"], input[type="text"]');
        if (input) {
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            btn.querySelector('i').className = isPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
        }
    });
});

// ================= LOGIN FORM HANDLER =================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById('loginEmail') || loginForm.querySelector('input[type="email"]');
        const passwordInput = document.getElementById('loginPassword') || loginForm.querySelector('input[type="password"]');
        const rememberMeCheckbox = document.getElementById('rememberMe');
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        const email = emailInput?.value.trim() || '';
        const password = passwordInput?.value || '';
        const rememberMe = rememberMeCheckbox?.checked || false;

        // Validation
        if (!email || !password) {
            showStatus('Please fill in all fields.', 'error');
            return;
        }

        if (!validateEmail(email)) {
            showStatus('Please enter a valid email address.', 'error');
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

            // Check email verification
            if (!user.emailVerified) {
                showStatus('Please verify your email before logging in.', 'warning');
                setLoading(submitBtn, false);
                return;
            }

            // Update last login in Firestore
            try {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    lastLogin: serverTimestamp(),
                    rememberMe: rememberMe
                });
            } catch (firestoreErr) {
                // User doc might not exist, create it
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    name: user.displayName || '',
                    email: user.email,
                    lastLogin: serverTimestamp(),
                    rememberMe: rememberMe,
                    provider: 'email',
                    createdAt: serverTimestamp()
                });
            }

            updateUserSession(user);

            // Store remember me preference
            if (rememberMe) {
                localStorage.setItem('lumiskinRememberMe', 'true');
                localStorage.setItem('lumiskinUserEmail', email);
            } else {
                localStorage.removeItem('lumiskinRememberMe');
            }

            showStatus('✅ Login successful! Redirecting...', 'success', 1500);

            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);

        } catch (error) {
            console.error("Login error:", error);
            const errorMessages = {
                'auth/user-not-found': 'No account found with this email.',
                'auth/wrong-password': 'Incorrect password. Please try again.',
                'auth/invalid-email': 'Please enter a valid email address.',
                'auth/too-many-requests': 'Too many login attempts. Please try again later.',
                'auth/network-request-failed': 'Network error. Please check your connection.',
                'auth/invalid-credential': 'Invalid email or password. Please try again.',
                'auth/user-disabled': 'This account has been disabled.'
            };

            showStatus(errorMessages[error.code] || `Error: ${error.message}`, 'error');
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
        const confirmPasswordInput = document.getElementById('signupConfirmPassword') || signupForm.querySelectorAll('input[type="password"]')[1];
        const submitBtn = signupForm.querySelector('button[type="submit"]');

        const name = nameInput?.value.trim() || '';
        const email = emailInput?.value.trim() || '';
        const password = passwordInput?.value || '';
        const confirmPassword = confirmPasswordInput?.value || '';

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            showStatus('Please fill in all fields.', 'error');
            return;
        }

        if (name.length < 2) {
            showStatus('Name must be at least 2 characters.', 'error');
            return;
        }

        if (!validateEmail(email)) {
            showStatus('Please enter a valid email address.', 'error');
            return;
        }

        if (password.length < 8) {
            showStatus('Password must be at least 8 characters.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showStatus('Passwords do not match.', 'error');
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

            // Send email verification
            await sendEmailVerification(user);

            // Store user info in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                role: 'user',
                emailVerified: false,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                provider: 'email',
                preferences: {
                    newsletter: true,
                    notifications: true
                }
            });

            updateUserSession(user);

            showStatus('✅ Account created! Check your email to verify your account.', 'success', 5000);

            // Clear form
            signupForm.reset();

            // Redirect after delay
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 3000);

        } catch (error) {
            console.error("Signup error:", error);
            const errorMessages = {
                'auth/email-already-in-use': 'This email is already registered. Try logging in.',
                'auth/invalid-email': 'Please enter a valid email address.',
                'auth/weak-password': 'Password should be at least 8 characters.',
                'auth/network-request-failed': 'Network error. Please check your connection.',
                'auth/operation-not-allowed': 'Account creation is not enabled.'
            };

            showStatus(errorMessages[error.code] || `Error: ${error.message}`, 'error');
        } finally {
            setLoading(submitBtn, false);
        }
    });
}

// ================= PASSWORD RESET FUNCTIONALITY =================
const resetForm = document.getElementById('resetForm');
if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById('resetEmail');
        const submitBtn = resetForm.querySelector('button[type="submit"]');

        const email = emailInput?.value.trim() || '';

        if (!email) {
            showStatus('Please enter your email address.', 'error');
            return;
        }

        if (!validateEmail(email)) {
            showStatus('Please enter a valid email address.', 'error');
            return;
        }

        if (!auth) {
            showStatus('Firebase not initialized. Please refresh the page.', 'error');
            return;
        }

        setLoading(submitBtn, true);

        try {
            await sendPasswordResetEmail(auth, email);
            showStatus('✅ Password reset email sent! Check your inbox.', 'success', 4000);
            resetForm.reset();
            
            // Redirect to login after delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 4000);
        } catch (error) {
            console.error("Password reset error:", error);
            const errorMessages = {
                'auth/user-not-found': 'No account found with this email.',
                'auth/invalid-email': 'Please enter a valid email address.',
                'auth/too-many-requests': 'Too many requests. Please try again later.',
                'auth/network-request-failed': 'Network error. Please check your connection.'
            };

            showStatus(errorMessages[error.code] || `Error: ${error.message}`, 'error');
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

        setLoading(btn, true);

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
                emailVerified: user.emailVerified,
                lastLogin: serverTimestamp(),
                provider: 'google',
                preferences: {
                    newsletter: true,
                    notifications: true
                }
            }, { merge: true });

            updateUserSession(user);

            showStatus('✅ Google sign-in successful! Redirecting...', 'success', 1500);

            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);

        } catch (error) {
            console.error("Google sign-in error:", error);
            if (error.code !== 'auth/popup-closed-by-user') {
                showStatus('Google sign-in failed. Please try again.', 'error');
            }
        } finally {
            setLoading(btn, false);
        }
    });
});

// ================= LOGOUT FUNCTIONALITY =================
document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            clearUserSession();
            showStatus('✅ Logged out successfully!', 'success', 1500);
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);
        } catch (error) {
            console.error("Logout error:", error);
            showStatus('Error logging out. Please try again.', 'error');
        }
    });
});

// ================= AUTO-FILL EMAIL IF REMEMBER ME =================
window.addEventListener('load', () => {
    if (localStorage.getItem('lumiskinRememberMe') === 'true') {
        const savedEmail = localStorage.getItem('lumiskinUserEmail');
        const emailInput = document.getElementById('loginEmail');
        if (emailInput && savedEmail) {
            emailInput.value = savedEmail;
            emailInput.focus();
        }
    }
});

// ================= EXPORT FOR USE IN OTHER MODULES =================
export {
    auth,
    db,
    currentUser,
    getStoredUser,
    showStatus,
    setLoading,
    validateEmail,
    validatePassword,
    getPasswordStrength,
    updateUserSession,
    clearUserSession
};

