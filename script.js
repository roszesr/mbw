// Function to show pages
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
        // Scroll to top when changing pages
        window.scrollTo(0, 0);
    }
}

// Function to exit the web app
function exitApp() {
    if (confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
        // For web browsers, we can either:
        // 1. Close the window/tab (works if opened by JavaScript)
        window.close();
        
        // 2. Redirect to a different page (fallback if window.close() doesn't work)
        // You can customize this URL to wherever you want users to go
        setTimeout(() => {
            window.location.href = 'about:blank';
        }, 300);
    }
}

// Handle back button in browser
window.onpopstate = function(event) {
    // Get current page
    const currentPage = document.querySelector('.page.active');
    if (currentPage) {
        const currentPageId = currentPage.id;
        
        // Define page hierarchy
        const pageHierarchy = {
            'main-menu': null, // Main menu has no parent
            'facilities-menu': 'main-menu',
            'description': 'main-menu',
            'food-area': 'facilities-menu',
            'sport-area': 'facilities-menu',
            'kids-area': 'facilities-menu',
            'photo-spots': 'facilities-menu'
        };
        
        // Get parent page and show it
        const parentPageId = pageHierarchy[currentPageId];
        if (parentPageId) {
            showPage(parentPageId);
        }
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Show main menu on load
    showPage('main-menu');
    
    // Handle Android back button if in WebView
    if (window.Android) {
        document.addEventListener('backbutton', function(e) {
            e.preventDefault();
            const currentPage = document.querySelector('.page.active');
            if (currentPage && currentPage.id !== 'main-menu') {
                window.history.back();
            } else {
                exitApp();
            }
        });
    }
});

// Prevent accidental exits
window.onbeforeunload = function(e) {
    const currentPage = document.querySelector('.page.active');
    if (currentPage && currentPage.id !== 'main-menu') {
        return 'Apakah Anda yakin ingin meninggalkan halaman ini?';
    }
};

function submitRating(event, facilityId) {
    event.preventDefault();
    
    const form = event.target;
    const rating = form.querySelector('input[name="rating"]:checked')?.value;
    const comment = form.querySelector('.rating-comment').value;
    
    if (!rating) {
        alert('Silakan pilih rating terlebih dahulu');
        return;
    }

    // Create rating object
    const ratingData = {
        id: Date.now(),
        facilityId: facilityId,
        rating: parseInt(rating),
        comment: comment,
        date: new Date().toLocaleDateString('id-ID'),
        time: new Date().toLocaleTimeString('id-ID')
    };

    // Save to localStorage
    saveRating(ratingData);

    // Update UI
    addRatingToUI(ratingData, form.closest('.facility-card'));
    
    // Reset form
    form.reset();
    
    alert('Terima kasih atas rating Anda!');
}

function saveRating(ratingData) {
    // Get existing ratings from localStorage
    const ratings = JSON.parse(localStorage.getItem('facilityRatings') || '[]');
    
    // Add new rating
    ratings.push(ratingData);
    
    // Save back to localStorage
    localStorage.setItem('facilityRatings', JSON.stringify(ratings));
    
    // Update average rating
    updateAverageRating(ratingData.facilityId);
}

function addRatingToUI(ratingData, facilityCard) {
    const userRatings = facilityCard.querySelector('.user-ratings');
    
    const ratingCard = document.createElement('div');
    ratingCard.className = 'rating-card';
    ratingCard.innerHTML = `
        <div class="rating-header">
            <div class="stars">
                ${'★'.repeat(ratingData.rating)}${'☆'.repeat(5-ratingData.rating)}
            </div>
            <span class="rating-date">${ratingData.date} ${ratingData.time}</span>
        </div>
        <div class="rating-content">
            ${ratingData.comment}
        </div>
    `;
    
    userRatings.insertBefore(ratingCard, userRatings.firstChild);
}

function toggleRatings(button) {
    const ratingsDiv = button.nextElementSibling;
    const isHidden = ratingsDiv.style.display === 'none';
    
    ratingsDiv.style.display = isHidden ? 'block' : 'none';
    button.textContent = isHidden ? 'Sembunyikan Rating' : 'Lihat Semua Rating';
}

function updateAverageRating(facilityId) {
    const ratings = JSON.parse(localStorage.getItem('facilityRatings') || '[]');
    const facilityRatings = ratings.filter(r => r.facilityId === facilityId);
    
    if (facilityRatings.length > 0) {
        const average = facilityRatings.reduce((acc, curr) => acc + curr.rating, 0) / facilityRatings.length;
        const facilityCard = document.querySelector(`[data-facility-id="${facilityId}"]`);
        
        if (facilityCard) {
            const ratingBadge = facilityCard.querySelector('.rating-badge');
            if (ratingBadge) {
                ratingBadge.textContent = `${average.toFixed(1)}/5`;
            }
        }
    }
}

// Load existing ratings on page load
document.addEventListener('DOMContentLoaded', function() {
    const ratings = JSON.parse(localStorage.getItem('facilityRatings') || '[]');
    const facilityCards = document.querySelectorAll('.facility-card');
    
    facilityCards.forEach(card => {
        const facilityId = card.dataset.facilityId;
        const facilityRatings = ratings.filter(r => r.facilityId === facilityId);
        
        facilityRatings.forEach(rating => {
            addRatingToUI(rating, card);
        });
    
        updateAverageRating(facilityId);
    });
});