import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA7M06mbTkOiSSixl6868q9aFprTQOsE3M",
  authDomain: "tripplanner-c57e7.firebaseapp.com",
  projectId: "tripplanner-c57e7",
  storageBucket: "tripplanner-c57e7.firebasestorage.app",
  messagingSenderId: "663308050425",
  appId: "1:663308050425:web:9d9de9fd9fffad56faa728",
  measurementId: "G-9MTZP25NQZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const formMessage = document.getElementById("formMessage");

function clearMessages() {
  emailError.textContent = "";
  passwordError.textContent = "";
  formMessage.textContent = "";
  formMessage.className = "form-message";

  emailInput.classList.remove("input-error", "input-success");
  passwordInput.classList.remove("input-error", "input-success");
}

function showFormError(message) {
  formMessage.textContent = message;
  formMessage.className = "form-message show error";
}

function showFormSuccess(message) {
  formMessage.textContent = message;
  formMessage.className = "form-message show success";
}

function validateFields(email, password) {
  let isValid = true;

  if (!email) {
    emailError.textContent = "Email is required";
    emailInput.classList.add("input-error");
    isValid = false;
  } else {
    emailInput.classList.add("input-success");
  }

  if (!password) {
    passwordError.textContent = "Password is required";
    passwordInput.classList.add("input-error");
    isValid = false;
  } else {
    passwordInput.classList.add("input-success");
  }

  return isValid;
}

function handleFirebaseError(error) {
  const code = error.code || "";

  if (
    code.includes("invalid-email") ||
    code.includes("missing-email")
  ) {
    emailError.textContent = "Please enter a valid email address";
    emailInput.classList.add("input-error");
    return;
  }

  if (
    code.includes("wrong-password") ||
    code.includes("invalid-credential")
  ) {
    passwordError.textContent = "Wrong password";
    passwordInput.classList.add("input-error");
    return;
  }

  if (code.includes("user-not-found")) {
    emailError.textContent = "No account found with this email";
    emailInput.classList.add("input-error");
    return;
  }

  if (code.includes("email-already-in-use")) {
    emailError.textContent = "This email is already registered";
    emailInput.classList.add("input-error");
    return;
  }

  if (code.includes("weak-password")) {
    passwordError.textContent = "Password must be at least 6 characters";
    passwordInput.classList.add("input-error");
    return;
  }

  showFormError(error.message.replace("Firebase: Error ", "").replace(/[()]/g, ""));
}

window.login = function () {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  clearMessages();

  if (!validateFields(email, password)) return;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      localStorage.setItem("loggedInUser", email);
      showFormSuccess("Login successful. Redirecting...");
      emailInput.classList.add("input-success");
      passwordInput.classList.add("input-success");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 800);
    })
    .catch((error) => {
      handleFirebaseError(error);
      console.log(error);
    });
};

window.signup = function () {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  clearMessages();

  if (!validateFields(email, password)) return;

  if (password.length < 6) {
    passwordError.textContent = "Password must be at least 6 characters";
    passwordInput.classList.add("input-error");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      localStorage.setItem("loggedInUser", email);
      showFormSuccess("Account created successfully. You can now login.");
      emailInput.classList.add("input-success");
      passwordInput.classList.add("input-success");
    })
    .catch((error) => {
      handleFirebaseError(error);
      console.log(error);
    });
};

window.logout = function () {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
};

emailInput.addEventListener("input", () => {
  emailError.textContent = "";
  emailInput.classList.remove("input-error");
});

passwordInput.addEventListener("input", () => {
  passwordError.textContent = "";
  passwordInput.classList.remove("input-error");
});