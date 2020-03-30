const config = require("config");
const child_process = require("child_process");
const util = require("util");
const fs = require("fs");
const path = require("path");
const exec = util.promisify(child_process.exec);

validate();

async function test() {
  console.log(` == Testing == `);
  let command = `docker container ls`;
  let { stdout, stderr } = await exec(command);
  console.log(stdout);
  console.log(stderr);
  console.log(` == Config == `);
  if (config.has("something")) {
    console.log(`Config.something: ${config.get("something")}`);
  } else {
    console.log(`Config does not have 'something'.`);
  }
}

function validate() {
  let hasProblem = false;

  // Has All Required Configs //
  let requiredConfigs = [
    "postgres.version",
    "docker.volumeLocation",
    "docker.removeAfter",
    "docker.containerName",
    "docker.dbUsername",
    "docker.dbPassword",
    "docker.databaseName",
    "docker.port",
    "docker.detachProcess"
  ];
  requiredConfigs.forEach(function (key) {
    if (!config.has(key)) {
      console.error(
        `Please add ${key} to the config file at .../config/local.json`
      );
      hasProblem = true;
    }
  });

  if (hasProblem) {
    console.error(new Error("Exiting Because some configs are not present."));
    process.exit(1);
  }

  let volumeLocation = config.get("docker.volumeLocation");
  if (fs.existsSync(volumeLocation)) {
  } else {
    console.log(
      `Config.docker.volumeLocation is not valid.  Please correct in .../config/local.json.  Directory ${volumeLocation} does not exist`
    );
    hasProblem = true;
  }

  if (hasProblem) {
    console.error(new Error("Exiting Because some configs are not valid."));
    process.exit(1);
  }
}

async function pullImage() {
  console.log(` == Pulling Container Image == `);
  let command = `docker pull postgres:${config.get("postgres.version")}`;
  console.log(command);

  let { stdout, stderr } = await exec(command);
  console.log(stdout);
  console.log(stderr);
}

async function createContainer() {
  await stopContainer();
  const dockerConfig = config.get("docker");
  await pullImage();
  console.log(` == Creating Container Image == `);
  let pieces = [
    `docker run`,
    dockerConfig.removeAfter ? `--rm` : ``, // remove afterwards
    `--name ${dockerConfig.containerName}`, // container name
    `-e POSTGRES_PASSWORD=${dockerConfig.dbPassword}`, // database password
    `-e POSTGRES_USERNAME=${dockerConfig.dbUsername || "postgres"}`, // database password
    `-e POSTGRES_DB=${dockerConfig.databaseName || "example"}`, // database password
    dockerConfig.detachProcess ? `-d` : ``, // detach process
    `-p ${dockerConfig.port}:5432`, // port
    `-v ${dockerConfig.volumeLocation}:/var/lib/postgresql/data`, //
    `postgres`
  ];
  let command = pieces.join(" ");
  let { stdout, stderr } = await exec(command);
  console.log(stdout);
  console.log(stderr);
}

function runContainer() {}

async function stopContainer() {
  console.log(" == Removing existing container == ");
  let command = `docker container stop ${config.get("docker.containerName")}`;
  var stdout, stderr;
  try {
    var { stdout, stderr } = await exec(command);
    console.log(stdout);
  } catch (err) {
    if (err.message.indexOf("No such container:") !== -1) {
      console.log("No such container");
    } else {
      throw err;
    }
  }
}

module.exports = {
  test,
  createContainer,
  runContainer,
  pullImage
};
