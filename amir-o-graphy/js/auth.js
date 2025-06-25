import { 
    auth, 
    provider,
    db
} from './firebase-config.js';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    increment,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// DOM Elements
const googleLoginBtn = document.getElementById('google-login-btn');
const authButtonsContainer = document.getElementById('auth-buttons');
const loginModalClose = document.getElementById('login-modal-close');
const loginModal = document.getElementById('login-modal');
const loginBtn = document.getElementById('login-btn');

// Global Variables
let currentUser = null;

// Authentication Functions
async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (!userDoc.exists()) {
            // Create new user document
            await setDoc(doc(db, "users", user.uid), {
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                subscription: "free",
                joinDate: serverTimestamp(),
                purchasedPhotos: [],
                uploadedPhotos: [],
                likesReceived: 0,
                commentsReceived: 0,
                isMonetized: false,
                isSuspended: false,
                dailyUploads: 0,
                dailyDownloads: 0,
                lastUploadDate: null,
                lastDownloadDate: null
            });
        }
        
        closeModal();
        updateAuthUI(user);
        
        // Show admin controls if admin
        if (user.email === "ahamed.to.tipak@gmail.com") {
            document.getElementById('admin-controls').style.display = 'block';
        }
    } catch (error) {
        console.error("Google sign-in error:", error);
        alert("Sign-in failed. Please try again.");
    }
}

async function signOutUser() {
    try {
        await signOut(auth);
        updateAuthUI(null);
        showSection('home');
    } catch (error) {
        console.error("Sign out error:", error);
        alert("Sign out failed. Please try again.");
    }
}

function updateAuthUI(user) {
    currentUser = user;
    authButtonsContainer.innerHTML = '';
    
    if (user) {
        // User is signed in
        authButtonsContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.8rem;">
                <img src="${user.photoURL || 'https://source.unsplash.com/random/300x300/?portrait'}" 
                     class="user-avatar" alt="User" onclick="showSection('profile')">
                <button class="auth-btn logout-btn" id="logout-btn">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        `;
        
        // Add event listener to logout button
        document.getElementById('logout-btn').addEventListener('click', signOutUser);
        
        // Update profile section if it's visible
        if (document.getElementById('profile-section').style.display !== 'none') {
            updateUserProfile(user);
            loadUserPhotos(user.uid);
            checkMonetizationStatus();
        }
    } else {
        // User is signed out
        authButtonsContainer.innerHTML = `
            <button class="auth-btn login-btn" id="login-btn">
                <i class="fas fa-sign-in-alt"></i> Login
            </button>
        `;
        
        // Add event listener to login button
        document.getElementById('login-btn').addEventListener('click', showLoginModal);
        
        // Hide profile section if user logs out
        if (document.getElementById('profile-section').style.display !== 'none') {
            showSection('home');
        }
    }
}

// Event Listeners
googleLoginBtn.addEventListener('click', signInWithGoogle);
loginModalClose.addEventListener('click', closeModal);
loginBtn.addEventListener('click', showLoginModal);

// Initialize auth state listener
onAuthStateChanged(auth, (user) => {
    updateAuthUI(user);
    
    // Show admin controls if admin
    if (user && user.email === "ahamed.to.tipak@gmail.com") {
        document.getElementById('admin-controls').style.display = 'block';
    }
});

export { currentUser, updateAuthUI, signOutUser };