async function forwardToPHP(resource, payload) {
  try {
    const response = await fetch(
      "https://imar-techgateway.org/nfc_project/update.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resource, payload }),
      }
    );

    const text = await response.text();

    try {
      const result = JSON.parse(text);

      console.log(`PHP ANSWER [${resource}]:`, result); // affiche tout

      if (result && result.data != null) {
        return result.data;
      } else {
        console.warn(`No data in response for [${resource}]`);
        return null;
      }
    } catch (err) {
      console.error(`Invalid JSON response for [${resource}]:`, text, err);
      return null;
    }
  } catch (err) {
    console.error(`Sending Error [${resource}]:`, err);
    throw err;
  }
}

module.exports = { forwardToPHP };
