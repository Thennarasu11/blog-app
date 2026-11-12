// ===== App.js - Shared JavaScript =====

// Mobile Navigation Toggle
function initMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('show');
      hamburger.classList.toggle('active');
    });

    // Close menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('show');
        hamburger.classList.remove('active');
      });
    });
  }
}

// Toast Notification System
function showToast(message, type = 'success') {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto dismiss
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Form Validation Utilities
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

function showFieldError(input, message) {
  clearFieldError(input);
  input.style.borderColor = '#d63031';
  const error = document.createElement('small');
  error.className = 'field-error';
  error.style.color = '#d63031';
  error.style.fontSize = '0.8rem';
  error.style.marginTop = '4px';
  error.style.display = 'block';
  error.textContent = message;
  input.parentElement.appendChild(error);
}

function clearFieldError(input) {
  input.style.borderColor = '';
  const error = input.parentElement.querySelector('.field-error');
  if (error) error.remove();
}

// Local Storage Helpers (simulating backend)
const DB = {
  getUsers() {
    return JSON.parse(localStorage.getItem('blog_users') || '[]');
  },

  saveUser(user) {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem('blog_users', JSON.stringify(users));
  },

  findUser(email) {
    return this.getUsers().find(u => u.email === email);
  },

  setCurrentUser(user) {
    localStorage.setItem('blog_current_user', JSON.stringify(user));
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('blog_current_user') || 'null');
  },

  logout() {
    localStorage.removeItem('blog_current_user');
  },

  getPosts() {
    return JSON.parse(localStorage.getItem('blog_posts') || '[]');
  },

  savePost(post) {
    const posts = this.getPosts();
    post.id = Date.now();
    post.createdAt = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
    posts.unshift(post);
    localStorage.setItem('blog_posts', JSON.stringify(posts));
    return post;
  },

  deletePost(id) {
    const posts = this.getPosts().filter(p => p.id !== id);
    localStorage.setItem('blog_posts', JSON.stringify(posts));
  },

  getUserPosts(email) {
    return this.getPosts().filter(p => p.authorEmail === email);
  }
};

// Seed demo data if empty
function seedDemoData() {
  if (DB.getPosts().length === 0) {
    const demoPosts = [
      {
        id: 1,
        title: 'Getting Started with HTML5',
        content: 'HTML5 is the latest version of Hypertext Markup Language, the code that describes web pages. It introduces new elements, attributes, and behaviors that allow for more diverse and powerful websites.',
        category: 'Technology',
        tags: ['HTML', 'Web Dev', 'Beginner'],
        author: 'John Doe',
        authorEmail: 'demo@blog.com',
        status: 'published',
        createdAt: 'Nov 10, 2026'
      },
      {
        id: 2,
        title: 'CSS Flexbox: A Complete Guide',
        content: 'Flexbox is a one-dimensional layout method for laying out items in rows or columns. Items flex to fill additional space and shrink to fit into smaller spaces. This guide covers everything you need to know.',
        category: 'Design',
        tags: ['CSS', 'Flexbox', 'Layout'],
        author: 'Jane Smith',
        authorEmail: 'demo@blog.com',
        status: 'published',
        createdAt: 'Nov 9, 2026'
      },
      {
        id: 3,
        title: 'JavaScript ES6 Features',
        content: 'ES6, also known as ECMAScript 2015, introduced many changes to JavaScript. Let us explore some of the most important features including arrow functions, template literals, destructuring, and more.',
        category: 'Technology',
        tags: ['JavaScript', 'ES6', 'Programming'],
        author: 'Alex Chen',
        authorEmail: 'demo@blog.com',
        status: 'draft',
        createdAt: 'Nov 8, 2026'
      },
      {
        id: 4,
        title: 'Responsive Web Design Principles',
        content: 'Responsive web design is about creating web pages that look good on all devices. It uses CSS and HTML to resize, hide, shrink, enlarge, or move the content to make it look great on any screen.',
        category: 'Design',
        tags: ['Responsive', 'Mobile', 'CSS'],
        author: 'Sara Kim',
        authorEmail: 'demo@blog.com',
        status: 'published',
        createdAt: 'Nov 7, 2026'
      },
      {
        id: 5,
        title: 'Building Your First Web Application',
        content: 'In this tutorial, we will walk through building a complete web application from scratch. We will cover project setup, creating the frontend, and adding interactivity with JavaScript.',
        category: 'Tutorial',
        tags: ['Web App', 'Full Stack', 'Project'],
        author: 'Mike Wilson',
        authorEmail: 'demo@blog.com',
        status: 'published',
        createdAt: 'Nov 6, 2026'
      },
      {
        id: 6,
        title: 'Understanding Git Version Control',
        content: 'Git is a distributed version control system that tracks changes in any set of computer files. It is designed for coordinating work among programmers, but it can be used to track changes in any set of files.',
        category: 'Technology',
        tags: ['Git', 'Version Control', 'DevOps'],
        author: 'Lisa Park',
        authorEmail: 'demo@blog.com',
        status: 'draft',
        createdAt: 'Nov 5, 2026'
      }
    ];
    localStorage.setItem('blog_posts', JSON.stringify(demoPosts));
  }
}

// Update navbar based on auth state
function updateNavAuth() {
  const authContainer = document.querySelector('.nav-auth');
  if (!authContainer) return;

  const user = DB.getCurrentUser();
  if (user) {
    authContainer.innerHTML = `
      <span style="color: var(--gray); font-weight: 500;">Hi, ${user.name.split(' ')[0]}</span>
      <a href="dashboard.html" class="btn btn-sm btn-primary">Dashboard</a>
      <button class="btn btn-sm btn-secondary" onclick="handleLogout()">Logout</button>
    `;
  } else {
    authContainer.innerHTML = `
      <a href="login.html" class="btn btn-sm btn-secondary">Log In</a>
      <a href="register.html" class="btn btn-sm btn-primary">Sign Up</a>
    `;
  }
}

function handleLogout() {
  DB.logout();
  showToast('Logged out successfully!', 'info');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1000);
}

// Initialize common features
document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  seedDemoData();
  updateNavAuth();
});
