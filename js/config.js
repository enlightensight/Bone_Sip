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

  // Accounts: real phone login, saving to the user's account, history and the
  // admin portal (server/accounts.js). If this host has no accounts API (static
  // hosting, file://) the app falls back to the on-device demo login above.
  accountsApi: '/api',

  // AI assistant "Ojas". The browser only talks to this endpoint on our own server
  // (server/server.js, netlify/functions/chat.js or api/chat.js), which holds the
  // GROQ_API_KEY. Set endpoint to '' to use only the built-in offline answers.
  assistant: {
    endpoint: '/api/chat'
  },

  // Registers sw.js for offline use. Disable while developing if caching gets in the way.
  enableServiceWorker: true
};
