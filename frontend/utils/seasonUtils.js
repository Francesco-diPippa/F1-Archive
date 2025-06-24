/**
 * Utility functions for Season Detail components
 */

/**
 * Convert date format from YYYY-MM-DD to DD/MM/YYYY
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Date string in DD/MM/YYYY format
 */
export function convertDateFormat(dateStr) {
  if (!dateStr) return "-";

  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

/**
 * Get styling classes for position badges based on championship position
 * @param {number} pos - Position number
 * @returns {string} CSS classes for styling
 */
export function getPositionStyle(pos) {
  switch (pos) {
    case 1:
      return "bg-yellow-100 border-yellow-400 text-yellow-800";
    case 2:
      return "bg-gray-100 border-gray-400 text-gray-800";
    case 3:
      return "bg-orange-100 border-orange-400 text-orange-800";
    default:
      return "bg-white border-gray-200 text-gray-700";
  }
}

/**
 * Calculate aggregated season statistics
 * @param {Array} driverStandings - Array of driver standings data
 * @returns {Object} Calculated statistics
 */
export function calculateSeasonStats(driverStandings) {
  if (!driverStandings || !driverStandings.length) {
    return {
      totalDrivers: 0,
      totalPoints: 0,
      totalWins: 0,
      uniqueTeams: 0,
    };
  }

  const totalPoints = driverStandings.reduce(
    (sum, d) => sum + (d.totalPoints || 0),
    0
  );
  const totalWins = driverStandings.reduce((sum, d) => sum + (d.wins || 0), 0);
  const uniqueTeams = new Set(
    driverStandings.map((d) => d.constructorName).filter(Boolean)
  ).size;

  return {
    totalDrivers: driverStandings.length,
    totalPoints,
    totalWins,
    uniqueTeams,
  };
}

/**
 * Format driver name for display
 * @param {Object} driver - Driver object with forename and surname
 * @returns {string} Formatted driver name
 */
export function formatDriverName(driver) {
  if (!driver) return "";
  return `${driver.forename || ""} ${driver.surname || ""}`.trim();
}

/**
 * Check if a position should display a medal icon (top 3)
 * @param {number} position - Position number
 * @returns {boolean} Whether to show medal icon
 */
export function shouldShowMedal(position) {
  return position >= 1 && position <= 3;
}

/**
 * Format race result status text
 * @param {string} positionText - Position text from race result
 * @param {number} positionOrder - Position order number
 * @returns {string} Formatted position display
 */
export function formatRacePosition(positionText, positionOrder) {
  if (positionText === "R") return "DNF";
  if (positionText === "D") return "DSQ";
  if (positionText === "W") return "WD";
  return positionOrder?.toString() || positionText || "-";
}

/**
 * Validate if a season year is valid
 * @param {string|number} year - Year to validate
 * @returns {boolean} Whether the year is valid
 */
export function isValidSeasonYear(year) {
  const yearNum = parseInt(year);
  const currentYear = new Date().getFullYear();
  return yearNum >= 1950 && yearNum <= currentYear + 1;
}

/**
 * Check if a season is the current season
 * @param {string|number} seasonYear - Season year to check
 * @returns {boolean} Whether it's the current season
 */
export function isCurrentSeason(seasonYear) {
  const currentYear = new Date().getFullYear();
  return parseInt(seasonYear) === currentYear;
}
