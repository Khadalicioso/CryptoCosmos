// Select DOM elements for displaying cryptocurrency data
const coinsCount = document.getElementById("coins-count");
const exchangesCount = document.getElementById("exchanges-count");
const marketCap = document.getElementById("marketCap");
const marketCapChangeElement = document.getElementById("marketCapChange");
const volume = document.getElementById("volume");
const dominance = document.getElementById("dominance");

// Event listener for when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Select theme toggle button and body element
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  // Retrieve and apply saved theme from local storage
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    body.id = savedTheme;
    updateIcon(savedTheme);
  }

  // Event listener for theme toggle button
  themeToggle.addEventListener("click", () => {
    // Toggle between light and dark themes
    if (body.id === "light-theme") {
      body.id = "dark-theme";
      localStorage.setItem("theme", "dark-theme");
      updateIcon("dark-theme");
    } else {
      body.id = "light-theme";
      localStorage.setItem("theme", "light-theme");
      updateIcon("light-theme");
    }

    // Reinitialize widget if applicable
    if (typeof initializeWidget === "function") {
      initializeWidget();
    }
  });

  // Function to update the icon based on the current theme
  function updateIcon(currentTheme) {
    if (currentTheme === "light-theme") {
      themeToggle.classList.remove("ri-moon-line");
      themeToggle.classList.add("ri-sun-line");
    } else {
      themeToggle.classList.remove("ri-sun-line");
      themeToggle.classList.add("ri-moon-line");
    }
  }

  // Event listener for search form submission
  const form = document.getElementById("searchForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent default form submission

    const query = document.getElementById("searchInput").value.trim();
    if (!query) return; // Exit if the search query is empty

    // Redirect to search results page with the query
    window.location.href = `/../../pages/search.html?query=${query}`;
  });

  // Event listeners for menu open/close functionality
  const openMenuBtn = document.getElementById("openMenu");
  const overlay = document.querySelector(".overlay");
  const closeMenuBtn = document.getElementById("closeMenu");

  openMenuBtn.addEventListener("click", () => {
    overlay.classList.add("show"); // Show the overlay when menu is opened
  });

  closeMenuBtn.addEventListener("click", () => {
    overlay.classList.remove("show"); // Hide the overlay when menu is closed
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.remove("show"); // Hide overlay when clicking outside the menu
    }
  });

  // Fetch global cryptocurrency data
  fetchGlobal();
});

// Function to retrieve data from local storage
function getLocalStorageData(key) {
  const storedData = localStorage.getItem(key);
  if (!storedData) return null; // Return null if no data is found

  const parsedData = JSON.parse(storedData);
  const currentTime = Date.now();
  // Check if the stored data is older than 5 minutes
  if (currentTime - parsedData.timestamp > 300000) {
    localStorage.removeItem(key); // Remove stale data
    return null;
  }
  return parsedData.data; // Return the stored data
}

// Function to set data in local storage with a timestamp
function setLocalStorageData(key, data) {
  const storedData = {
    timestamp: Date.now(), // Store the current timestamp
    data: data,
  };
  localStorage.setItem(key, JSON.stringify(storedData)); // Save to local storage
}

// Function to fetch global cryptocurrency data from the API
function fetchGlobal() {
  const localStorageKey = "Global_Data";
  const localData = getLocalStorageData(localStorageKey);

  if (localData) {
    displayGlobalData(localData); // Display data if available in local storage
  } else {
    const options = { method: "GET", headers: { accept: "application/json" } };

    // Fetch data from the CoinGecko API
    fetch("https://api.coingecko.com/api/v3/global", options)
      .then((response) => response.json())
      .then((data) => {
        const globalData = data.data;
        displayGlobalData(data); // Display fetched data
        setLocalStorageData(localStorageKey, globalData); // Store fetched data
      })
      .catch((error) => {
        // Handle errors by displaying "N/A" for all data fields
        coinsCount.textContent = "N/A";
        exchangesCount.textContent = "N/A";
        marketCap.textContent = "N/A";
        marketCapChangeElement.textContent = "N/A";
        volume.textContent = "N/A";
        dominance.textContent = "BTC N/A% - ETH N/A%";
        console.error(error); // Log the error to the console
      });
  }
}

