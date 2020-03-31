process.env.NODE_CONFIG_DIR = "../config";

const config = require("config");
const Common = require("../../Common/src");
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
  if (config.has("external")) {
    console.log(`Config.external: ${config.get("external")}`);
  } else {
    console.log(`Config does not have 'external'.`);
  }
}

function validate() {
  let hasProblem = false;

  if (
    !Common.CheckConfig([
      "postgres_database.version",
      "postgres_database.volume_location",
      "postgres_database.remove_after",
      "postgres_database.container_name",
      "postgres_database.username",
      "postgres_database.password",
      "postgres_database.database_name",
      "postgres_database.port",
      "postgres_database.detach_process",
    ])
  ) {
    console.error(new Error("Exiting Because some configs are not present."));
    process.exit(1);
  }

  let volume_location = config.get("postgres_database.volume_location");
  if (fs.existsSync(volume_location)) {
  } else {
    console.log(
      `Config.postgres_database.volume_location is not valid.  Please correct in .../config/local.json.  Directory ${volume_location} does not exist`
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
  let version = config.get("postgres_database.version");
  let command = `docker pull postgres:${version}`;
  console.log(command);

  let { stdout, stderr } = await exec(command);
  console.log(stdout);
  console.log(stderr);
}

async function createContainer() {
  await stopContainer();
  const dockerConfig = config.get("postgres_database");
  await pullImage();
  console.log(` == Creating Container Image == `);
  let pieces = [
    `docker run`,
    dockerConfig.remove_after ? `--rm` : ``, // remove afterwards
    `--name ${dockerConfig.container_name}`, // container name
    `-e POSTGRES_PASSWORD=${dockerConfig.password}`, // database password
    `-e POSTGRES_USERNAME=${dockerConfig.username || "postgres"}`, // database password
    `-e POSTGRES_DB=${dockerConfig.database_name || "example"}`, // database password
    dockerConfig.detach_process ? `-d` : ``, // detach process
    `-p ${dockerConfig.port}:5432`, // port
    `-v ${dockerConfig.volume_location}:/var/lib/postgresql/data`, //
    `postgres`,
  ];
  let command = pieces.join(" ");
  let { stdout, stderr } = await exec(command);
  console.log(stdout);
  console.log(stderr);
}

function runContainer() {}

async function stopContainer() {
  console.log(" == Removing existing container == ");
  let container_name = config.get("postgres_database.container_name");
  let command = `docker container stop ${container_name}`;
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
  pullImage,
};
