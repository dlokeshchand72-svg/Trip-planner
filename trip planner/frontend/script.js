let selectedInterests = [];

const chips = document.querySelectorAll(".chip");
const selectedInterestsText = document.getElementById("selectedInterestsText");

const destinationInput = document.getElementById("destination");
const daysInput = document.getElementById("days");
const travelersInput = document.getElementById("travelers");
const budgetInput = document.getElementById("budget");

const destinationError = document.getElementById("destinationError");
const daysError = document.getElementById("daysError");
const travelersError = document.getElementById("travelersError");
const budgetError = document.getElementById("budgetError");
const interestsError = document.getElementById("interestsError");
const tripFormMessage = document.getElementById("tripFormMessage");

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const value = chip.getAttribute("data-value");

    if (selectedInterests.includes(value)) {
      selectedInterests = selectedInterests.filter((item) => item !== value);
      chip.classList.remove("active");
    } else {
      selectedInterests.push(value);
      chip.classList.add("active");
    }

    selectedInterestsText.innerText =
      selectedInterests.length > 0 ? selectedInterests.join(", ") : "None";

    if (selectedInterests.length > 0) {
      interestsError.textContent = "";
    }
  });
});

function clearTripValidation() {
  destinationError.textContent = "";
  daysError.textContent = "";
  travelersError.textContent = "";
  budgetError.textContent = "";
  interestsError.textContent = "";

  tripFormMessage.textContent = "";
  tripFormMessage.className = "form-message";

  destinationInput.classList.remove("input-error", "input-success");
  daysInput.classList.remove("input-error", "input-success");
  travelersInput.classList.remove("input-error", "input-success");
  budgetInput.classList.remove("input-error", "input-success");
}

function showTripFormError(message) {
  tripFormMessage.textContent = message;
  tripFormMessage.className = "form-message show error";
}

function cityLooksValid(city) {
  const cityRegex = /^[A-Za-z\s.-]{2,50}$/;
  return cityRegex.test(city);
}

function validateTripForm() {
  clearTripValidation();

  const destination = destinationInput.value.trim();
  const days = Number(daysInput.value.trim());
  const travelers = Number(travelersInput.value.trim());
  const budget = Number(budgetInput.value.trim());

  let isValid = true;

  if (!destination) {
    destinationError.textContent = "This field is compulsory";
    destinationInput.classList.add("input-error");
    isValid = false;
  } else if (!cityLooksValid(destination)) {
    destinationError.textContent = "Enter a valid city";
    destinationInput.classList.add("input-error");
    isValid = false;
  } else {
    destinationInput.classList.add("input-success");
  }

  if (!daysInput.value.trim()) {
    daysError.textContent = "This field is compulsory";
    daysInput.classList.add("input-error");
    isValid = false;
  } else if (isNaN(days) || days < 1 || days > 30) {
    daysError.textContent = "Trip days must be between 1 and 30";
    daysInput.classList.add("input-error");
    isValid = false;
  } else {
    daysInput.classList.add("input-success");
  }

  if (!travelersInput.value.trim()) {
    travelersError.textContent = "This field is compulsory";
    travelersInput.classList.add("input-error");
    isValid = false;
  } else if (isNaN(travelers) || travelers < 1 || travelers > 20) {
    travelersError.textContent = "Travelers must be between 1 and 20";
    travelersInput.classList.add("input-error");
    isValid = false;
  } else {
    travelersInput.classList.add("input-success");
  }

  if (!budgetInput.value.trim()) {
    budgetError.textContent = "This field is compulsory";
    budgetInput.classList.add("input-error");
    isValid = false;
  } else if (isNaN(budget) || budget <= 0) {
    budgetError.textContent = "Enter a valid budget";
    budgetInput.classList.add("input-error");
    isValid = false;
  } else {
    budgetInput.classList.add("input-success");
  }

  if (selectedInterests.length === 0) {
    interestsError.textContent = "Select at least one interest";
    isValid = false;
  }

  if (!isValid) {
    showTripFormError("Please correct the highlighted fields.");
  }

  return isValid;
}

