import axios from "axios";

// Base URL for all race-related API requests
const BASE_URL = "http://127.0.0.1:5000/api/result";

/**
 * Invia un batch di risultati al backend.
 * @param {Array<Object>} results - Array di oggetti risultato da inviare.
 * @returns {Promise<Object>} Risposta del server.
 */
export const saveResultsBatch = async (results) => {
  if (!Array.isArray(results)) {
    throw new Error("Input must be an array of result objects");
  }

  try {
    const response = await axios.post(`${BASE_URL}/batch`, results);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Errore lato server
      throw new Error(
        `Server error: ${error.response.status} - ${JSON.stringify(
          error.response.data
        )}`
      );
    } else {
      // Errore lato client o di rete
      throw new Error(`Request failed: ${error.message}`);
    }
  }
};

/**
 * Invia un batch di risultati al backend.
 * @param {Object} results - Array di oggetti risultato da inviare.
 */
export const saveResult = async (result) => {
  try {
    const response = await axios.post(`${BASE_URL}`, result);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Errore lato server
      throw new Error(
        `Server error: ${error.response.status} - ${JSON.stringify(
          error.response.data
        )}`
      );
    } else {
      // Errore lato client o di rete
      throw new Error(`Request failed: ${error.message}`);
    }
  }
};

/**
 * Invia un batch di risultati al backend.
 * @param {number} raceId - Array di oggetti risultato da inviare.
 * @returns {Promise<Object>} Risposta del server.
 */
export const getRaceStandigs = async (raceId) => {
  try {
    const response = await axios.get(`${BASE_URL}/standings/${raceId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      return [];
      throw new Error(
        `Server error: ${error.response.status} - ${JSON.stringify(
          error.response.data
        )}`
      );
    } else {
      // Errore lato client o di rete
      throw new Error(`Request failed: ${error.message}`);
    }
  }
};

export const deleteResult = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${id}`);
    return response;
  } catch (error) {
    if (error.response) {
      // Errore lato server
      throw new Error(
        `Server error: ${error.response.status} - ${JSON.stringify(
          error.response.data
        )}`
      );
    } else {
      // Errore lato client o di rete
      throw new Error(`Request failed: ${error.message}`);
    }
  }
};

/**
 * Invia un batch di risultati al backend.
 * @param {Object} results - Array di oggetti risultato da inviare.
 */
export const findResult = async (resultId) => {
  try {
    const response = await axios.get(`${BASE_URL}/${resultId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Errore lato server
      throw new Error(
        `Server error: ${error.response.status} - ${JSON.stringify(
          error.response.data
        )}`
      );
    } else {
      // Errore lato client o di rete
      throw new Error(`Request failed: ${error.message}`);
    }
  }
};
