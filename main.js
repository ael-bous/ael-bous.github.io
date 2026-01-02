// Toggle menu
const menuIcon = document.querySelector("#menu-icon");
const navbar = document.querySelector(".navbar");
menuIcon.onclick = () => {
  menuIcon.classList.toggle("bx-x");
  navbar.classList.toggle("active");
};

// Scroll sections active link
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("header nav a");
window.onscroll = () => {
  sections.forEach((sec) => {
    let top = window.scrollY;
    let offset = sec.offsetTop - 150;
    let height = sec.offsetHeight;
    let id = sec.getAttribute("id");
    if (top >= offset && top < offset + height) {
      navLinks.forEach((links) => {
        links.classList.remove("active");
        document
          .querySelector("header nav a[href*=" + id + "]")
          .classList.add("active");
      });
    }
  });
  // Sticky header
  const header = document.querySelector(".header");
  header.classList.toggle("sticky", window.scrollY > 100);
  // Remove menu when clicking on navbar link
  menuIcon.classList.remove("bx-x");
  navbar.classList.remove("active");
};

// Project Modal Functionality
const projectBoxes = document.querySelectorAll(".project-box");
const modals = document.querySelectorAll(".project-modal");
const closeButtons = document.querySelectorAll(".close-modal");

// Open modal when project is clicked
projectBoxes.forEach((box) => {
  box.addEventListener("click", () => {
    // ADD THIS LINE to prevent default behavior
    event.preventDefault();
    
    const projectId = box.getAttribute("data-project");
    const modal = document.getElementById(`project-modal-${projectId}`);
    if (modal) {
      modal.style.display = "block";
      document.body.style.overflow = "hidden";
    }
  });
});

// Close modal when X is clicked
closeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const modal = button.closest(".project-modal");
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  });
});

// Close modal when clicking outside the modal content
window.addEventListener("click", (event) => {
  modals.forEach((modal) => {
    if (event.target === modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });
});

// Close modal with Escape key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    modals.forEach((modal) => {
      if (modal.style.display === "block") {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
      }
    });
  }
});

// Formspree handling
document.getElementById('contact-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formMessage = document.getElementById('form-message');
  const submitBtn = this.querySelector('input[type="submit"]');
  const formData = new FormData(this);
  
  // Show loading state
  formMessage.style.display = 'block';
  formMessage.textContent = 'Sending message...';
  formMessage.className = 'form-message';
  submitBtn.value = 'Sending...';
  submitBtn.disabled = true;
  
  try {
    const response = await fetch(this.action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      formMessage.textContent = '✅ Message sent successfully! I will reply within 24 hours.';
      formMessage.className = 'form-message success';
      this.reset();
    } else {
      throw new Error('Form submission failed');
    }
  } catch (error) {
    formMessage.textContent = '❌ Failed to send. Please email me directly at elbousairiayoub@gmail.com';
    formMessage.className = 'form-message error';
  } finally {
    submitBtn.value = 'Send Message';
    submitBtn.disabled = false;
  }
});