import { defineConfig } from "@playwright/test";

export default defineConfig({

  testDir: "./tests",

  timeout: 30000,

  use: {

    headless: true,

    baseURL: "http://127.0.0.1:3333",

    screenshot: "only-on-failure",

    video: "retain-on-failure",
  },
});