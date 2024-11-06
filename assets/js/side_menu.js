// Get the menu and content elements
const menuToggle = document.getElementById('menu-toggle');
const sideMenu = document.getElementById('side-menu');

// Initialize the flag to track the menu's state
let isOpen = false;

// Open the side menu
menuToggle.addEventListener('click', function() {
    if (isOpen) {
        sideMenu.classList.remove('open');
        isOpen = false;
    }

    else {
        sideMenu.classList.add('open');
        isOpen = true;
    }
});

document.addEventListener('click', function(event) {
    // Close side menu if clicking outside the toggle button and side menu
    if (!menuToggle.contains(event.target) && !sideMenu.contains(event.target)) {
        sideMenu.classList.remove('open');
    }
});
