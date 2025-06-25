import { app, analytics, auth, db, storage, provider } from './firebase-config.js';
import { currentUser, updateAuthUI, signOutUser } from './auth.js';
import { loadFeaturedPhotos, loadMarketplacePhotos, createPhotoCard } from './photos.js';
import { showSection, switchTab, showLoginModal, showSubscriptionModal, closeModal, toggleNotifications, toggleAdminPanel, showAdminModal } from './ui.js';

// DOM Elements
const currentYearSpan = document.getElementById('current-year');

// Set current year in footer
currentYearSpan.textContent = new Date().getFullYear();

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Simulate loading screen
    setTimeout(() => {
        document.querySelector('.loading-screen').classList.add('hidden');
    }, 2000);

    // Load initial data
    loadFeaturedPhotos();
    loadMarketplacePhotos();
    loadCommunityFeed();
});

// Make functions available globally for HTML onclick attributes
window.showSection = showSection;
window.switchTab = switchTab;
window.showLoginModal = showLoginModal;
window.showSubscriptionModal = showSubscriptionModal;
window.closeModal = closeModal;
window.toggleNotifications = toggleNotifications;
window.toggleAdminPanel = toggleAdminPanel;
window.showAdminModal = showAdminModal;
window.signOutUser = signOutUser;