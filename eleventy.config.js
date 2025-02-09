import pluginRss from "@11ty/eleventy-plugin-rss";
import { lorekeeper } from "./src/_data/lorekeeper.js";

export default function (eleventyConfig) {
  eleventyConfig.setServerOptions({
    watch: ['_site/**/*.css'],
  });

  eleventyConfig.addPassthroughCopy({
    './node_modules/alpinejs/dist/cdn.js': './js/alpine.js',
  })

  eleventyConfig.addBundle("js");

	eleventyConfig.addCollection("feed", lorekeeper);

  eleventyConfig.addPlugin(pluginRss);

  return {
    dir: {
      input: "src",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data"
    }
  };
}
