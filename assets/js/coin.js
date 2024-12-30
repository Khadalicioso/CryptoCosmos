// Configuration for the single quote widget
const widgetConfig1 = {
  symbol: "BINANCE:BTCUSDT", // Default trading symbol
  width: "100%", // Width of the widget
  isTransparent: true, // Enable transparency
  colorTheme: "dark", // Set color theme
  locale: "en", // Language locale
};

// Configuration for the symbol overview widget
const widgetConfig2 = {
  symbols: [["BINANCE:BTCUSDT|1D"]], // Default symbol and interval
  chartOnly: false, // Show chart and other details
  width: "100%", // Width of the widget
  height: "100%", // Height of the widget
  locale: "en", // Language locale
  colorTheme: "dark", // Set color theme
  autosize: true, // Enable automatic resizing
  showVolume: false, // Hide volume display
  showMA: false, // Hide moving average
  hideDateRanges: false, // Show date ranges
  hideMarketStatus: false, // Show market status
  hideSymbolLogo: true, // Hide symbol logo
  scalePosition: "right", // Position of the scale
  scaleMode: "Normal", // Scale mode
  fontFamily:
    "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif", // Font family
  fontSize: "10", // Font size
  noTimeScale: false, // Enable time scale
  valuesTracking: "1", // Enable value tracking
  changeMode: "price-and-percent", // Change mode for price and percent
  chartType: "area", // Type of chart
  maLineColor: "#2962FF", // Color of the moving average line
  maLineWidth: 1, // Width of the moving average line
  maLength: 9, // Length of the moving average
  headerFontSize: "medium", // Font size for the header
  backgroundColor: "rgba(14, 18, 24, 1)", // Background color
  gridLineColor: "rgba(76, 175, 80, 0.06)", // Grid line color
  lineWidth: 2, // Width of the lines
  lineType: 0, // Type of line
  dateRanges: ["1d|15", "1m|30", "3m|60", "12m|1D", "60m|1W", "all|1M"], // Available date ranges
  dateFormat: "yyyy-MM-dd", // Date format
};

// Event listener for when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search); // Get URL parameters
  const query = params.get("coin"); // Retrieve the 'coin' parameter

  // Fetch coin information if the query exists, otherwise redirect
  if (query) {
    fetchCoinInfo(query);
  } else {
    window.location.href = "/../../index.html"; // Redirect to home if no query
  }
});

// Function to fetch information about a specific coin
async function fetchCoinInfo(query) {
  const coinInfoError = document.getElementById("coin-info-error"); // Error display element
  coinInfoError.style.display = "none"; // Hide error message initially
  const apiUrl = `https://api.coingecko.com/api/v3/coins/${query}`; // API URL for fetching coin data

  try {
    const response = await fetch(apiUrl); // Fetch data from the API
    if (!response.ok) throw new Error("API limit reached."); // Handle API errors
    const data = await response.json(); // Parse the JSON response
    widgetConfig1.symbol = `MEXC:${data.symbol.toUpperCase()}USDT`; // Update widget symbol

    widgetConfig2.symbols = [[`MEXC:${data.symbol.toUpperCase()}USDT|1D`]]; // Update widget configuration

    initializeWidget(); // Initialize the widget
    displayCoinInfo(data); // Display the fetched coin information
  } catch (error) {
    coinInfoError.style.display = "flex"; // Show error message on failure
    console.log(error); // Log the error to the console
  }
}

// Function to initialize the chart and ticker widgets
function initializeWidget() {
  const themeConfig = getThemeConfig(); // Get theme configuration
  widgetConfig1.colorTheme = themeConfig.theme; // Set color theme for the ticker widget
  widgetConfig2.colorTheme = themeConfig.theme; // Set color theme for the symbol overview widget
  widgetConfig2.backgroundColor = themeConfig.backgroundColor; // Set background color
  widgetConfig2.gridLineColor = themeConfig.gridColor; // Set grid line color

  // Create the ticker widget
  createWidget(
    "ticker-widget",
    widgetConfig1,
    "https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js"
  );

  // Create the mini chart widget
  createWidget(
    "mini-chart-widget",
    widgetConfig2,
    "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js"
  );
}

