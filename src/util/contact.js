const endpoint = `${process.env.REACT_APP_SHEETS_ENDPOINT}?tabId=${process.env.REACT_APP_SHEETS_TAB_ID}`;

function submit(data) {
  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify([[data.name, data.email, data.message]]),
  }).then((r) => r.json());
}

export default { submit };
