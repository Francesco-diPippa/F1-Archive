import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000/api/constructor";

export async function findConstructorsByDriverId(driverId) {
  try {
    const response = await axios.get(
      BASE_URL + `/find_costructors_by_driverId/${driverId}`
    );
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error("Errore nella richiesta Axios:", error);
    return [];
  }
}

/**
 * Fetches seasons based on optional year or year range.
 * @returns {Promise<Array>} - List of seasons or empty array on error.
 */
export async function findConstructors() {
  try {
    const response = await axios.get(`${BASE_URL}/all`);
    return response.data;
  } catch (error) {
    console.error("Axios request error:", error);
    toast.error("Failed to fetch seasons.");
    return [];
  }
}
