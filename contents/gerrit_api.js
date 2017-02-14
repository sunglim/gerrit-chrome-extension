// TODO(sungguk): Make |GerritQuery| as singleton.

/**
 * The GerritQuery sends and receives Gerrit data by using Gerrit REST APIs.
 * @constructor
 */
function GerritQuery() {}

GerritQuery.prototype = {
  getChangeList: function(query) {
    // is:open+reviewer:self+owner:self
    console.log("Query:", query);

    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();

      // |api_endpoint| would be a gerrit url like a https://gpro.lgsvl.com/
      var api_endpoint = localStorage["api_endpoint"];
	  console.log(api_endpoint + '/changes/?o=MESSAGES&q=' + query);
      xhr.open("GET", api_endpoint + '/changes/?o=MESSAGES&q=' + query);
      xhr.send();
      // call to reject() is ignored once resolve() has been invoked
      xhr.onload = function() {
        try {
          resolve(JSON.parse(xhr.responseText.substr(5)));
        } catch (e) {
          reject(new TypeError(e.message));
        }
      }
      xhr.onloadend = function() {
        reject(new Error("Network error"));
      }
    });
  }
};
