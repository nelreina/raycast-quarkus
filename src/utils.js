// Generate url for the API
export const generateUrl = (host, path, queries) => {
  let url = `${host}${path}`;
  if (queries) {
    url += "?";
    for (let key in queries) {
      // key is first letter of the query
      let qk = key[0].toLowerCase();
      console.log("LOG:  ~ generateUrl ~ qk:", qk);
      url += `${qk}=${queries[key]}&`;
    }
  }

  return url;
};
