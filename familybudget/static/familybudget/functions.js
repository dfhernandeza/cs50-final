let authenticated = false;

/**
 * @method sends request to server, checks if user is authenticated and stores result (boolean) in variable
 */
async function isauthenticated() {
  const res = await fetch("/isauthenticated");
  const data = await res.json();
  authenticated = data.result;
}

/**
 * @param {object} viewsState
 * @param {string} view
 * @returns return viewstate object and sets to true provided view
 */
function renderViews(viewsState, view) {
  let views = {};
  /**
   * iterates over each key of object and set property value to 
   * true when view (string) equals key and false when not equal
   *  */ 
  for (const [key, value] of Object.entries(viewsState)) {
    if (key === view) {
      views[key] = true;
    } else {
      views[key] = false;
    }
  }
  return views;
}

/**
 * @function updates state of provided target element 
 * (name equals form data object property) and updates errors object to remove key
 * @param {object} state 
 * @param {function} setState 
 * @param {object} target 
 */
function handleChangeFunction(state, setState, target) {
  let formData = state.formData;
  formData[target.name] = target.value;
  setState({
    ...state,
    formData: formData,
  });
  const errors = state.errors;
  // remove from errors (not empty)
  if ([target.name] in errors) {
    delete errors[target.name];
    setState({
      ...state,
      errors: errors,
    });
  }
}

/**
 * 
 * @returns csrftoken cookie
 */
function getcsrftoken() {
  let cookie = {};
  document.cookie.split(";").forEach(function (el) {
    let [key, value] = el.split("=");
    cookie[key.trim()] = value;
  });
  return cookie["csrftoken"];
}

/**
 *
 * @param {method} url
 * @returns array of objects keys id and text
 */
async function getSelectData(url) {
  const res = await fetch(url);
  const data = await res.json();
  return data;
}
/**
 * 
 * @param {number} i 
 * @returns ordinal suffix of provided number
 */
// 
function ordinal_suffix_of(i) {
  var j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}
/**
 * @param {number} monthNumber 
 * @returns month name
 */
function toMonthName(monthNumber) {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString("en-US", {
    month: "long",
  });
}
// Create our number formatter.
var formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",

  // These options are needed to round to whole numbers if that's what you want.
  minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

/**
 * Performs call to fetch to provided url
 * @param {string} url 
 * @param {string} method 
 * @param {object} body 
 * @returns Response
 */
async function makeCall(url, method, body) {
  const csrftoken = getcsrftoken();
  const resp = await fetch(url, {
    method: method,
    body: JSON.stringify(body),
    headers: { "X-CSRFToken": csrftoken },
  });
  return resp;
}

/**
 * 
 * @param {object} objectState 
 * @returns object with each property set to empty string
 */
function clearObject(objectState) {
  let object = {};
  for (const [key, value] of Object.entries(objectState)) {
    object[key] = "";
  }
  return object;
}

/**
 * 
 * @param {object} state 
 * @param {function} setState 
 * @returns boolean, true or false if form is valid (not empty form controls)
 */
function handleValidationFunction(state, setState) {
  let formIsValid = true;
  let errors = {};
  //iterate over each form control (state) and inserts key to errors if value is equal to empty string
  for (const [key, value] of Object.entries(state.formData)) {
    if (value === "") {
      formIsValid = false;
      errors[key] = `${key} cannot be empty`;
    }
  }

  setState({
    ...state,
    errors: errors,
  });
  return formIsValid;
}

/**
 * 
 * @param {string} text 
 * @returns same string with first character set to uppercase
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
