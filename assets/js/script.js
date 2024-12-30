// Object to track the loading state of each tab
const tabDataLoaded = {
  tab1: false,
  tab2: false,
  tab3: false,
  tab4: false,
};

// Function to open a specific tab and load its content
function openTab(event, tabName) {
  const tabContent = document.querySelectorAll(".tab-content"); // Get all tab content elements
  const tabButtons = document.querySelectorAll(".tab-button"); // Get all tab button elements

  // Hide all tab content and remove active class from buttons
  tabContent.forEach((content) => (content.style.display = "none"));
  tabButtons.forEach((button) => button.classList.remove("active"));

  // Show the selected tab content and set the active button
  document.getElementById(tabName).style.display = "block";
  event.currentTarget.classList.add("active");

  // Load data for the tab if it hasn't been loaded yet
  if (!tabDataLoaded[tabName]) {
    switch (tabName) {
      case "tab1":
        fetchAndDisplay(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true",
          ["asset-list"],
          displayAssets,
          tabName,
          "Crypto_Data"
        );
        break;
      case "tab2":
        fetchAndDisplay(
          "https://api.coingecko.com/api/v3/exchanges",
          ["exchange-list"],
          displayExchanges,
          tabName,
          "Exchanges_Data"
        );
        break;
      case "tab3":
        fetchAndDisplay(
          "https://api.coingecko.com/api/v3/coins/categories",
          ["category-list"],
          displayCategories,
          tabName,
          "Categories_Data"
        );
        break;
      case "tab4":
        fetchAndDisplay(
          "https://api.coingecko.com/api/v3/companies/public_treasury/bitcoin",
          ["company-list"],
          displayCompanies,
          tabName,
          "Companies_Data"
        );
        break;
    }
  }
}

// Event listener for when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".tab-button").click(); // Simulate a click on the first tab button
  fetchData(); // Fetch initial data for trending coins and assets
});

// Function to fetch initial data for trending coins and assets
async function fetchData() {
  await Promise.all([
    fetchAndDisplay(
      "https://api.coingecko.com/api/v3/search/trending",
      ["coins-list", "nfts-list"],
      displayTrends,
      null,
      "Trending_data"
    ),
    fetchAndDisplay(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true",
      ["asset-list"],
      displayAssets,
      null,
      "Crypto_Data"
    ),
  ]);
}

// Function to fetch data from the API and display it
async function fetchAndDisplay(
  url,
  idsToToggle,
  displayFunction,
  tabName = null,
  localKey
) {
  // Hide error messages and show loading spinners
  idsToToggle.forEach((id) => {
    const errorElement = document.getElementById(`${id}-error`);
    if (errorElement) {
      errorElement.style.display = "none"; // Hide error message
    }
    toggleSpinner(id, `${id}-spinner`, true); // Show spinner
  });

  const localStorageKey = localKey; // Key for local storage
  const localData = getLocalStorageData(localStorageKey); // Retrieve data from local storage

  // If local data is available, display it
  if (localData) {
    idsToToggle.forEach((id) => toggleSpinner(id, `${id}-spinner`, false)); // Hide spinner
    displayFunction(localData); // Call the display function with local data
    if (tabName) {
      tabDataLoaded[tabName] = true; // Mark tab as loaded
    }
  } else {
    // Fetch data from the API if no local data is available
    try {
      const response = await fetch(url); // Fetch data from the API
      if (!response.ok) throw new Error("API limit reached"); // Handle API errors
      const data = await response.json(); // Parse the JSON response
      idsToToggle.forEach((id) => toggleSpinner(id, `${id}-spinner`, false)); // Hide spinner
      displayFunction(data); // Call the display function with fetched data
      setLocalStorageData(localStorageKey, data); // Store fetched data in local storage
      if (tabName) {
        tabDataLoaded[tabName] = true; // Mark tab as loaded
      }
    } catch (error) {
      // Handle errors by showing error messages
      idsToToggle.forEach((id) => {
        toggleSpinner(id, `${id}-spinner`, false); // Hide spinner
        document.getElementById(`${id}-error`).style.display = "block"; // Show error message
      });
      if (tabName) {
        tabDataLoaded[tabName] = false; // Mark tab as not loaded
      }
    }
  }
}

// Function to display trending coins and NFTs
function displayTrends(data) {
  displayTrendCoins(data.coins.slice(0, 5)); // Display top 5 trending coins
  displayTrendNfts(data.nfts.slice(0, 5)); // Display top 5 trending NFTs
}

