window.PrivateSiteConfig = Object.assign({}, window.PrivateSiteConfig, {
  firebaseApiKey: [
    65, 73, 122, 97, 83, 121, 66, 56, 48, 88,
    117, 52, 102, 70, 83, 114, 82, 108, 50, 51,
    85, 102, 118, 78, 50, 107, 67, 97, 103, 81,
    110, 70, 56, 73, 50, 100, 121, 70, 48,
  ].map(function (code) {
    return String.fromCharCode(code);
  }).join('')
});
