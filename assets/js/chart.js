// Function to retrieve theme configuration for the chart
function getThemeConfig() {
  // Get the computed styles of the root element
  const root = getComputedStyle(document.documentElement);

  // Determine if the current theme is dark based on local storage
  const isDarkTheme =
    localStorage.getItem("theme") === "light-theme" ? false : true;

  // Set background color based on the current theme
  const backgroundColor = root
    .getPropertyValue(isDarkTheme ? "--chart-dark-bg" : "--chart-light-bg")
    .trim();

  // Set grid color based on the current theme
  const gridColor = root
    .getPropertyValue(
      isDarkTheme ? "--chart-dark-border" : "--chart-light-border"
    )
    .trim();

  // Return the configuration object for the chart
  return {
    autosize: true, // Enable automatic resizing of the chart
    symbol: "BINANCE:BTCUSDT", // Default trading symbol
    interval: "4H", // Default time interval for the chart
    timezone: "Etc/UTC", // Set timezone for the chart
    theme: isDarkTheme ? "dark" : "light", // Set theme based on user preference
    style: "1", // Chart style
    locale: "en", // Language locale
    container_id: "chart-widget", // ID of the container for the chart
    backgroundColor: backgroundColor, // Background color of the chart
    gridColor: gridColor, // Grid color of the chart
    hide_side_toolbar: false, // Show side toolbar
    allow_symbol_change: true, // Allow changing the trading symbol
    save_image: true, // Enable saving chart as an image
    details: true, // Show details on the chart
    calendar: false, // Disable calendar feature
    support_host: "https://www.tradingview.com", // Support host URL
  };
}

// Function to initialize the chart widget
function initializeWidget() {
  // Get the configuration for the chart
  const widgetConfig = getThemeConfig();

  // Create the chart widget with the specified configuration
  createWidget(
    "chart-widget", // Container ID
    widgetConfig, // Configuration object
    "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js" // Source of the widget script
  );
}

// Call the function to initialize the widget
initializeWidget();
