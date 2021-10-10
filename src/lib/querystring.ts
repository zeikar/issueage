export const parseQueryString = (queryString: string): any => {
  const obj = {};

  if (queryString === "") {
    return obj;
  }

  const split = queryString.split("&");
  split.forEach((element) => {
    const elementSplit = element.split("=");
    const key = elementSplit[0];
    const value = decodeURIComponent(elementSplit[1]);
    obj[key] = value;
  });

  return obj;
};

export const generateQueryString = (obj: object): string => {
  const qs = [];
  for (const [key, value] of Object.entries(obj)) {
    // skip empty values
    if (!value) {
      continue;
    }
    qs.push(`${key}=${value}`);
  }

  return "?" + qs.join("&");
};

// update query string with obj
export const updateQueryString = (qs: string, obj: object): string => {
  const qsObj = parseQueryString(qs);
  for (const [key, value] of Object.entries(obj)) {
    qsObj[key] = value;
  }

  return generateQueryString(qsObj);
};
