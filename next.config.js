const { parsed: localEnv } = require("dotenv").config();

const webpack = require("webpack");
console.log(
  "JSON.stringify(process.env.SHOPIFY_API_KEY)",
  JSON.stringify(process.env.SHOPIFY_API_KEY)
);
const apiKey = JSON.stringify(process.env.SHOPIFY_API_KEY);

module.exports = {
  webpack: (config) => {
    const env = { API_KEY: apiKey };
    config.plugins.push(new webpack.DefinePlugin(env));

    // Add ESM support for .mjs files in webpack 4
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    return config;
  },
};
