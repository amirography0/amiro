import { 
    auth,
    db,
    storage
} from './firebase-config.js';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    arrayUnion,
    arrayRemove,
    increment,
    limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// DOM Elements
const photoUploadInput = document.getElementById('photo-upload');
const photoTagsInput = document.getElementById('photo-tags');
const uploadBtnFeed = document.getElementById('upload-btn-feed');
const uploadBtnHome = document.getElementById('upload-btn-home');

// Photo Upload Function
async function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!auth.currentUser) {
        showLoginModal();
        return;
    }
    
    try {
        // Show loading state
        const loadingScreen = document.querySelector('.loading-screen');
        loadingScreen.classList.remove('hidden');
        loadingScreen.querySelector('.loading-text').textContent = "Uploading your photo...";

        // Get tags from input
        const tagsInput = photoTagsInput.value.trim();
        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : ['photography'];
        
        // 1. Upload to Firebase Storage
        const storageRef = ref(storage, `photos/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        // 2. Save to Firestore with tags
        await addDoc(collection(db, "photos"), {
            url: downloadURL,
            title: file.name.split('.')[0],
            tags: tags,
            price: 0, // Free by default
            ownerId: auth.currentUser.uid,
            ownerName: auth.currentUser.displayName || 'Anonymous',
            ownerPhotoURL: auth.currentUser.photoURL,
            ownerSubscription: "free", // Will be updated from user data
            createdAt: serverTimestamp(),
            downloads: 0,
            likes: 0,
            comments: 0,
            isPublic: true,
            isMonetized: false,
            isApproved: false,
            likedBy: []
        });
        
        alert("Photo uploaded successfully!");
        loadUserPhotos(auth.currentUser.uid);
        loadCommunityFeed();
        photoTagsInput.value = ''; // Clear tags input
    } catch (error) {
        console.error("Upload error:", error);
        alert("Upload failed: " + error.message);
    } finally {
        document.querySelector('.loading-screen').classList.add('hidden');
    }
}

// Load Photos Functions
async function loadFeaturedPhotos() {
    try {
        const q = query(collection(db, "photos"), 
                  where("isPublic", "==", true),
                  orderBy("createdAt", "desc"),
                  limit(5));
        const snapshot = await getDocs(q);
        
        const featuredContainer = document.getElementById('featured-photos');
        featuredContainer.innerHTML = '';
        
        snapshot.forEach(doc => {
            const photo = doc.data();
            featuredContainer.innerHTML += createPhotoCard(photo, doc.id);
        });
    } catch (error) {
        console.error("Error loading featured photos:", error);
    }
}

async function loadMarketplacePhotos(filter = 'all') {
    try {
        let q;
        if (filter === 'free') {
            q = query(collection(db, "photos"), 
                where("isPublic", "==", true),
                where("price", "==", 0),
                orderBy("createdAt", "desc"));
        } else if (filter === 'premium') {
            q = query(collection(db, "photos"), 
                where("isPublic", "==", true),
                where("price", ">", 0),
                orderBy("price"),
                orderBy("createdAt", "desc"));
        } else {
            q = query(collection(db, "photos"), 
                where("isPublic", "==", true),
                orderBy("createdAt", "desc"));
        }
        
        const snapshot = await getDocs(q);
        const marketplaceContainer = document.getElementById('marketplace-photos');
        marketplaceContainer.innerHTML = '';
        
        snapshot.forEach(doc => {
            const photo = doc.data();
            marketplaceContainer.innerHTML += createPhotoCard(photo, doc.id);
        });
    } catch (error) {
        console.error("Error loading marketplace photos:", error);
    }
}

function createPhotoCard(photo, photoId) {
    const isOwner = auth.currentUser && photo.ownerId === auth.currentUser.uid;
    const isPurchased = auth.currentUser && auth.currentUser.purchasedPhotos && auth.currentUser.purchasedPhotos.includes(photoId);
    
    return `
        <div class="photo-card">
            ${photo.ownerSubscription !== 'free' ? 
                `<div class="pro-badge"><i class="fas fa-crown"></i> PRO</div>` : ''}
            <img src="${photo.url}" alt="${photo.title}" class="photo-thumbnail">
            <div class="photo-details">
                <h3 class="photo-title">${photo.title}</h3>
                <p class="photo-author">
                    <i class="fas fa-user"></i> ${photo.ownerName}
                </p>
                <div class="photo-stats">
                    <div class="photo-stat">
                        <i class="fas fa-heart"></i> ${photo.likes || 0}
                    </div>
                    <div class="photo-stat">
                        <i class="fas fa-comment"></i> ${photo.comments || 0}
                    </div>
                    <div class="photo-stat">
                        <i class="fas fa-download"></i> ${photo.downloads || 0}
                    </div>
                </div>
                ${photo.price > 0 ? 
                    `<div class="photo-price">$${photo.price.toFixed(2)}</div>
                     ${isOwner || isPurchased ?
                        `<button class="action-btn download-btn" onclick="downloadPhoto('${photoId}')">
                            <i class="fas fa-download"></i> Download
                        </button>` :
                        `<button class="action-btn buy-btn" onclick="handlePhotoAction('${photoId}', ${photo.price})">
                            <i class="fas fa-shopping-cart"></i> Buy Now
                        </button>`}` :
                    `<span class="free-badge"><i class="fas fa-tag"></i> FREE</span>
                     <button class="action-btn download-btn" onclick="downloadPhoto('${photoId}')">
                        <i class="fas fa-download"></i> Download
                     </button>`}
            </div>
        </div>
    `;
}

// Event Listeners
photoUploadInput.addEventListener('change', handlePhotoUpload);
uploadBtnFeed.addEventListener('click', () => photoUploadInput.click());
uploadBtnHome.addEventListener('click', () => photoUploadInput.click());

export { loadFeaturedPhotos, loadMarketplacePhotos, createPhotoCard };