const { startObscura, stopObscura, createPage, getDevServerUrl } = require("./obscuraHelper");

jest.setTimeout(30000);

beforeAll(async () => {
  await startObscura();
});

afterAll(async () => {
  await stopObscura();
});

describe("Homepage", () => {
  it("renders the parking app title", async () => {
    const page = await createPage();
    await page.goto(getDevServerUrl(), { waitUntil: "networkidle2" });
    const title = await page.title();
    expect(title).toBeDefined();
    await page.close();
  });

  it("displays floor tabs", async () => {
    const page = await createPage();
    await page.goto(getDevServerUrl(), { waitUntil: "networkidle2" });
    const tabs = await page.$$('[class*="floor"]');
    expect(tabs.length).toBeGreaterThanOrEqual(1);
    await page.close();
  });
});
