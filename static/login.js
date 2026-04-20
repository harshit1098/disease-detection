document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const userProfileBtn = document.getElementById('user-profile-btn');
    const userAvatar = document.getElementById('user-avatar');
    const profileDropdown = document.getElementById('profile-dropdown');
    const loginModal = document.getElementById('login-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const dropdownUserName = document.getElementById('dropdown-user-name');
    const logoutBtn = document.getElementById('logout-btn');

    // State initialization
    const initAuthState = () => {
        const isLoggedIn = localStorage.getItem('weCare_isLoggedIn') === 'true';
        const userName = localStorage.getItem('weCare_userName');

        if (isLoggedIn && userName) {
            setLoggedInUI(userName);
        } else {
            setLoggedOutUI();
        }
    };

    const setLoggedInUI = (name) => {
        userProfileBtn.classList.add('logged-in');
        
        let displayStr = name;
        if (name.length > 2 && name.toLowerCase() !== "dr") {
            // Get first initial
            displayStr = name.charAt(0).toUpperCase();
            userAvatar.classList.add('small-text');
        } else {
            userAvatar.classList.remove('small-text');
        }
        
        // Show full name if we want pill shape, but initial looks cleaner for standard avatars
        // The user said "Change 'Dr' icon text to user's name". 
        // Let's just put the full name and let the CSS handle pill shape.
        userAvatar.textContent = name;
        dropdownUserName.textContent = name;
    };

    const setLoggedOutUI = () => {
        userProfileBtn.classList.remove('logged-in');
        userAvatar.textContent = 'Dr';
        userAvatar.classList.remove('small-text');
    };

    // Toggle logic for profile click
    userProfileBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent closing immediately from document click
        const isLoggedIn = localStorage.getItem('weCare_isLoggedIn') === 'true';

        if (isLoggedIn) {
            // Toggle dropdown
            profileDropdown.classList.toggle('active');
        } else {
            // Open modal
            openModal();
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!userProfileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
            profileDropdown.classList.remove('active');
        }
    });

    // Modal logic
    const openModal = () => {
        loginModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // prevent scrolling
    };

    const closeModal = () => {
        loginModal.classList.remove('active');
        document.body.style.overflow = '';
        // Reset form
        loginForm.reset();
        clearErrors();
    };

    closeModalBtn.addEventListener('click', closeModal);

    // Close modal on click outside content
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            closeModal();
        }
    });

    // Form validation and submission
    const clearErrors = () => {
        emailInput.classList.remove('error');
        passwordInput.classList.remove('error');
        emailError.style.display = 'none';
        passwordError.style.display = 'none';
    };

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();

        let isValid = true;
        
        // Simple validation
        if (!emailInput.value.trim()) {
            emailInput.classList.add('error');
            emailError.style.display = 'block';
            isValid = false;
        }

        if (!passwordInput.value.trim()) {
            passwordInput.classList.add('error');
            passwordError.style.display = 'block';
            isValid = false;
        }

        if (isValid) {
            // Extract name from email (before @) or default
            let extractedName = emailInput.value.split('@')[0];
            // Capitalize first letter
            extractedName = extractedName.charAt(0).toUpperCase() + extractedName.slice(1);
            
            const nameToSave = extractedName || "User";

            localStorage.setItem('weCare_isLoggedIn', 'true');
            localStorage.setItem('weCare_userName', nameToSave);
            
            setLoggedInUI(nameToSave);
            closeModal();
        }
    });

    // Handle Google Login Button click
    document.querySelector('.google-btn').addEventListener('click', (e) => {
        e.preventDefault();
        
        const defaultName = 'Harshit';
        localStorage.setItem('weCare_isLoggedIn', 'true');
        localStorage.setItem('weCare_userName', defaultName);
        
        setLoggedInUI(defaultName);
        closeModal();
    });

    // Logout logic
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('weCare_isLoggedIn');
        localStorage.removeItem('weCare_userName');
        setLoggedOutUI();
        profileDropdown.classList.remove('active');
    });

    // Initialize
    initAuthState();
});
