# Login System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        LumiSkin Authentication System v2.0               │
└─────────────────────────────────────────────────────────────────────────┘

                              USER INTERFACES
                                     │
        ┌────────────────┬───────────┼────────────┬──────────────────┐
        │                │           │            │                  │
    login.html      signup.html  auth.html  forgot-password.html  profile
    (Simple UI)    (Simple UI)   (Premium)      (Password Reset)  (Dashboard)


                          AUTHENTICATION LAYER
                                     │
                    scriptlogin-enhanced.js
                    (Unified Auth Module)
                    
                    ├── Firebase Init
                    ├── Auth State Listener
                    ├── Session Management
                    ├── Form Validation
                    ├── Error Handling
                    └── Utility Functions


                         FIREBASE BACKEND
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
   Firebase Auth              Firebase Firestore         Firebase Storage
   (Authentication)           (User Data & Metadata)    (Profile Images)
   
   • Email/Password           • User Documents           • Avatars
   • Google OAuth             • User Preferences        • User Photos
   • Email Verification       • Login History
   • Password Reset           • Activity Logs


                            DATA FLOW ARCHITECTURE

                          ┌──────────────────────┐
                          │   User Opens App     │
                          └──────────┬───────────┘
                                     │
                          ┌──────────▼───────────┐
                          │ Auth State Listener  │
                          │ (onAuthStateChanged) │
                          └──────────┬───────────┘
                                     │
                         ┌───────────┴────────────┐
                         │                        │
                    ┌────▼─────┐           ┌─────▼──────┐
                    │ Logged In │           │ Not Logged │
                    │           │           │    In      │
                    └────┬──────┘           └─────┬──────┘
                         │                        │
              ┌──────────▼──────────┐   ┌────────▼─────────────┐
              │ Load Dashboard      │   │ Redirect to Auth     │
              │ from Firestore      │   │ Save redirect URL    │
              │ Start Session       │   │ Show Login Form      │
              └─────────────────────┘   └────────┬─────────────┘
                                                  │
                                      ┌───────────┴──────────┐
                                      │                      │
                                  ┌───▼──┐          ┌──────▼─────┐
                                  │Login │          │Sign Up     │
                                  │      │          │            │
                                  └───┬──┘          └──────┬──────┘
                                      │                    │
                    ┌─────────────────┴────────┬───────────┴─────┐
                    │                          │                 │
            ┌───────▼────────┐       ┌────────▼──────┐  ┌───────▼─┐
            │ Email Login    │       │ Google OAuth  │  │Password │
            │                │       │               │  │ Reset   │
            └───┬──────┬─────┘       └───┬──────┬────┘  └───┬─────┘
                │      │                 │      │          │
         ┌──────▼─┐  ┌─▼────────────┐   │      │    ┌─────▼──────┐
         │Validate│  │Check Email   │   │      │    │Send Reset  │
         │Creds   │  │Verified      │   │      │    │Email       │
         └──┬─────┘  └─┬────────────┘   │      │    └─────┬──────┘
            │          │                 │      │          │
         ┌──▼──────────▼─┐      ┌────────▼────▼───┐   ┌───▼────────┐
         │Firebase Auth  │      │Firebase Auth    │   │User Clicks │
         │(Email/Pass)   │      │(Google Popup)   │   │Reset Link  │
         └───┬──────┬────┘      └────┬────────┬───┘   └───┬────────┘
             │      │                │        │           │
          ┌──▼──┐ ┌─▼────────────┐  │        │    ┌──────▼─────┐
          │Auth │ │Verify Email  │  │        │    │Auth State  │
          │Fail │ │Verified?     │  │        │    │Updated     │
          └─────┘ └──┬──────┬────┘  │        │    └──────┬─────┘
                     │      │       │        │           │
                  ┌──▼──┐ ┌─▼──┐   │        │    ┌──────▼─────┐
                  │Not  │ │Yes │   │        │    │Update Pass │
                  │Pass│ │    │   │        │    │Reset DB    │
                  └────┘ └─┬──┘   │        │    └──────┬─────┘
                           │      │        │           │
                      ┌────▼──────▼────────▼────────────▼─────┐
                      │                                        │
                   ┌──▼──────────────────────────────────────┐
                   │ Create Session (sessionStorage)          │
                   │ ├── User UID                             │
                   │ ├── Email                                │
                   │ ├── Display Name                         │
                   │ ├── Photo URL                            │
                   │ ├── Email Verified Status                │
                   │ └── Last Login Time                       │
                   └──┬───────────────────────────────────────┘
                      │
                      │
                   ┌──▼──────────────────────────────────────┐
                   │ Save to Firestore User Document         │
                   │ ├── Account Data                         │
                   │ ├── Login History                        │
                   │ ├── User Preferences                     │
                   │ └── Last Activity                        │
                   └──┬───────────────────────────────────────┘
                      │
                      │
                   ┌──▼──────────────────────────────────────┐
                   │ Redirect to Dashboard                    │
                   │ Load Protected Pages                     │
                   │ Start Using Application                 │
                   └──────────────────────────────────────────┘
