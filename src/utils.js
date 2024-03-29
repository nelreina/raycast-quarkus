// Generate url for the API
export const generateUrl = (host, path, queries, extensions) => {
  let url = `${host}${path}`;
  let sortedQueries = {};
  if (queries) {
    // Sort the queries
    Object.keys(queries)
      .sort()
      .forEach(function (key) {
        sortedQueries[key] = queries[key];
      });
  }
  if (queries) {
    url += "?";
    for (let key in sortedQueries) {
      // key is first letter of the query
      if (key !== "directory") {
        let qk = key[0].toLowerCase();
        qk = qk === "p" ? "S" : qk;
        url += `${qk}=${queries[key]}&`;
      }
    }
  }
  if (extensions) {
    for (let ext of extensions) {
      url += `e=${ext}&`;
    }
  }

  // Remove the last '&' from the url
  url = url.slice(0, -1);

  return url;
};
