async function fetchSunsetTimeForAshkelon(date) {
  const latitude = 31.6689; // Ashkelon's latitude
  const longitude = 34.5669; // Ashkelon's longitude

  // Construct the URL for a free sunset API
  const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&date=${date}&formatted=0`);

  if (!response.ok) {
    throw new Error(`Error fetching sunset time: ${response.statusText}`);
  }

  const data = await response.json();
  return new Date(data.results.sunset); // Assuming the sunset time is returned in ISO format
}

function calculateShabbatTimes(sunsetTime) {
  // Calculate candle lighting time (18 minutes before sunset)
  const candleLighting = new Date(sunsetTime.getTime() - 32 * 60 * 1000); // 18 minutes before sunset

  // Calculate havdalah time (60 minutes after sunset)
  const havdalahTime = new Date(sunsetTime.getTime() + 34 * 60 * 1000); // 60 minutes after sunset

  return {
    candleLighting,
    havdalahTime,
    // Check if the current time is during Shabbat
    isShabbat: new Date() >= candleLighting && new Date() <= havdalahTime,
  };
}

async function getShabbatTimesForAshkelon(date) {
  try {
    const sunsetTime = await fetchSunsetTimeForAshkelon(date);
    const shabbatTimes = calculateShabbatTimes(sunsetTime);

    // Format times for output
    const formattedTimes = {
      candleLighting: shabbatTimes.candleLighting.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jerusalem" }),
      havdalah: shabbatTimes.havdalahTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jerusalem" }),
      isShabbat: shabbatTimes.isShabbat,
    };

    return formattedTimes;
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example usage
const date = "2024-10-06"; // Date of Shabbat
function getClosestFriday() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday

  let closestFriday;

  if (dayOfWeek === 5) {
    // If today is Friday
    closestFriday = today; // Return today's date
  } else if (dayOfWeek === 6) {
    // If today is Saturday
    closestFriday = new Date(today); // Clone today's date
    closestFriday.setDate(today.getDate() - 1); // Return yesterday's date
  } else {
    // Any other day
    closestFriday = new Date(today); // Clone today's date
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7; // Calculate days until next Friday
    closestFriday.setDate(today.getDate() + daysUntilFriday); // Set to the next Friday
  }

  return closestFriday.toISOString().split("T")[0]; // Return the date in YYYY-MM-DD format
}

module.exports = {
  getShabbatTimesForAshkelon,
  getClosestFriday,
};
