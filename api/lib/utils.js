function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function normalizeURL(string) {
  try {
    const url = new URL(string);
    return `${url.protocol}//${url.hostname}${url.pathname === '/' ? '' : url.pathname}`;
  } catch (_) {
    return string;
  }
}

module.exports = {
  isValidURL,
  normalizeURL,
};