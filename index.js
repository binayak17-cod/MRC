document.addEventListener('DOMContentLoaded', () => {
  const featureElements = document.querySelectorAll('.feature');

  featureElements.forEach(feature => {
    // Enable click navigation for entire feature card
    feature.addEventListener('click', () => {
      const url = feature.getAttribute('data-link');
      if (url) {
        window.location.href = url;
      }
    });

    // Accessibility support for keyboard
    feature.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        feature.click();
      }
    });

    // Ensure tab focusable
    feature.setAttribute('tabindex', '0');
    feature.style.cursor = 'pointer';
  });

  // Logout functionality if needed (optional)
  const logoutLink = document.querySelector('.nav-link.logout');
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      // Optional: clear sessionStorage or localStorage
      // sessionStorage.clear();
      // Redirect to login page or logout route
      // e.preventDefault();
      // window.location.href = '/logout';
    });
  }
});
