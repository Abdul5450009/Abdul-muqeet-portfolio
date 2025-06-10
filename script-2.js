document.addEventListener('DOMContentLoaded', () => {
  // Select the navbar UL element
  const navbar = document.querySelector('ul.navbar');
  // Select the highlight span directly within the ul.navbar
  const highlight = navbar.querySelector('.highlight');
  // Select all 'a' tags directly inside 'li' elements which are direct children of the navbar ul
  const navLinks = navbar.querySelectorAll('li > a');
  // Select all sections that have an ID attribute. This is crucial for scroll detection.
  const sections = document.querySelectorAll('span[id]');

  const extraHighlightPadding = 10; // Adjust this value (in pixels) as desired.
                                  // This adds extra width (and centers it) for the highlight.

  let currentActiveLink = null; // To keep track of the currently active link element

  // Function to set the highlight's position and width
  function setHighlight(element) {
    if (!element || !navbar || !highlight) {
      highlight.style.opacity = '0'; // Hide highlight if element or necessary components are not found
      return;
    }

    const linkRect = element.getBoundingClientRect();
    const navbarRect = navbar.getBoundingClientRect(); // Get position of the UL

    // Calculate the left position relative to the UL.navbar
    // The link's left position minus the navbar's left position
    let left = linkRect.left - navbarRect.left;
    let width = linkRect.width;

    // Increase the highlight width
    width += (extraHighlightPadding * 2);

    // Adjust the left position to keep the highlight centered relative to the link
    left -= extraHighlightPadding;

    highlight.style.opacity = '1';
    highlight.style.left = `${left}px`;
    highlight.style.width = `${width}px`;
  }

  // Function to set the active link and move the highlight
  function setActive(linkElement) {
    // If this link is already active, do nothing
    if (linkElement === currentActiveLink) {
      return;
    }

    // Remove 'active' class from previously active link, if any
    if (currentActiveLink) {
      currentActiveLink.classList.remove('active');
    }

    // Add 'active' class to the new active link
    linkElement.classList.add('active');
    currentActiveLink = linkElement;

    // Move the highlight to the newly active link
    setHighlight(linkElement);
  }

  // --- Initial Setup (Highlight on page load based on URL hash or first link) ---
  let initialActiveFound = false;
  if (window.location.hash) {
    // Try to find a nav link matching the current URL hash
    const hashLink = navbar.querySelector(`li > a[href="${window.location.hash}"]`);
    if (hashLink) {
      setActive(hashLink);
      initialActiveFound = true;
    }
  }

  // If no hash or no matching link for hash, set the first link as active
  if (!initialActiveFound && navLinks.length > 0) {
    setActive(navLinks[0]);
  } else if (navLinks.length === 0) {
    // If there are no nav links, ensure highlight is hidden
    setHighlight(null);
  }


  // --- Event Listeners for Hover and Click ---

  navLinks.forEach(link => {
    // Handle mouseenter for temporary hover highlight
    link.addEventListener('mouseenter', (e) => {
      // Only move highlight on hover if it's not the currently active link
      // This ensures the active highlight isn't temporarily overridden unless desired
      if (e.target !== currentActiveLink) {
        setHighlight(e.target);
      }
    });

    // Handle click to set the active link permanently
    link.addEventListener('click', (e) => {
      // Prevent default hash jump if you want to control scrolling manually
      // e.preventDefault();

      setActive(e.target);

      // You can add manual smooth scroll here if you prevented default behavior:
      // const targetId = e.target.getAttribute('href').substring(1);
      // const targetSection = document.getElementById(targetId);
      // if (targetSection) {
      //   targetSection.scrollIntoView({ behavior: 'smooth' });
      // }
    });
  });

  // When mouse leaves the entire navbar, return the highlight to the active link
  navbar.addEventListener('mouseleave', () => {
    if (currentActiveLink) {
      setHighlight(currentActiveLink); // Return to the actively selected link
    } else if (navLinks.length > 0) {
      // Fallback: If no active link is set, return to the first one
      setHighlight(navLinks[0]);
    } else {
      // If no links at all, hide highlight
      highlight.style.opacity = '0';
    }
  });


  // --- Intersection Observer for Scroll Detection (The "Detect System") ---

  // Options for the Intersection Observer
  const observerOptions = {
    root: null, // The viewport is the root element
    rootMargin: '0px', // No margin around the root
    // The threshold determines when the callback is executed.
    // 0.7 means when 70% of the target element is visible in the viewport.
    // Adjust this value (0.1 to 1.0) based on how much of a section needs to be visible
    // before it's considered "active".
    threshold: 0.7
  };

  // Create a new Intersection Observer instance
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // This section is currently in the viewport (or meets the threshold)
        const sectionId = entry.target.id;
        const correspondingNavLink = navbar.querySelector(`li > a[href="#${sectionId}"]`);

        if (correspondingNavLink) {
          setActive(correspondingNavLink); // Set this link as active
        }
      }
    });
  }, observerOptions);

  // Observe each section that has an ID
  sections.forEach(section => {
    observer.observe(section);
  });


  // --- Window Resize Handling (for responsiveness) ---

  // Re-adjust highlight position and width when the window is resized
  window.addEventListener('resize', () => {
    if (currentActiveLink) {
      setHighlight(currentActiveLink); // Re-apply highlight to the active link
    } else if (navLinks.length > 0) {
      setHighlight(navLinks[0]); // Fallback to first link if no active
    } else {
      highlight.style.opacity = '0'; // Hide highlight if no links
    }
  });
});