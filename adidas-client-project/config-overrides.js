const rewireMobX = require('react-app-rewire-mobx');
const rewireStyl = require("react-app-rewire-stylus-modules");

module.exports = function override(config, env) {
    config = rewireMobX(config, env);
    config = rewireStyl(config, env);
    return config;
}
