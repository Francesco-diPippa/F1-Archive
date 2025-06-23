import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000/api/season";

export async function findSeasons(
  year = null,
  from_year = null,
  to_year = null
) {
  try {
    let url = "";
    if (year !== null) url += `?year=${year}`;
    else if (from_year !== null && to_year !== null)
      url += `?from_year=${from_year}&to_year=${to_year}`;
    else if (from_year !== null) url += `?from_year=${from_year}`;
    else if (to_year !== null) url += `?to_year=${to_year}`;

    const response = await axios.get(BASE_URL + url);
    if (response.status === 200) return response.data;
    if (response.data === 400) {
      console.error("Codice 400" + response.data);
      return;
    }
  } catch (error) {
    console.error("Errore nella richiesta Axios:", error);
    return [];
  }
}

export async function findSeasonDriverStanding(year) {
  try {
    let url = "/standing";
    if (year !== null) url += `?year=${year}`;

    const response = await axios.get(BASE_URL + url);
    if (response.status === 200) return response.data;
    if (response.data === 400) {
      console.error("Codice 400" + response.data);
      return;
    }
  } catch (error) {
    console.error("Errore nella richiesta Axios:", error);
    return [];
  }
}

export async function findSeason(year) {
  try {
    let url = "";
    if (year !== null) url += `/${year}`;
    const response = await axios.get(BASE_URL + url);
    if (response.status === 200) return response.data;
    if (response.data === 400) {
      console.error("Codice 400" + response.data);
      return;
    }
  } catch (error) {
    console.error("Errore nella richiesta Axios:", error);
    return [];
  }
}

export async function deleteSeason(year) {
  try {
    let url = "";
    if (year !== null) url += `/${year}`;
    const response = await axios.delete(BASE_URL + url);
    if (response.status === 200) return response;
    if (response.data === 400) {
      console.error("Codice 400" + response.data);
      return response;
    }
  } catch (error) {
    console.error("Errore nella richiesta Axios:", error);
    return [];
  }
}
