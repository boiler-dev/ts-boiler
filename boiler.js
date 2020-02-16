const boiler = require("boiler-dev")
const { join } = require("path")

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

module.exports.promptBoiler = function () {
  return [{
    type: "checkbox",
    name: "tsBuildTypes",
    message: "typescript build types",
    choices: [
      { name: "commonjs (cjs)", value: "cjs" },
      { name: "es2015 (esm)", value: "esm" }
    ],
    default: function () {
      return ["cjs"]
    }
  }]
}

module.exports.installBoiler = function ({ answers, destDir, files }) {
  let actions = []

  console.log(answers)
  
  files.forEach(function (file) {
    if (file.name === "tsconfig.base.json") {
      actions.push({
        action: "write",
        path: join(destDir, file.name),
        source: file.source,
      })
    }
  })

  actions.push({
    action: "write",
    path: join(destDir, "tsconfig.json"),
    source: JSON.stringify(
      {
        "compileOnSave": true,
        "extends": "./tsconfig.base.json",
        "files": [],
        "references": []
      },
      null,
      2
    )
  })

  return actions
}
