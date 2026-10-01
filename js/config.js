// BONE SIP — runtime configuration.
// Edit this file per environment (or generate it at deploy time); it is loaded before app.js.
window.BONE_SIP_CONFIG = {
  // 'demo'       → OTP is simulated in the browser and the code is shown on screen.
  // 'production' → OTP is sent/verified through the endpoints below (you must provide a backend).
  mode: 'demo',

  demoOtpCode: '849201',

  otp: {
    // POST { phone: "9876543210" } → 2xx when the SMS has been sent.
    sendUrl: '',
    // POST { phone: "9876543210", code: "123456" } → 2xx JSON { verified: true }.
    verifyUrl: ''
  },

  // Registers sw.js for offline use. Disable while developing if caching gets in the way.
  enableServiceWorker: true
};
