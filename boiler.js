const boiler = require("boiler-dev")

module.exports.setupBoiler = function ({ destDir }) {
  const pkgNames = [
    "typescript",
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser"
  ]
  return boiler.npm.install(destDir, pkgNames)
    .then(function ({ code, out }) {
      if (code === 0) {
        console.log("✅ Installed npm modules:", pkgNames)
      } else {
        console.error("🚨 Failed to install npm modules:", pkgNames)
        console.error(out)
      }
    })
}

module.exports.installBoiler = function ({ destDir, files }) {
  return files.map(function (file) {
    if (file.name === "tsconfig.base.json") {
      return {
        action: "write",
        path: join(destDir, file.name),
        source: file.source,
      }
    }
  })
}
