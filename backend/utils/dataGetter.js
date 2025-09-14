// dataGetter.js
async function fetchFromPHP(resource, params = {}) {
  try {
    // Construire l'URL avec query string
    const query = new URLSearchParams({ resource, ...params }).toString();
    const url = `https://imar-techgateway.org/nfc_project/get.php?${query}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const text = await response.text();

    try {
      const result = JSON.parse(text);
      console.log(`Full PHP response [${resource}]:`, result);

      if (result.data !== undefined) {
        return result.data;
      } else {
        console.warn(`No data in response for [${resource}]`);
        return null;
      }
    } catch {
      console.error(`Invalid JSON response for [${resource}]:`, text);
      return null;
    }
  } catch (err) {
    console.error(`Fetching Error [${resource}]:`, err);
    throw err;
  }
}

module.exports = { fetchFromPHP };
