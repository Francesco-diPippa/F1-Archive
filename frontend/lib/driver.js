import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000/api/driver";

export async function findDrivers(nationality = null, sortAlpha = null) {
  try {
    let url = "/all";
    if (nationality !== null && sortAlpha !== null)
      url += `?nationality=${nationality}&sortAlpha=${sortAlpha}`;
    else if (sortAlpha !== null) url += `?sortAlpha=${sortAlpha}`;
    else if (nationality !== null) url += `?nationality=${nationality}`;

    const response = await axios.get(BASE_URL + url);
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error("Errore nella richiesta Axios:", error);
    return [];
  }
}

export async function findNationalities() {
  try {
    let url = "/find_nationalities";
    const response = await axios.get(BASE_URL + url);
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error("Errore nella richiesta Axios:", error);
    return [];
  }
}