```

## Component Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                   scriptlogin-enhanced.js                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ FIREBASE INITIALIZATION LAYER                           │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ • initializeApp(firebaseConfig)                         │  │
│  │ • getAuth() - Firebase Auth instance                   │  │
│  │ • getFirestore() - Firestore database                  │  │
│  │ • enableIndexedDbPersistence() - Offline support       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ AUTHENTICATION STATE LAYER                              │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ • onAuthStateChanged() - Real-time listener            │  │
│  │ • currentUser - Global state                           │  │
│  │ • updateUserSession() - Session creation              │  │
│  │ • clearUserSession() - Session cleanup                │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ VALIDATION LAYER                                        │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ • validateEmail(email) - Email format check            │  │
│  │ • validatePassword(password) - Strength check          │  │
│  │ • getPasswordStrength(password) - Strength rating      │  │
│  │ • Form field validation before submission              │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ AUTHENTICATION HANDLERS                                 │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ • LOGIN FORM HANDLER                                    │  │
│  │   ├── Email/password validation                         │  │
│  │   ├── signInWithEmailAndPassword()                     │  │
│  │   ├── Email verification check                         │  │
│  │   ├── Update lastLogin in Firestore                    │  │
│  │   └── Session management                               │  │
│  │                                                         │  │
│  │ • SIGNUP FORM HANDLER                                   │  │
│  │   ├── Form validation                                  │  │
│  │   ├── createUserWithEmailAndPassword()                 │  │
│  │   ├── updateProfile() - Set display name              │  │
│  │   ├── sendEmailVerification()                         │  │
│  │   ├── Create Firestore user document                   │  │
│  │   └── Auto-redirect after signup                       │  │
│  │                                                         │  │
│  │ • PASSWORD RESET HANDLER                                │  │
│  │   ├── Email validation                                 │  │
│  │   ├── sendPasswordResetEmail()                        │  │
│  │   ├── Firebase handles reset link                      │  │
│  │   └── Redirect to login                                │  │
│  │                                                         │  │
│  │ • GOOGLE SIGN-IN HANDLER                                │  │
│  │   ├── signInWithPopup() with Google provider           │  │
│  │   ├── Create/update Firestore document                 │  │
│  │   ├── Handle provider data                             │  │
│  │   └── Session management                               │  │
│  │                                                         │  │
│  │ • LOGOUT HANDLER                                        │  │
│  │   ├── signOut() from Firebase                          │  │
│  │   ├── Clear session storage                            │  │
│  │   └── Redirect to home                                 │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ UI/UX LAYER                                             │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ • showStatus(message, type, duration) - Messages      │  │
│  │ • setLoading(button, loading) - Loading states        │  │
│  │ • Password visibility toggle - Show/hide               │  │
│  │ • Form field interactions - Events                     │  │
│  │ • Error message formatting - User feedback            │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ SESSION & STORAGE LAYER                                 │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ • updateUserSession() - sessionStorage                 │  │
│  │ • getStoredUser() - Retrieve session                   │  │
│  │ • localStorage - Persistent (email, rememberMe)        │  │
│  │ • sessionStorage - Temporary (user profile)            │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ ERROR HANDLING LAYER                                    │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ • Firebase error code mapping                          │  │
│  │ • User-friendly error messages                         │  │
│  │ • Network error detection                              │  │
│  │ • Rate limiting handling                               │  │
│  │ • Graceful fallbacks                                   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ EXPORTS (For other modules)                             │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ • auth - Firebase Auth instance                        │  │
│  │ • db - Firestore instance                              │  │
│  │ • currentUser - Current user object                    │  │
│  │ • getStoredUser() - Get session user                   │  │
│  │ • showStatus() - Show messages                         │  │
│  │ • setLoading() - Toggle loading                        │  │
│  │ • validateEmail() - Email validator                    │  │
│  │ • validatePassword() - Password validator              │  │
│  │ • getPasswordStrength() - Strength checker             │  │
│  │ • updateUserSession() - Create session                 │  │
│  │ • clearUserSession() - Clear session                   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Database Schema

```
Firebase Authentication
├── Users
│   ├── Email
│   ├── Password (hashed)
│   ├── Display Name
│   ├── Photo URL
│   ├── Email Verified
│   ├── Created At
│   └── Last Login

