const API_URL = 'http://localhost:8000/v1'

// Load planets and return as JSON.
async function httpGetPlanets() {
  try {
    const response = await fetch(`${API_URL}/planets`);
    return await response.json();
  } catch (error) {
    console.log(error);
    return [];
  }
}

// Load launches, sort by flight number, and return as JSON..
async function httpGetLaunches() {
  try {
    const response = await fetch(`${API_URL}/launches`);
    const fetchedResponse = await response.json();
    return fetchedResponse.sort((a, b) => {
      return a.flightNumber - b.flightNumber;
    });
  } catch (error) {
    console.log(error);
  }
}

// Submit given launch data to launch system.
async function httpSubmitLaunch(launch) {
  try {
    return await fetch(`${API_URL}/launches`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(launch)
    });
  } catch (error) {
    console.log(error);
    return {
      ok: false
    }
  }
} 

// Delete launch with given ID.
async function httpAbortLaunch(id) {
  try {
    return await fetch(`${API_URL}/launches/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.log(error);
    return {
      ok: false
    }
  }
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};