// Function to display global cryptocurrency data on the page
function displayGlobalData(globalData) {
  coinsCount.textContent = globalData.active_cryptocurrencies || "N/A";
  exchangesCount.textContent = globalData.markets || "N/A";

  marketCap.textContent = globalData.total_market_cap?.usd
    ? `$${(globalData.total_market_cap.usd / 1e12).toFixed(3)}T`
    : "N/A";
  const marketCapChange = globalData.market_cap_change_percentage_24h_usd;

  if (marketCapChange !== undefined) {
    const changeText = `${marketCapChange.toFixed(1)}%`;
    marketCapChangeElement.innerHTML = `${changeText} <i class="${
      marketCapChange < 0 ? "red" : "green"
    } ri-arrow-${marketCapChange < 0 ? "down" : "up"}-s-fill"></i>`;
    marketCapChangeElement.style.color = marketCapChange < 0 ? "red" : "green";
  } else {
    marketCapChangeElement.textContent = "N/A";
  }

  volume.textContent = globalData.total_volume?.usd
    ? `$${(globalData.total_volume.usd / 1e9).toFixed(3)}B`
    : "N/A";

  const btcDominance = globalData.market_cap_percentage?.btc
    ? `${globalData.market_cap_percentage.btc.toFixed(1)}%`
    : "N/A";
  const ethDominance = globalData.market_cap_percentage?.eth
    ? `${globalData.market_cap_percentage.eth.toFixed(1)}%`
    : "N/A";
  dominance.textContent = `BTC ${btcDominance} - ETH ${ethDominance}`;
}

// Function to toggle the visibility of a spinner and a list
function toggleSpinner(listId, spinnerId, show) {
  const listElement = document.getElementById(listId);
  const spinnerElement = document.getElementById(spinnerId);

  if (spinnerElement) {
    spinnerElement.style.display = show ? "block" : "none"; // Show or hide spinner
  }
  if (listElement) {
    listElement.style.display = show ? "none" : "block"; // Show or hide list
  }
}

// Function to create a table with specified headers
function createTable(headers, fixedIndex = 0) {
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  table.appendChild(thead);

  const headerRow = document.createElement("tr");
  headers.forEach((header, index) => {
    const th = document.createElement("th");
    th.textContent = header;
    if (index === fixedIndex) {
      th.classList.add("table-fixed-column"); // Add class for fixed column
    }
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  return table; // Return the created table
}

// Function to create a widget in a specified container
function createWidget(containerId, widgetConfig, widgetSrc) {
  const container = document.getElementById(containerId);

  container.innerHTML = ""; // Clear existing content in the container

  const widgetDiv = document.createElement("div");
  widgetDiv.classList.add("tradingview-widget-container__widget");
  container.appendChild(widgetDiv);

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = widgetSrc; // Set the source for the widget script
  script.async = true;
  script.innerHTML = JSON.stringify(widgetConfig); // Set widget configuration
  container.appendChild(script);

  // Show copyright after a delay
  setTimeout(() => {
    const copyright = document.querySelector(".tradingview-widget-copyright");
    if (copyright) {
      copyright.classList.remove("hidden");
    }
  }, 5000);
}

// Scroll to top button functionality
const scrollTopBtn = document.getElementById("scrollTop");
window.onscroll = () => {
  scrollFunction(); // Call scroll function on scroll event
};

// Function to control the visibility of the scroll to top button
function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    scrollTopBtn.style.display = "flex"; // Show button if scrolled down
  } else {
    scrollTopBtn.style.display = "none"; // Hide button if at the top
  }
}

// Function to scroll the page to the top
function scrollToTop() {
  // For Safari
  document.body.scrollTop = 0;
  // Chrome, Firefox, IE and Opera
  document.documentElement.scrollTop = 0;
}