async function generateTrip() {
  const loadingBox = document.getElementById("loadingBox");
  const statusBadge = document.getElementById("statusBadge");
  const tripSummary = document.getElementById("tripSummary");
  const resultCards = document.getElementById("resultCards");

  if (!validateTripForm()) return;

  const destination = destinationInput.value.trim();
  const days = daysInput.value.trim();
  const travelers = travelersInput.value.trim();
  const budget = budgetInput.value.trim();

  tripSummary.classList.add("hidden");
  tripSummary.innerHTML = "";
  resultCards.innerHTML = "";

  loadingBox.classList.remove("hidden");
  statusBadge.innerText = "Generating...";
  statusBadge.style.background = "#fff4e5";
  statusBadge.style.color = "#b26a00";

  try {
    const response = await fetch("http://localhost:5000/generate-trip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        destination,
        days,
        travelers,
        budget,
        interests: selectedInterests
      })
    });

    const data = await response.json();
    loadingBox.classList.add("hidden");

    if (data.success) {
      renderTripPlan(data.plan);
      saveTripToHistory(destination, days, budget, selectedInterests, data.plan);
      loadTripHistory();

      tripFormMessage.textContent = "Trip generated successfully.";
      tripFormMessage.className = "form-message show success";

      statusBadge.innerText = "Completed";
      statusBadge.style.background = "#e6f4ea";
      statusBadge.style.color = "#137333";
    } else {
      resultCards.innerHTML = `<div class="day-card"><p>${data.error || "Could not generate trip"}</p></div>`;
      statusBadge.innerText = "Failed";
      statusBadge.style.background = "#fdecea";
      statusBadge.style.color = "#b3261e";
    }
  } catch (error) {
    console.error(error);
    loadingBox.classList.add("hidden");
    resultCards.innerHTML = `<div class="day-card"><p>Server connection error</p></div>`;
    statusBadge.innerText = "Error";
    statusBadge.style.background = "#fdecea";
    statusBadge.style.color = "#b3261e";
  }
}

function renderTripPlan(plan) {
  const tripSummary = document.getElementById("tripSummary");
  const resultCards = document.getElementById("resultCards");

  tripSummary.classList.remove("hidden");
  tripSummary.innerHTML = `
    <h3>Trip Summary</h3>
    <p><strong>Overview:</strong> ${plan.summary || "No summary available"}</p>
    <p><strong>Total Estimated Cost:</strong> ${plan.totalEstimatedCost || "Not available"}</p>
  `;

  resultCards.innerHTML = "";

  if (plan.days && plan.days.length > 0) {
    plan.days.forEach((dayObj) => {
      const card = document.createElement("div");
      card.className = "day-card";

      card.innerHTML = `
        <h3>Day ${dayObj.day}: ${dayObj.title}</h3>
        <p><strong>Places:</strong> ${(dayObj.places || []).join(", ")}</p>
        <p><strong>Food:</strong> ${(dayObj.food || []).join(", ")}</p>
        <p><strong>Transport:</strong> ${dayObj.transport || "N/A"}</p>
        <p><strong>Estimated Cost:</strong> ${dayObj.estimatedCost || "N/A"}</p>
        <p><strong>Tips:</strong> ${dayObj.tips || "N/A"}</p>
      `;

      resultCards.appendChild(card);
    });
  } else {
    resultCards.innerHTML = `<div class="day-card"><p>No day-wise plan available.</p></div>`;
  }
}

function getCurrentUserKey() {
  const userEmail = localStorage.getItem("loggedInUser");
  return userEmail ? `tripHistory_${userEmail}` : "tripHistory_guest";
}

function saveTripToHistory(destination, days, budget, interests, plan) {
  const historyKey = getCurrentUserKey();
  const existingHistory = JSON.parse(localStorage.getItem(historyKey)) || [];

  const newTrip = {
    destination,
    days,
    budget,
    interests,
    summary: plan.summary || "",
    totalEstimatedCost: plan.totalEstimatedCost || "",
    createdAt: new Date().toLocaleString()
  };

  existingHistory.unshift(newTrip);
  localStorage.setItem(historyKey, JSON.stringify(existingHistory.slice(0, 10)));
}

function loadTripHistory() {
  const historyKey = getCurrentUserKey();
  const historyList = document.getElementById("historyList");
  const history = JSON.parse(localStorage.getItem(historyKey)) || [];

  if (history.length === 0) {
    historyList.innerHTML = "No trip history yet.";
    return;
  }

  historyList.innerHTML = history
    .map(
      (trip) => `
      <div class="history-item">
        <h4>${trip.destination}</h4>
        <p><strong>Days:</strong> ${trip.days}</p>
        <p><strong>Budget:</strong> ₹${trip.budget}</p>
        <p><strong>Interests:</strong> ${trip.interests.join(", ")}</p>
        <p><strong>Summary:</strong> ${trip.summary}</p>
        <p><strong>Saved On:</strong> ${trip.createdAt}</p>
      </div>
    `
    )
    .join("");
}

function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}

[destinationInput, daysInput, travelersInput, budgetInput].forEach((input) => {
  input.addEventListener("input", () => {
    input.classList.remove("input-error");
  });
});

destinationInput.addEventListener("input", () => {
  destinationError.textContent = "";
});

daysInput.addEventListener("input", () => {
  daysError.textContent = "";
});

travelersInput.addEventListener("input", () => {
  travelersError.textContent = "";
});

budgetInput.addEventListener("input", () => {
  budgetError.textContent = "";
});

window.onload = function () {
  loadTripHistory();
};