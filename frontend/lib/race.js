import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000/api/race";

export async function findSeasons(
  year = null,
  from_year = null,
  to_year = null
) {
  try {
    let url = "/seasons";
    if (year !== null && typeof year == "number") url += `?year=${year}`;
    else if (
      from_year !== null &&
      to_year !== null &&
      typeof from_year == "number" &&
      typeof to_year == "number"
    )
      url += `?from_year=${from_year}&to_year=${to_year}`;
    else if (from_year !== null && from_year == "number")
      url += `?from_year=${from_year}`;
    else if (to_year !== null && to_year == "number")
      url += `?to_year=${to_year}`;

    const response = await axios.get(BASE_URL + url);
    if (response.status === 200) return response.data;
  } catch (error) {
    console.error("Errore nella richiesta Axios:", error);
    return [];
  }
}

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
