import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000/api/race";

export async function findRace(id) {
  try {
    const response = await axios.get(BASE_URL + `/${id}`);
    if (response.status === 200) return response.data;
  } catch (error) {
    console.error("Errore nella richiesta Axios:", error);
    return [];
  }
}

export async function findRacesByDriverId(driverId) {
  try {
    const response = await axios.get(
      BASE_URL + `/find_all_races_by_driverId/${driverId}`
    );
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error("Errore nella richiesta Axios:", error);
    return [];
  }
}
