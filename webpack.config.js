let webpack = require('vortex-api/bin/webpack').default;
let config = webpack('vortex-showcase', __dirname, 4);
// config.externals["pako"] = "pako";
//this is effectively taking a hard dependency on nexus-mods/extension-mod-report
// that extension is a) bundled and b) already includes pako
// that's not ideal but doing it this way roughly halves the compiled extension size
// module.exports = webpack('vortex-showcase', __dirname, 4);
module.exports = config;