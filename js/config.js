/* BlogVerse environment configuration.
 * Local development uses the local Express server.
 * Render production uses the API service defined in render.yaml.
 */
(function () {
  const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  window.API_BASE_URL = isLocal
    ? 'http://127.0.0.1:5000/api'
    : 'https://blogverse-api.onrender.com/api';
})();
