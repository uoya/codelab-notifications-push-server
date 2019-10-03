const expsession = require('express-session');
let session = expsession();

module.exports = { 
  getSubscriptions: () => { return {}; },
  writeSubscriptions: () => {}
}
