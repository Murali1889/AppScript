function googleSearch(searchTerm, numResults = 100) {
  try {
    let results = [];
    for (let start = 1; results.length < numResults; start += 10) {
      const searchUrl = constructSearchUrl(searchTerm, start, numResults, results.length);
      const response = UrlFetchApp.fetch(searchUrl, {muteHttpExceptions: true});
      Logger.log(response);
      const json = tryParseJSON(response.getContentText());
      Logger.log(json)
      if (json && json.items) {
        results = results.concat(json.items);
      } else {
        break;
      }
      Utilities.sleep(2000);
    }
    Logger.log(results)
    return results.length > 0 ? results : null;
  } catch (error) {
    Logger.log(`Error in googleSearch: ${error}`);
    return null;
  }
}

function constructSearchUrl(searchTerm, start, numResults, currentCount) {
  const params = {
    q: searchTerm,
    cx: SEARCH_ENGINE_ID,
    key: API_KEY,
    num: Math.min(10, numResults - currentCount),
    start: start
  };
  return 'https://www.googleapis.com/customsearch/v1?' + formatParams(params);
}

function tryParseJSON(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return null;
  }
}

function formatParams(params) {
  return Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join("&");
}