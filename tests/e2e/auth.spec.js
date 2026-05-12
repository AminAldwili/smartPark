const { startObscura, stopObscura, createPage, getDevServerUrl } = require("./obscuraHelper");

jest.setTimeout(60000);

const ADMIN_EMAIL = "ameenaldwili@gmail.com";
const ADMIN_PASSWORD = "1234567891";

beforeAll(async () => {
  await startObscura();
});

afterAll(async () => {
  await stopObscura();
});

describe("Auth Flow", () => {
  it("renders login form on /account page", async () => {
    const page = await createPage();
    await page.goto(getDevServerUrl() + "/account", { waitUntil: "networkidle2" });
    await page.waitForSelector("input[type=email]");
    await page.waitForSelector("input[type=password]");
    const btn = await page.$('button[type="submit"]');
    expect(btn).not.toBeNull();
    await page.close();
  });

  it("logs in as admin and redirects to dashboard", async () => {
    const page = await createPage();
    await page.goto(getDevServerUrl() + "/account", { waitUntil: "networkidle2" });

    await page.type("input[type=email]", ADMIN_EMAIL);
    await page.type("input[type=password]", ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard", { timeout: 10000 });
    const heading = await page.$eval("h2", (el) => el.textContent);
    expect(heading).toContain("لوحة التحكم");
    await page.close();
  });

  it("shows users table on dashboard", async () => {
    const page = await createPage();
    await page.goto(getDevServerUrl() + "/account", { waitUntil: "networkidle2" });

    await page.type("input[type=email]", ADMIN_EMAIL);
    await page.type("input[type=password]", ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard", { timeout: 10000 });
    await page.waitForSelector("table");
    const rows = await page.$$("table tbody tr");
    expect(rows.length).toBeGreaterThanOrEqual(1);
    await page.close();
  });

  it("logs out and redirects to /account", async () => {
    const page = await createPage();
    await page.goto(getDevServerUrl() + "/account", { waitUntil: "networkidle2" });

    await page.type("input[type=email]", ADMIN_EMAIL);
    await page.type("input[type=password]", ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 10000 });

    await page.click("text=تسجيل الخروج");
    await page.waitForURL("**/account", { timeout: 10000 });
    await page.close();
  });
});