// Function to display trending coins in a table
function displayTrendCoins(coins) {
  const coinsList = document.getElementById("coins-list"); // Get the coins list element
  coinsList.innerHTML = ""; // Clear existing content
  const table = createTable(["Coin", "Price", "Market Cap", "Volume", "24h%"]); // Create table

  // Populate the table with coin data
  coins.forEach((coin) => {
    const coinData = coin.item; // Get coin data
    const row = document.createElement("tr"); // Create a new row
    row.innerHTML = `
            <td class="name-column table-fixed-column"><img src="${
              coinData.thumb
            }" alt="${coinData.name}"> ${
      coinData.name
    } <span>(${coinData.symbol.toUpperCase()})</span></td>
            <td>${parseFloat(coinData.price_btc).toFixed(6)}</td>
            <td>$${coinData.data.market_cap}</td>
            <td>$${coinData.data.total_volume}</td>
            <td class="${
              coinData.data.price_change_percentage_24h.usd >= 0
                ? "green"
                : "red"
            }">${coinData.data.price_change_percentage_24h.usd.toFixed(2)}%</td>
        `;
    row.onclick = () =>
      (window.location.href = `../../pages/coin.html?coin=${coinData.id}`); // Redirect to coin page on click
    table.appendChild(row); // Append row to the table
  });
  coinsList.appendChild(table); // Append table to the coins list
}

// Function to display trending NFTs in a table
function displayTrendNfts(nfts) {
  const nftsList = document.getElementById("nfts-list"); // Get the NFTs list element
  nftsList.innerHTML = ""; // Clear existing content
  const table = createTable(["NFT", "Market", "Price", "24h Vol", "24h%"]); // Create table

  // Populate the table with NFT data
  nfts.forEach((nft) => {
    const row = document.createElement("tr"); // Create a new row
    row.innerHTML = `
            <td class="name-column table-fixed-column"><img src="${
              nft.thumb
            }" alt="${nft.name}"> ${
      nft.name
    } <span>(${nft.symbol.toUpperCase()})</span></td>
            <td>${nft.native_currency_symbol.toUpperCase()}</td>
            <td>$${nft.data.floor_price}</td>
            <td>$${nft.data.h24_volume}</td>
            <td class="${
              parseFloat(nft.data.floor_price_in_usd_24h_percentage_change) >= 0
                ? "green"
                : "red"
            }">${parseFloat(
      nft.data.floor_price_in_usd_24h_percentage_change
    ).toFixed(2)}%</td>
        `;
    table.appendChild(row); // Append row to the table
  });
  nftsList.appendChild(table); // Append table to the NFTs list
}

// Function to display cryptocurrency assets in a table
function displayAssets(data) {
  const cryptoList = document.getElementById("asset-list"); // Get the asset list element
  cryptoList.innerHTML = ""; // Clear existing content
  const table = createTable(
    [
      "Rank",
      "Coin",
      "Price",
      "24h Price",
      "24h Price %",
      "Total Vol",
      "Market Cap",
      "Last 7 Days",
    ],
    1 // Set fixed column index
  );

  const sparklineData = []; // Array to hold sparkline data
  data.forEach((asset) => {
    const row = document.createElement("tr"); // Create a new row
    row.innerHTML = `
            <td class="rank">${asset.market_cap_rank}</td>
            <td class="name-column table-fixed-column"><img src="${
              asset.image
            }" alt="${asset.name}"> ${
      asset.name
    } <span>(${asset.symbol.toUpperCase()})</span></td>
            <td>$${asset.current_price.toFixed(2)}</td>
            <td class="${
              asset.price_change_percentage_24h >= 0 ? "green" : "red"
            }">$${asset.price_change_24h.toFixed(2)}</td>
            <td class="${
              asset.price_change_percentage_24h >= 0 ? "green" : "red"
            }">${asset.price_change_percentage_24h.toFixed(2)}%</td>
            <td>$${asset.total_volume.toLocaleString()}</td>
            <td>$${asset.market_cap.toLocaleString()}</td>
            <td><canvas id="chart-${
              asset.id
            }" width="100" height="50"></canvas></td>
        `;
    table.appendChild(row); // Append row to the table
    sparklineData.push({
      id: asset.id,
      sparkline: asset.sparkline_in_7d.price, // Store sparkline data
      color:
        asset.sparkline_in_7d.price[0] <=
        asset.sparkline_in_7d.price[asset.sparkline_in_7d.price.length - 1]
          ? "green"
          : "red", // Determine color based on price trend
    });
    row.onclick = () =>
      (window.location.href = `../../pages/coin.html?coin=${asset.id}`); // Redirect to coin page on click
  });
  cryptoList.appendChild(table); // Append table to the asset list

  // Create sparklines for each asset
  sparklineData.forEach(({ id, sparkline, color }) => {
    const ctx = document.getElementById(`chart-${id}`).getContext("2d"); // Get canvas context
    new Chart(ctx, {
      type: "line", // Set chart type
      data: {
        labels: sparkline.map((_, index) => index), // Create labels for the x-axis
        datasets: [
          {
            data: sparkline, // Set sparkline data
            borderColor: color, // Set line color
            fill: false, // Disable fill
            pointRadius: 0, // Disable point markers
            borderWidth: 1, // Set line width
          },
        ],
      },
      options: {
        responsive: false, // Disable responsive behavior
        scales: {
          x: {
            display: false, // Hide x-axis
          },
          y: {
            display: false, // Hide y-axis
          },
        },
        plugins: {
          legend: {
            display: false, // Hide legend
          },
          tooltip: {
            enabled: false, // Disable tooltips
          },
        },
      },
    });
  });
}

