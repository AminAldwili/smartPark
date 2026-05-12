const { spawn } = require("child_process");
const puppeteer = require("puppeteer-core");
const path = require("path");

const OBSCURA_BIN = path.resolve(__dirname, "../../tools/obscura.exe");
const CDP_PORT = 9222;
const DEV_SERVER_URL = "http://127.0.0.1:8080";

let obscuraProcess = null;
let browser = null;

async function startObscura() {
  return new Promise((resolve, reject) => {
    obscuraProcess = spawn(OBSCURA_BIN, ["serve", "--port", String(CDP_PORT)], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    const timeout = setTimeout(() => {
      reject(new Error("Obscura startup timed out"));
    }, 30000);

    obscuraProcess.stderr.on("data", (data) => {
      const msg = data.toString();
      if (msg.includes("CDP server")) {
        clearTimeout(timeout);
        resolve();
      }
    });

    obscuraProcess.stdout.on("data", (data) => {
      const msg = data.toString();
      if (msg.includes("CDP server")) {
        clearTimeout(timeout);
        resolve();
      }
    });

    obscuraProcess.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

async function stopObscura() {
  if (browser) {
    await browser.close().catch(() => {});
    browser = null;
  }
  if (obscuraProcess) {
    obscuraProcess.kill();
    obscuraProcess = null;
  }
}

async function createPage() {
  if (!browser) {
    browser = await puppeteer.connect({
      browserWSEndpoint: `ws://127.0.0.1:${CDP_PORT}/devtools/browser`,
    });
  }
  return browser.newPage();
}

function getDevServerUrl() {
  return process.env.DEV_SERVER_URL || DEV_SERVER_URL;
}

module.exports = { startObscura, stopObscura, createPage, getDevServerUrl };
