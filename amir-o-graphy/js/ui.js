import { auth } from './firebase-config.js';

// DOM Elements
const navHome = document.getElementById('nav-home');
const navMarketplace = document.getElementById('nav-marketplace');
const navFeed = document.getElementById('nav-feed');
const navProfile = document.getElementById('nav-profile');
const notificationBell = document.getElementById('notification-bell');
const subscriptionModalClose = document.getElementById('subscription-modal-close');
const subscriptionModal = document.getElementById('subscription-modal');
const adminModalClose = document.getElementById('admin-modal-close');
const adminModal = document.getElementById('admin-notify-modal');
const adminBtn = document.getElementById('admin-btn');
const filterAll = document.querySelector('.filter-all');
const filterFree = document.querySelector('.filter-free');
const filterPremium = document.querySelector('.filter-premium');

// UI Functions
function showSection(sectionId) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Highlight current nav item
    if (sectionId === 'home') navHome.classList.add('active');
    if (sectionId === 'marketplace') navMarketplace.classList.add('active');
    if (sectionId === 'feed') navFeed.classList.add('active');
    if (sectionId === 'profile') navProfile.classList.add('active');
    
    // Show section
    document.querySelectorAll('section[id$="-section"]').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(`${sectionId}-section`).style.display = 'block';
}

function switchTab(tabId) {
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    document.querySelectorAll('#uploads-tab, #favorites-tab, #purchased-tab, #monetization-tab').forEach(tab => {
        tab.style.display = 'none';
    });
    
    document.getElementById(`${tabId}-tab`).style.display = 'block';
}

function showLoginModal() {
    document.getElementById('login-modal').classList.add('active');
}

function showSubscriptionModal() {
    if (!auth.currentUser) {
        showLoginModal();
        return;
    }
    document.getElementById('subscription-modal').classList.add('active');
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

function toggleNotifications() {
    document.querySelector('.notification-dropdown').classList.toggle('active');
}

function toggleAdminPanel() {
    document.getElementById('admin-panel').classList.toggle('active');
}

function showAdminModal(type) {
    document.getElementById('admin-notify-modal').classList.add('active');
    document.getElementById('admin-modal-title').textContent = 
        type === 'notify-all' ? 'Notify All Users' :
        type === 'notify-user' ? 'Notify Specific User' :
        type === 'remove-post' ? 'Remove Post' : 'Suspend User';
    
    document.getElementById('notify-all-form').style.display = 
        type === 'notify-all' ? 'block' : 'none';
    document.getElementById('notify-user-form').style.display = 
        type === 'notify-user' ? 'block' : 'none';
    
    toggleAdminPanel();
}

// Event Listeners
navHome.addEventListener('click', () => showSection('home'));
navMarketplace.addEventListener('click', () => showSection('marketplace'));
navFeed.addEventListener('click', () => showSection('feed'));
navProfile.addEventListener('click', () => showSection('profile'));
notificationBell.addEventListener('click', toggleNotifications);
subscriptionModalClose.addEventListener('click', closeModal);
adminModalClose.addEventListener('click', closeModal);
adminBtn.addEventListener('click', toggleAdminPanel);
filterAll.addEventListener('click', () => filterPhotos('all'));
filterFree.addEventListener('click', () => filterPhotos('free'));
filterPremium.addEventListener('click', () => filterPhotos('premium'));

export { showSection, switchTab, showLoginModal, showSubscriptionModal, closeModal, toggleNotifications, toggleAdminPanel, showAdminModal };