Firestore Database
└── users (collection)
    └── {uid} (document)
        ├── uid: string
        ├── name: string
        ├── email: string
        ├── emailVerified: boolean
        ├── role: "user" | "admin"
        ├── photoURL: string (optional)
        ├── provider: "email" | "google"
        ├── rememberMe: boolean
        ├── createdAt: Timestamp
        ├── lastLogin: Timestamp
        └── preferences
            ├── newsletter: boolean
            └── notifications: boolean
```

## Storage Architecture

```
Browser Storage
│
├── localStorage (Persistent - survives browser restart)
│   ├── lumiskinRememberMe: "true" | "false"
│   ├── lumiskinUserEmail: "user@example.com"
│   └── [Other app data]
│
├── sessionStorage (Session - cleared on browser close)
│   ├── lumiskinUser: {
│   │   uid: "...",
│   │   email: "...",
│   │   displayName: "...",
│   │   photoURL: "...",
│   │   emailVerified: true|false,
│   │   lastLogin: "..."
│   │}
│   └── [Session data]
│
└── IndexedDB (Firestore offline cache)
    ├── Firestore metadata
    ├── User documents
    └── Query results cache
```

## Security Model

```
┌──────────────────────────────────────────────────────┐
│            Security Layers                           │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Layer 1: Transport Security                         │
│ ├── HTTPS/TLS Encryption                           │
│ ├── Secure WebSockets                              │
│ └── Certificate Pinning (optional)                 │
│                                                      │
│ Layer 2: Authentication                             │
│ ├── Firebase Auth Tokens                           │
│ ├── Email Verification                             │
│ ├── Password Hashing (bcrypt)                      │
│ └── Session Tokens                                 │
│                                                      │
│ Layer 3: Authorization                              │
│ ├── Firestore Security Rules                       │
│ ├── Role-Based Access Control                      │
│ ├── User Document Access Rules                     │
│ └── Collection-Level Permissions                   │
│                                                      │
│ Layer 4: Data Protection                            │
│ ├── Sensitive Data in sessionStorage               │
│ ├── No passwords in storage                        │
│ ├── Session cleanup on logout                      │
│ └── Cookie security flags                          │
│                                                      │
│ Layer 5: Application Layer                          │
│ ├── Input Validation                               │
│ ├── Output Encoding                                │
│ ├── Error Message Sanitization                     │
│ └── CSRF Protection                                │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
User Action
    │
    ├─ Client-side Validation
    │  ├─ Email format? → Show error
    │  ├─ Password length? → Show error
    │  ├─ Fields filled? → Show error
    │  └─ Pass → Next
    │
    ├─ Firebase Call
    │  ├─ Network error? → Show connection error
    │  ├─ Auth error? → Map to user message
    │  ├─ Firestore error? → Show error
    │  └─ Success → Continue
    │
    └─ Post-Action
       ├─ Validation check
       ├─ State update
       ├─ Session management
       └─ Navigation/Redirect
```

## Performance Optimization

```
┌──────────────────────────────────────────────────────┐
│        Performance Optimization Strategy             │
├──────────────────────────────────────────────────────┤
│                                                      │
│ 1. Offline Persistence                              │
│    └─ enableIndexedDbPersistence()                  │
│       • Cache Firestore data locally                │
│       • Reduce network requests                     │
│       • Faster subsequent loads                     │
│                                                      │
│ 2. Lazy Loading                                      │
│    └─ onAuthStateChanged() listener                 │
│       • Only load auth state when needed            │
│       • Defer user data loading                     │
│       • Split Firebase queries                      │
│                                                      │
│ 3. Batch Operations                                  │
│    └─ setDoc(..., { merge: true })                  │
│       • Combine updates in one call                 │
│       • Reduce database write operations            │
│       • Atomic transactions                         │
│                                                      │
│ 4. Session Caching                                   │
│    └─ sessionStorage/localStorage                   │
│       • Avoid repeated Firebase queries             │
│       • Fast user state access                      │
│       • Reduced server load                         │
│                                                      │
│ 5. Code Splitting                                    │
│    └─ Single enhanced script                        │
│       • Eliminate duplicate code                    │
│       • Reduce bundle size                          │
│       • Tree-shaking optimization                   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

**Architecture Version**: 2.0
**Last Updated**: March 5, 2026
**Status**: Production Ready
