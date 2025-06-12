document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('ul.navbar');
  const highlight = navbar.querySelector('.highlight');
  const navLinks = navbar.querySelectorAll('li > a');
  const sections = document.querySelectorAll('section[id]');

  const extraHighlightPadding = 10;
  let currentActiveLink = null;

  function setHighlight(element) {
    if (!element || !navbar || !highlight) {
      highlight.style.opacity = '0';
      return;
    }

    const linkRect = element.getBoundingClientRect();
    const navbarRect = navbar.getBoundingClientRect();

    let left = linkRect.left - navbarRect.left;
    let width = linkRect.width;

    width += extraHighlightPadding * 2;
    left -= extraHighlightPadding;

    highlight.style.opacity = '1';
    highlight.style.left = `${left}px`;
    highlight.style.width = `${width}px`;
  }

  function setActive(linkElement) {
    if (linkElement === currentActiveLink) return;

    if (currentActiveLink) currentActiveLink.classList.remove('active');
    linkElement.classList.add('active');
    currentActiveLink = linkElement;
    setHighlight(linkElement);
  }

  // --- Fix: determine section in view on load ---
  function getInitialActiveSection() {
    const scrollPos = window.scrollY + window.innerHeight * 0.3;

    let bestMatch = null;
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const top = rect.top + window.scrollY;

      if (scrollPos >= top) {
        bestMatch = section;
      }
    });

    if (bestMatch) {
      const link = navbar.querySelector(`a[href="#${bestMatch.id}"]`);
      if (link) setActive(link);
    } else if (navLinks.length > 0) {
      setActive(navLinks[0]);
    }
  }

  navLinks.forEach(link => {
    link.addEventListener('mouseenter', (e) => {
      if (e.target !== currentActiveLink) setHighlight(e.target);
    });

    link.addEventListener('click', (e) => {
      setActive(e.target);
    });
  });

  navbar.addEventListener('mouseleave', () => {
    if (currentActiveLink) setHighlight(currentActiveLink);
    else if (navLinks.length > 0) setHighlight(navLinks[0]);
    else highlight.style.opacity = '0';
  });

  // --- Intersection Observer ---
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.6
  };

  const observer = new IntersectionObserver((entries) => {
    let visibleSection = null;

    entries.forEach(entry => {
      if (entry.isIntersecting) visibleSection = entry.target;
    });

    if (visibleSection) {
      const link = navbar.querySelector(`a[href="#${visibleSection.id}"]`);
      if (link) setActive(link);
    }
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  // Initial highlight on load
  window.setTimeout(() => {
    getInitialActiveSection();
  }, 100); // Delay allows layout to settle

  window.addEventListener('resize', () => {
    if (currentActiveLink) setHighlight(currentActiveLink);
    else highlight.style.opacity = '0';
  });
});