// Function to display information about the coin
function displayCoinInfo(coin) {
  const coinInfo = document.querySelector(".coin-info"); // Element to display coin info
  const rightSec = document.querySelector(".coin-container .right-section"); // Right section for additional info
  const coinDesc = document.getElementById("coin-desc-p"); // Element for coin description

  // Populate the coin information
  coinInfo.innerHTML = `
        <div class="logo">
                    <img src="${coin.image.thumb}" alt="${
    coin.name
  }"> <!-- Coin logo -->
                    <h4>${
                      coin.name
                    } <span>(${coin.symbol.toUpperCase()})</span></h4> <!-- Coin name and symbol -->
                    <p>#${coin.market_cap_rank}</p> <!-- Market cap rank -->
                </div>
                <div class="status">
                    <div class="item">
                        <p class="str">Market Cap</p>
                        <p class="num">$${
                          coin.market_data.market_cap.usd != null
                            ? coin.market_data.market_cap.usd.toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 3,
                                  maximumFractionDigits: 3,
                                }
                              )
                            : "N/A"
                        }</p>
                    </div>
                    <div class="item">
                        <p class="str">Current Price</p>
                        <p class="num">$${
                          coin.market_data.current_price.usd != null
                            ? coin.market_data.current_price.usd.toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 3,
                                  maximumFractionDigits: 3,
                                }
                              )
                            : "N/A"
                        }</p>
                    </div>
                    <div class="item">
                        <p class="str">All Time High</p>
                        <p class="num">$${
                          coin.market_data.ath.usd != null
                            ? coin.market_data.ath.usd.toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 3,
                                  maximumFractionDigits: 3,
                                }
                              )
                            : "N/A"
                        }</p>
                    </div>
                    <div class="item">
                        <p class="str">All Time Low</p>
                        <p class="num">$${
                          coin.market_data.atl.usd != null
                            ? coin.market_data.atl.usd.toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 3,
                                  maximumFractionDigits: 3,
                                }
                              )
                            : "N/A"
                        }</p>
                    </div>
                    <div class="item">
                        <p class="str">Total Volume</p>
                        <p class="num">$${
                          coin.market_data.total_volume.usd != null
                            ? coin.market_data.total_volume.usd.toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 3,
                                  maximumFractionDigits: 3,
                                }
                              )
                            : "N/A"
                        }</p>
                    </div>
                    <div class="item">
                        <p class="str">Total Supply</p>
                        <p class="num">${
                          coin.market_data.total_supply != null
                            ? coin.market_data.total_supply.toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 3,
                                  maximumFractionDigits: 3,
                                }
                              )
                            : "N/A"
                        }</p>
                    </div>
                    <div class="item">
                        <p class="str">Max Supply</p>
                        <p class="num">${
                          coin.market_data.max_supply != null
                            ? coin.market_data.max_supply.toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 3,
                                  maximumFractionDigits: 3,
                                }
                              )
                            : "N/A"
                        }</p>
                    </div>
                    <div class="item">
                        <p class="str">Circulating Supply</p>
                        <p class="num">${
                          coin.market_data.circulating_supply != null
                            ? coin.market_data.circulating_supply.toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 3,
                                  maximumFractionDigits: 3,
                                }
                              )
                            : "N/A"
                        }</p>
                    </div>
                </div>
    `;

  // Populate the right section with historical info
  rightSec.innerHTML = `
        <div class="status">
                <h3>Historical Info</h3>
                <div class="container">
                <div class="item">
                    <p class="str">ATH</p>
                    <p class="num">$${
                      coin.market_data.ath.usd != null
                        ? coin.market_data.ath.usd.toLocaleString(undefined, {
                            minimumFractionDigits: 3,
                            maximumFractionDigits: 3,
                          })
                        : "N/A"
                    }</p>
                </div>
                <div class="item">
                    <p class="str">ATL</p>
                    <p class="num">$${
                      coin.market_data.atl.usd != null
                        ? coin.market_data.atl.usd.toLocaleString(undefined, {
                            minimumFractionDigits: 3,
                            maximumFractionDigits: 3,
                          })
                        : "N/A"
                    }</p>
                </div>
                <div class="item">
                    <p class="str">24h High</p>
                    <p class="num">$${
                      coin.market_data.high_24h.usd != null
                        ? coin.market_data.high_24h.usd.toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 3,
                              maximumFractionDigits: 3,
                            }
                          )
                        : "N/A"
                    }</p>
                </div>
                <div class="item">
                    <p class="str">24h Low</p>
                    <p class="num">$${
                      coin.market_data.low_24h.usd != null
                        ? coin.market_data.high_24h.usd.toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 3,
                              maximumFractionDigits: 3,
                            }
                          )
                        : "N/A"
                    }</p>
                </div>
                </div>
            </div>

            <div class="status">
            <h3>Markets</h3>
            <div class="container">
                <div class="item">
                    <p class="str">${coin.tickers[0].market.name.replace(
                      "Exchange",
                      ""
                    )}</p>
                    <div class="links">
                        <a href="${coin.tickers[0].trade_url}">Trade</a>
                        <p style="background-color: ${
                          coin.tickers[0].trust_score
                        }">Trusted?</p>
                    </div>
                </div>
                <div class="item">
                    <p class="str">${coin.tickers[1].market.name.replace(
                      "Exchange",
                      ""
                    )}</p>
                    <div class="links">
                        <a href="${coin.tickers[1].trade_url}">Trade</a>
                        <p style="background-color: ${
                          coin.tickers[1].trust_score
                        }">Trusted?</p>
                    </div>
                </div>
                <div class="item">
                    <p class="str">${coin.tickers[2].market.name.replace(
                      "Exchange",
                      ""
                    )}</p>
                    <div class="links">
                        <a href="${coin.tickers[2].trade_url}">Trade</a>
                        <p style="background-color: ${
                          coin.tickers[2].trust_score
                        }">Trusted?</p>
                    </div>
                </div>
                </div>
            </div>

            <div class="status">
            <h3>Info</h3>
                <div class="container">
                    <div class="item">
                        <p class="str">Website</p>
                        <div class="links">
                            <a target="_blank" href="${
                              coin.links.homepage
                            }">Visit</a>
                            <a target="_blank" href="${
                              coin.links.whitepaper
                            }">Whitepaper</a>
                        </div>
                    </div>
                    <div class="item">
                        <p class="str">Community</p>
                        <div class="links">
                            <a target="_blank" href="https://x.com/${
                              coin.links.twitter_screen_name
                            }">Twitter</a>
                            <a target="_blank" href="https://facebook.com/${
                              coin.links.facebook_username
                            }">Facebook</a>
                        </div>
                    </div>
                </div>
            </div>
    `;

  // Set the coin description
  coinDesc.innerHTML =
    coin.description.en ||
    '<p class="red">Asset description not available!</p>'; // Fallback if description is not available
}

// Function to get theme configuration for the widgets
function getThemeConfig() {
  const root = getComputedStyle(document.documentElement); // Get computed styles of the root element
  const isDarkTheme =
    localStorage.getItem("theme") === "light-theme" ? false : true; // Determine if the current theme is dark

  // Return theme configuration object
  return {
    theme: isDarkTheme ? "dark" : "light", // Set theme
    backgroundColor: root
      .getPropertyValue(isDarkTheme ? "--chart-dark-bg" : "--chart-light-bg")
      .trim(), // Set background color
    gridColor: root
      .getPropertyValue(
        isDarkTheme ? "--chart-dark-border" : "--chart-light-border"
      )
      .trim(), // Set grid color
  };
}
