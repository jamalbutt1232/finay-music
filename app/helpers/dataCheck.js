const defaultSchemas = {
  "/login": ["email", "password"],
  "/register": ["email", "password", "confirm_password"],
};

const dataCheck = (type, data) => {
  const checkObj = defaultSchemas[type];
  let isError = false;
  checkObj.map((prop) => {
    if (!data.hasOwnProperty(prop)) {
      isError = true;
    }
  });
  if (Object.keys(data).length !== checkObj.length) {
    isError = true;
  }
  if (isError) {
    return false;
  } else {
    return true;
  }
};

module.exports = dataCheck;