// Function to display cryptocurrency exchanges in a table
function displayExchanges(data) {
  const exchangeList = document.getElementById("exchange-list"); // Get the exchange list element
  exchangeList.innerHTML = ""; // Clear existing content
  const table = createTable(
    [
      "Rank",
      "Exchange",
      "Trust Score",
      "24h Trade",
      "24h Trade (Normal)",
      "Country",
      "Website",
      "Year",
    ],
    1 // Set fixed column index
  );

  data = data.slice(0, 20); // Limit to top 20 exchanges

  // Populate the table with exchange data
  data.forEach((exchange) => {
    const row = document.createElement("tr"); // Create a new row
    row.innerHTML = `
            <td class="rank">${exchange.trust_score_rank}</td>
            <td class="name-column table-fixed-column"><img src="${
              exchange.image
            }" alt="${exchange.name}"> ${exchange.name}</td>
            <td>${exchange.trust_score}</td>
            <td>$${exchange.trade_volume_24h_btc.toLocaleString(undefined, {
              minimumFractionDigits: 3,
              maximumFractionDigits: 3,
            })} BTC</td>
            <td>$${exchange.trade_volume_24h_btc_normalized.toLocaleString(
              undefined,
              { minimumFractionDigits: 3, maximumFractionDigits: 3 }
            )} BTC</td>
            <td class="name-column">${exchange.country || "N/A"}</td>
            <td class="name-column">${exchange.url}</td>
            <td>${exchange.year_established || "N/A"}</td>
        `;
    table.appendChild(row); // Append row to the table
  });
  exchangeList.appendChild(table); // Append table to the exchange list
}

// Function to display cryptocurrency categories in a table
function displayCategories(data) {
  const catagoriesList = document.getElementById("category-list"); // Get the categories list element
  catagoriesList.innerHTML = ""; // Clear existing content
  const table = createTable(
    ["Top Coins", "Category", "Market Cap", "24h Market Cap", "24h Volume"],
    1 // Set fixed column index
  );

  data = data.slice(0, 20); // Limit to top 20 categories

  // Populate the table with category data
  data.forEach((category) => {
    const row = document.createElement("tr"); // Create a new row
    row.innerHTML = `
            <td>${category.top_3_coins
              .map((coin) => `<img src="${coin}" alt="coin">`)
              .join("")}</td>
            <td class="name-column table-fixed-column">${category.name}</td>
            <td>$${
              category.market_cap
                ? category.market_cap.toLocaleString(undefined, {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })
                : "N/A"
            }</td>
            <td class="${
              category.market_cap_change_24h >= 0 ? "green" : "red"
            }">${
      category.market_cap_change_24h
        ? category.market_cap_change_24h.toFixed(3)
        : "0"
    }%</td>
            <td>$${
              category.volume_24h
                ? category.volume_24h.toLocaleString(undefined, {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })
                : "N/A"
            }</td>
        `;
    table.appendChild(row); // Append row to the table
  });
  catagoriesList.appendChild(table); // Append table to the categories list
}

// Function to display companies holding Bitcoin in a table
function displayCompanies(data) {
  const companyList = document.getElementById("company-list"); // Get the company list element
  companyList.innerHTML = ""; // Clear existing content
  const table = createTable([
    "Company",
    "Total BTC",
    "Entry Value",
    "Total Current Value",
    "Total %",
  ]);

  // Populate the table with company data
  data.companies.forEach((company) => {
    const row = document.createElement("tr"); // Create a new row
    row.innerHTML = `
            <td class="name-column table-fixed-column">${company.name}</td>
            <td>${company.total_holdings}</td>
            <td>${company.total_entry_value_usd}</td>
            <td>${company.total_current_value_usd}</td>
            <td class="${
              company.percentage_of_total_supply >= 0 ? "green" : "red"
            }">${company.percentage_of_total_supply}%</td>
        `;
    table.appendChild(row); // Append row to the table
  });
  companyList.appendChild(table); // Append table to the company list
}
