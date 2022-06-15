// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");
const path = require("path");

/** @type {import("@docusaurus/types").Config} */
const config = {
  title: "react-true-resizable",
  tagline: "A modern Resizable React Component",
  // tagline: "Resizeable Components for React that work as you would expect",
  url: "https://your-docusaurus-test-site.com",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "eliav2", // Usually your GitHub org/user name.
  projectName: "react-true-resizable", // Usually your repo name.

  plugins: [
    // "my-loaders", // loader required for html
    // [
    //   "docusaurus-plugin-react-docgen",
    //   {
    //     // src: ["../src/**/*.ts?(x)"],
    //     src: ["../dist/types/**/*.d.*"],
    //     route: {
    //       path: "/docs/api/resizable",
    //       component: require.resolve("../dist/react-true-resizable.es.js"),
    //       // component: require.resolve("../src/Resizable.tsx"),
    //       exact: true,
    //     },
    //   },
    // ],
    // [
    //   "docusaurus-plugin-react-docgen-typescript",
    //   {
    //     src: ["../src/**/*.ts?(x)"],
    //     // src: ["../dist/types/**/*.d.*"],
    //     global: true,
    //     tsConfig: path.resolve(__dirname, "..", "tsconfig.dev.json"),
    //     parserOptions: {
    //       // pass parserOptions to react-docgen-typescript
    //       // here is a good starting point which filters out all
    //       // types from react
    //       propFilter: (prop, component) => {
    //         if (prop.parent) {
    //           return !prop.parent.fileName.includes("@types/react");
    //         }
    //
    //         return true;
    //       },
    //     },
    //   },
    // ],
  ],

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  themes: ["@docusaurus/theme-live-codeblock"],

  presets: [
    [
      "classic",
      /** @type {import("@docusaurus/preset-classic").Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/Eliav2/react-true-resizable",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/Eliav2/react-true-resizable",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import("@docusaurus/preset-classic").ThemeConfig} */
    ({
      docs: {
        sidebar: {
          autoCollapseCategories: true,
          hideable: true,
        },
      },
      navbar: {
        title: "react-true-resizable",
        items: [
          {
            type: "doc",
            docId: "quick-start",
            position: "left",
            label: "Docs",
          },
          {
            href: "https://github.com/Eliav2/react-true-resizable",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          // {
          //   title: "Docs",
          //   items: [
          //     {
          //       label: "Tutorial",
          //       to: "/docs/intro",
          //     },
          //   ],
          // },
          {
            title: "Community",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/Eliav2/react-true-resizable",
                // href: "https://stackoverflow.com/questions/tagged/docusaurus",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()}`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
