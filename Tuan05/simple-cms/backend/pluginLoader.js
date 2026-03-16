const fs = require("fs");
const path = require("path");

let plugins = [];

function loadPlugins(app){

  const folder = path.join(__dirname,"plugins");

  fs.readdirSync(folder).forEach(file => {

    const plugin = require(path.join(folder,file));

    if(plugin.init){
      plugin.init(app);
      plugins.push(plugin.name);
    }

  });

}

function getPlugins(){
  return plugins;
}

module.exports = { loadPlugins, getPlugins };