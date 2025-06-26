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

export async function findDriver(id) {
  try {
    const response = await axios.get(BASE_URL + `/${id}`);
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error("Errore nella richiesta Axios:", error);
    return [];
  }
}

export async function findDriverResults(id) {
  try {
    const response = await axios.get(BASE_URL + `/find_results/${id}`);
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

export async function saveDriver(driver) {
  try {
    const response = await axios.post(BASE_URL, {
      _id: driver?._id,
      driverRef: driver.surname.trim(),
      forename: driver.forename,
      surname: driver.surname,
      nationality: driver.nationality,
      dob: driver.dob,
      url: driver.url,
    });
    return response;

    // if (response.status === 201) {
    //   console.log(response);
    //   return response.data;
    // } else {
    //   console.log(response);
    //   return response
    // }
  } catch (error) {
    console.error("Errore nella richiesta Axios:", error);
    return [];
  }
}

export async function deleteDriver(id) {
  console.log(id);

  try {
    if (typeof id === "number") {
      const response = await axios.delete(BASE_URL + `/${id}`);
      return response;
    } else throw Error("function accept int");
  } catch (error) {
    console.error("Errore nella richiesta Axios:", error);
    return [];
  }
}
