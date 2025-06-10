// ======================================================
// !! जरूरी: अपनी फायरबेस कॉन्फ़िगरेशन यहाँ पेस्ट करें !!
// ======================================================
const firebaseConfig = {
  apiKey: "AIzaSyDSQm9bIcS3dM18PjPlmb1ziJ_BcxNe8iE",
  authDomain: "library0060.firebaseapp.com",
  projectId: "library0060",
  storageBucket: "library0060.firebasestorage.app",
  messagingSenderId: "575895945890",
  appId: "1:575895945890:web:8adeb76b5e645f36cd8dfb"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const errorMessage = document.getElementById('error-message');

// अगर यूजर पहले से लॉग इन है तो उसे डैशबोर्ड पर भेजें
auth.onAuthStateChanged(user => {
    if (user) {
        window.location.href = 'index.html';
    }
});

// Login Logic
loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log('User logged in:', userCredential.user);
            window.location.href = 'index.html';
        })
        .catch(error => {
            errorMessage.textContent = error.message;
        });
});

// Signup Logic
signupForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log('User signed up:', userCredential.user);
            alert('Account created successfully! Please login.');
            window.location.reload(); // Reload to switch to login form
        })
        .catch(error => {
            errorMessage.textContent = error.message;
        });
});