import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = "http://127.0.0.1:5000/api/season";

/**
 * Fetches seasons based on optional year or year range.
 * @param {number|null} year - Specific year to filter by.
 * @param {number|null} from_year - Start year of the range.
 * @param {number|null} to_year - End year of the range.
 * @returns {Promise<Array>} - List of seasons or empty array on error.
 */
export async function findSeasons(
  year = null,
  from_year = null,
  to_year = null
) {
  try {
    const params = new URLSearchParams();
    if (year !== null) params.append("year", year);
    if (from_year !== null) params.append("from_year", from_year);
    if (to_year !== null) params.append("to_year", to_year);

    const response = await axios.get(`${BASE_URL}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Axios request error:", error);
    toast.error("Failed to fetch seasons.");
    return [];
  }
}

/**
 * Fetches driver standings for a given season year.
 * @param {number|null} year - Year of the season.
 * @returns {Promise<Array>} - Driver standings or empty array on error.
 */
export async function findSeasonDriverStanding(year) {
  try {
    const url =
      year !== null
        ? `${BASE_URL}/standing?year=${year}`
        : `${BASE_URL}/standing`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Axios request error:", error);
    toast.error("Failed to fetch driver standings.");
    return [];
  }
}

/**
 * Fetches details for a specific season.
 * @param {number|null} year - Year of the season.
 * @returns {Promise<Object|null>} - Season details or null on error.
 */
export async function findSeason(year) {
  if (year === null) return null;
  try {
    const response = await axios.get(`${BASE_URL}/${year}`);
    return response.data;
  } catch (error) {
    console.error("Axios request error:", error);
    toast.error("Failed to fetch season details.");
    return null;
  }
}

/**
 * Deletes a specific season.
 * @param {number|null} year - Year of the season to delete.
 * @returns {Promise<Object|null>} - Axios response or null on error.
 */
export async function deleteSeason(year) {
  if (year === null) return null;
  try {
    const response = await axios.delete(`${BASE_URL}/${year}`);
    return response;
  } catch (error) {
    console.error("Axios request error:", error);

    // Handle expected client errors explicitly
    if (error.response?.status === 400 || error.response?.status === 404) {
      toast.error(`Error: ${error.response.status} - ${error.response.data}`);
      return error.response;
    }

    toast.error("Failed to delete season.");
    return null;
  }
}
