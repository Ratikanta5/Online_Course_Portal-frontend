// Fetch real-time exchange rate from Open Exchange Rates API
// Cache in localStorage to persist across page reloads

let cachedRate = 83; // Default fallback
let cacheExpiry = 0;

// Initialize cache from localStorage on app start
const initializeCache = () => {
  try {
    const stored = localStorage.getItem("exchangeRateCache");
    if (stored) {
      const { rate, expiry } = JSON.parse(stored);
      cachedRate = rate;
      cacheExpiry = expiry;
    }
  } catch (err) {
    console.warn("Failed to load cached exchange rate:", err);
  }
};

// Call on module load
initializeCache();

export const getExchangeRate = async () => {
  const now = Date.now();
  
  // Return cached rate if still valid (cache for 1 hour)
  if (cachedRate && cacheExpiry > now) {
    console.log("Using cached exchange rate:", cachedRate);
    return cachedRate;
  }

  try {
    // Using exchangerate-api.com free tier (1500 requests/month)
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );
    
    if (!response.ok) throw new Error("Failed to fetch rate");
    
    const data = await response.json();
    const inrRate = data.rates?.INR;

    if (inrRate) {
      cachedRate = inrRate;
      cacheExpiry = now + 3600000; // Cache for 1 hour
      
      // Store in localStorage for persistence across reloads
      try {
        localStorage.setItem(
          "exchangeRateCache",
          JSON.stringify({ rate: cachedRate, expiry: cacheExpiry })
        );
      } catch (err) {
        console.warn("Failed to cache exchange rate:", err);
      }
      
      console.log("Fetched fresh exchange rate:", cachedRate);
      return cachedRate;
    }
  } catch (err) {
    console.warn("Exchange rate fetch failed, using cached/default rate:", err);
  }

  return cachedRate; // Return cached or default
};

// Synchronous version (uses cached rate or default)
export const convertToUSDSync = (inrPrice) => {
  if (!inrPrice) return 0;
  
  return Math.round((inrPrice / cachedRate) * 100) / 100;
};
