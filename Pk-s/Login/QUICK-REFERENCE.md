# Login System - Quick Reference Guide

## 🚀 Quick Start

### Files to Use
- **Login Page**: `Login/login.html`
- **Signup Page**: `Login/signup.html`
- **Password Reset**: `Login/forgot-password.html`
- **Authentication Script**: `Login/scriptlogin-enhanced.js`
- **Main Auth Page**: `auth.html` (alternative interface)

### Key Updates from Version 1.0

| Feature | Before | After |
|---------|--------|-------|
| Email Verification | ❌ None | ✅ Required |
| Password Reset | ❌ None | ✅ Built-in |
| Remember Me | ❌ None | ✅ Implemented |
| Form Validation | ⚠️ Basic | ✅ Advanced |
| Session Management | ⚠️ localStorage | ✅ sessionStorage + secure |
| Error Messages | ⚠️ Generic | ✅ Specific & styled |
| Loading States | ❌ None | ✅ With spinner |
| Responsive Design | ⚠️ Limited | ✅ Full |
| Dark Mode | ❌ None | ✅ Supported |
| Accessibility | ⚠️ Limited | ✅ WCAG compliant |

## 📋 Form Fields Reference

### Login Form
```
ID: loginEmail       → Email input
ID: loginPassword    → Password input
ID: rememberMe       → Checkbox (auto-saved in localStorage)
```

### Signup Form
```
ID: signupName              → Full name input
ID: signupEmail             → Email input
ID: signupPassword          → Password input (8+ chars)
ID: signupConfirmPassword   → Confirm password input
```

### Password Reset Form
```
ID: resetEmail       → Email for password reset
```

## 🔐 Security Standards

- ✅ HTTPS/TLS encryption
- ✅ Firebase Authentication
- ✅ Email verification required
- ✅ Password hashing
- ✅ Session tokens
- ✅ Rate limiting
- ✅ XSS protection
- ✅ CSRF protection

## 🎨 Styling Classes

| Class | Purpose |
|-------|---------|
| `.primary-btn` | Main action button |
| `.google-btn` | Google sign-in button |
| `.switch-text` | Link to switch between login/signup |
| `.form-box` | Form container |
| `.input-group` | Input field wrapper (for enhanced UI) |
| `.password-toggle` | Show/hide password button |

## 📊 User Document Structure

```javascript
{
  uid: "unique_user_id",
  name: "User Full Name",
  email: "user@example.com",
  emailVerified: true/false,
  role: "user",
  photoURL: "https://...",
  provider: "email" | "google",
  rememberMe: true/false,
  createdAt: Timestamp,
  lastLogin: Timestamp,
  preferences: {
    newsletter: true/false,
    notifications: true/false
  }
}
```

## 💾 Storage Reference

| Item | Storage | Lifetime | Content |
|------|---------|----------|---------|
| `lumiskinUser` | sessionStorage | Session | User profile data |
| `lumiskinRememberMe` | localStorage | Persistent | Boolean flag |
| `lumiskinUserEmail` | localStorage | Persistent | User email |
| Auth Token | Firebase | Session | JWT token |

## 🔗 Import Authentication Functions

```javascript
import { 
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
} from './Login/scriptlogin-enhanced.js';
```

## 🎯 Common Tasks

### Check if User is Logged In
```javascript
import { currentUser } from './Login/scriptlogin-enhanced.js';

if (currentUser) {
    console.log('Logged in as:', currentUser.email);
} else {
    window.location.href = 'auth.html';
}
```

### Get Current User Info
```javascript
import { getStoredUser } from './Login/scriptlogin-enhanced.js';

const user = getStoredUser();
console.log(user.name, user.email);
```

### Show Status Message
```javascript
import { showStatus } from './Login/scriptlogin-enhanced.js';

showStatus('Your message here', 'success'); // success, error, warning, info
showStatus('Error occurred', 'error', 3000); // Auto-hide after 3 seconds
```

### Show Loading State
```javascript
import { setLoading } from './Login/scriptlogin-enhanced.js';

const btn = document.querySelector('button');
setLoading(btn, true);  // Show loading
// ... do async work ...
setLoading(btn, false); // Hide loading
```

### Validate Password Strength
```javascript
import { getPasswordStrength } from './Login/scriptlogin-enhanced.js';

const password = 'MyP@ssw0rd';
const strength = getPasswordStrength(password);
console.log(strength); // "Very Strong", "Strong", "Fair", etc.
```

## 🚨 Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "No account found with this email" | Email not registered | Sign up first |
| "Incorrect password" | Wrong password entered | Check caps lock, try again |
| "Too many attempts" | Rate limiting triggered | Wait 15 minutes |
| "Email not verified" | Email verification pending | Check your inbox |
| "Network error" | Internet connection issue | Check connection |
| "Firebase not initialized" | Script load issue | Refresh page |

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## ♿ Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate between fields |
| `Enter` | Submit form |
| `Space` | Toggle checkbox |
| `Alt+P` | Focus password field |
| `Alt+E` | Focus email field |

## 🧪 Test Accounts

Create test accounts using:
- Email: `test@example.com`
- Password: `Test@12345678`

## 🔄 Common Workflows

### New User Registration
1. Go to `signup.html`
2. Fill form (name, email, password)
3. Click "Sign up"
4. Check email for verification link
5. Click verification link
6. Go back to `login.html`
7. Login with credentials
8. Select "Remember me" if desired

### Returning User
1. Go to `login.html`
2. Email auto-fills (if "Remember me" was checked)
3. Enter password
4. Click "Login"

### Forgot Password
1. Go to `forgot-password.html`
2. Enter registered email
3. Check email for reset link
4. Follow reset link (Firebase handles this)
5. Create new password
6. Go to `login.html` and login with new password

## 📞 Troubleshooting

**Issue**: Login doesn't work
- Check network connection
- Verify email is correct
- Check if email is verified
- Clear browser cache/cookies

**Issue**: "Remember me" not working
- Check if localStorage is enabled
- Verify browser privacy settings
- Check browser storage limits

**Issue**: Password reset email not received
- Check spam folder
- Verify email address is correct
- Wait a few minutes
- Check Firebase configuration

**Issue**: Page keeps redirecting to auth.html
- User not logged in (expected behavior)
- Session expired
- Firebase not initialized
- Check browser console for errors

## 📈 Performance Tips

- Cache user data after login
- Use sessionStorage for temp data
- Lazy load pages after authentication
- Minimize Firebase reads with batching
- Enable offline persistence

## 🎓 Learning Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Web Security Best Practices](https://owasp.org/www-project-top-ten/)

---

**Last Updated**: March 5, 2026 | **Version**: 2.0
