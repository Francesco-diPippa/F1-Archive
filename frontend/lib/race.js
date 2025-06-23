import axios from "axios";

// Base URL for all race-related API requests
const BASE_URL = "http://127.0.0.1:5000/api/race";

/**
 * Fetch a race by its ID
 * @param {string|number} id - The ID of the race
 * @returns {Promise<Object|null>} Race data or null if not found
 */
export async function findRace(id) {
  try {
    const response = await axios.get(`${BASE_URL}/${id}`);
    if (response.status === 200) return response.data;
  } catch (error) {
    console.error("Error during Axios request (findRace):", error);
  }
  return null;
}

/**
 * Fetch all races by a driver's ID
 * @param {string|number} driverId - The ID of the driver
 * @returns {Promise<Array>} Array of race objects or empty array on error
 */
export async function findRacesByDriverId(driverId) {
  try {
    const response = await axios.get(`${BASE_URL}/find_all_races_by_driverId/${driverId}`);
    if (response.status === 200) return response.data;
  } catch (error) {
    console.error("Error during Axios request (findRacesByDriverId):", error);
  }
  return [];
}

/**
 * Save a new race entry
 * @param {Object} race - The race object to be saved
 * @returns {Promise<Object|null>} Axios response or null on failure
 */
export async function saveRace(race) {
  try {
    const response = await axios.post(BASE_URL, {
      year: race.year,
      round: race.round,
      circuitId: race.circuitId,
      name: race.name,
      date: race.date,
    });
    return response;
  } catch (error) {
    console.error("Error during Axios request (saveRace):", error);
  }
  return null;
}

/**
 * Delete a race by its ID
 * @param {string|number} id - The ID of the race to delete
 * @returns {Promise<Object|null>} Axios response or null on failure
 */
export async function deleteRace(id) {
  try {
    const response = await axios.delete(`${BASE_URL}/${id}`);
    return response;
  } catch (error) {
    console.error("Error during Axios request (deleteRace):", error);
  }
  return null;
}
