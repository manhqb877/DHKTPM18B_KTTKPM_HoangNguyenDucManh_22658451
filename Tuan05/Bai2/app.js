const { registerPlugin, runPlugins } = require("./core/pluginManager");

const seoPlugin = require("./plugins/seoPlugin");
const statsPlugin = require("./plugins/statsPlugin");

registerPlugin(seoPlugin);
registerPlugin(statsPlugin);

console.log("CMS started");

runPlugins();