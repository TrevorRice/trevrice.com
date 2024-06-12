module.exports = (eleventyConfig) => {
  eleventyConfig.addPassthroughCopy("src/**/*")

  return {
    dir: {
      input: "src"
    }
  }
}
