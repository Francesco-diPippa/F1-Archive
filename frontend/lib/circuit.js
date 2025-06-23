import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000/api/circuit";

export async function findCircuitsByDriverId(driverId) {
  try {
    const response = await axios.get(
      BASE_URL + `/find_circuits_by_driverId/${driverId}`
    );
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error("Errore nella richiesta Axios:", error);
    return [];
  }
}

export async function findCircuits() {
  try {
    const response = await axios.get(BASE_URL + `/all`);
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error("Errore nella richiesta Axios:", error);
    return [];
  }
}
