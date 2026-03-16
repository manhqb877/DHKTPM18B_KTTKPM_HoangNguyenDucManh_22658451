const plugins = [];

function registerPlugin(plugin) {
    plugins.push(plugin);
}

function runPlugins() {
    plugins.forEach(plugin => {
        plugin.run();
    });
}

module.exports = {
    registerPlugin,
    runPlugins
};