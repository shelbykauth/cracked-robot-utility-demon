// import child_process from "child_process";
// import util from "util";
const child_process = require("child_process");
const util = require("util");
const exec = util.promisify(child_process.exec);

async function test() {
  console.log(" == Testing");
  let { stdout, stderr } = await exec("docker container ls");
  console.log(stdout);
  console.log(stderr);
}

function createContainer() {}

function runContainer() {}

module.exports = {
  test,
  createContainer,
  runContainer
};
