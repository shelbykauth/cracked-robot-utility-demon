process.env.NODE_CONFIG_DIR = "../config";

const config = require("config");

/**
 * Check that all required keys are in the loaded config files
 *   (before attempting to run the program)
 * @param {string[]} requiredConfigs a list of configuration keys, such as `api_endpoints.port`
 * @return {Boolean} true if valid, false if invalid
 */
function checkConfig(requiredConfigs) {
  let hasProblem = false;
  requiredConfigs.forEach(function (key) {
    if (!config.has(key)) {
      console.error(
        `Please add ${key} to the config file at .../config/local.json`
      );
      hasProblem = true;
    }
  });
  return !hasProblem;
}

module.exports = {
  checkConfig
};
