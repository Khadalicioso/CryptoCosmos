// Get references to the lists for coins, exchanges, and NFTs
const coinsList = document.getElementById("coins-list");
const exchangesList = document.getElementById("exchanges-list");
const nftsList = document.getElementById("nfts-list");

// Event listener for when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search); // Get URL parameters
  const query = params.get("query"); // Retrieve the 'query' parameter
  if (query) {
    fetchSearchResult(query, [coinsList, exchangesList, nftsList]); // Fetch search results if query exists
  } else {
    // Display a message if no query is provided
    const searchHeading = document.getElementById("searchHeading");
    const searchContainer = document.querySelector(".search-container");
    searchContainer.innerHTML = `<p style="color: red; text-align: center; margin-bottom: 8px">Nothing To Show...</p>`;
    searchHeading.innerText = "Please search something...";
  }
});

// Function to fetch search results based on the query
function fetchSearchResult(param, idsToToggle) {
  const searchHeading = document.getElementById("searchHeading");

  // Hide error messages and show loading spinners for each list
  idsToToggle.forEach((id) => {
    const errorElement = document.getElementById(`${id}-error`);
    if (errorElement) {
      errorElement.style.display = "none"; // Hide error message
    }
    toggleSpinner(id, `${id}-spinner`, true); // Show spinner
  });

  // Clear previous search results
  coinsList.innerHTML = "";
  exchangesList.innerHTML = "";
  nftsList.innerHTML = "";

  // Update the search heading with the current query
  searchHeading.innerText = `Search results for "${param}"`;

  // Construct the API URL for fetching search results
  const url = `https://api.coingecko.com/api/v3/search?query=${param}`;
  const options = { method: "GET", headers: { accept: "application/json" } };

  // Fetch data from the API
  fetch(url, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText); // Handle network errors
      }
      idsToToggle.forEach((id) => toggleSpinner(id, `${id}-spinner`, false)); // Hide spinner
      return response.json(); // Parse the JSON response
    })
    .then((data) => {
      // Filter out items with missing thumbnails
      let coins = (data.coins || []).filter(
        (coin) => coin.thumb !== "missing_thumb.png"
      );
      let exchanges = (data.exchanges || []).filter(
        (ex) => ex.thumb !== "missing_thumb.png"
      );
      let nfts = (data.nfts || []).filter(
        (nf) => nf.thumb !== "missing_thumb.png"
      );

      // Count the number of results for each category
      const coinsCount = coins.length;
      const exchangesCount = exchanges.length;
      const nftsCount = nfts.length;

      // Determine the minimum count among the three categories
      let minCount = Math.min(coinsCount, exchangesCount, nftsCount);

      // If all categories have results, limit the number of displayed items
      if (coinsCount > 0 && (exchangesCount > 0) & (nftsCount > 0)) {
        coins = coins.slice(0, minCount);
        exchanges = exchanges.slice(0, minCount);
        nfts = nfts.slice(0, minCount);
      }

      // Display the results for each category
      coinsResult(coins);
      exchangesResult(exchanges);
      nftsResult(nfts);

      // Display messages if no results are found in each category
      if (coins.length === 0) {
        coinsList.innerHTML =
          '<p style="color: red; text-align: center;">No results found for coins.</p>';
      }

      if (exchanges.length === 0) {
        exchangesList.innerHTML =
          '<p style="color: red; text-align: center;">No results found for exchanges.</p>';
      }

      if (nfts.length === 0) {
        nftsList.innerHTML =
          '<p style="color: red; text-align: center;">No results found for nfts.</p>';
      }
    })
    .catch((error) => {
      // Handle errors by showing error messages
      idsToToggle.forEach((id) => {
        toggleSpinner(id, `${id}-spinner`, false); // Hide spinner
        document.getElementById(`${id}-error`).style.display = "block"; // Show error message
      });
      console.error("Error fetching data:", error); // Log the error
    });
}

// Function to display the search results for coins
function coinsResult(coins) {
  coinsList.innerHTML = ""; // Clear previous results

  const table = createTable(["Rank", "Coin"]); // Create a table for displaying coins

  // Populate the table with coin data
  coins.forEach((coin) => {
    const row = document.createElement("tr"); // Create a new row
    row.innerHTML = `
            <td>${coin.market_cap_rank}</td>
            <td class="name-column"><img src="${coin.thumb}" alt="${
      coin.name
    }"> ${coin.name} <span>(${coin.symbol.toUpperCase()})</span></td>
        `;
    table.appendChild(row); // Append row to the table
    row.onclick = () => {
      window.location.href = `../../pages/coin.html?coin=${coin.id}`; // Redirect to coin page on click
    };
  });
  coinsList.appendChild(table); // Append table to the coins list
}

// Function to display the search results for exchanges
function exchangesResult(exchanges) {
  exchangesList.innerHTML = ""; // Clear previous results

  const table = createTable(["Exchange", "Market"]); // Create a table for displaying exchanges

  // Populate the table with exchange data
  exchanges.forEach((ex) => {
    const row = document.createElement("tr"); // Create a new row
    row.innerHTML = `
            <td class="name-column"><img src="${ex.thumb}" alt="${ex.name}"> ${ex.name}</td>
            <td>${ex.market_type}</td>
        `;
    table.appendChild(row); // Append row to the table
  });
  exchangesList.appendChild(table); // Append table to the exchanges list
}

// Function to display the search results for NFTs
function nftsResult(nfts) {
  nftsList.innerHTML = ""; // Clear previous results

  const table = createTable(["NFT", "Symbol"]); // Create a table for displaying NFTs

  // Populate the table with NFT data
  nfts.forEach((nf) => {
    const row = document.createElement("tr"); // Create a new row
    row.innerHTML = `
            <td class="name-column"><img src="${nf.thumb}" alt="${nf.name}"> ${nf.name}</td>
            <td class="name-column">${nf.symbol}</td>
        `;
    table.appendChild(row); // Append row to the table
  });
  nftsList.appendChild(table); // Append table to the NFTs list
}
