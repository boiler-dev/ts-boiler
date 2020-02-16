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
  const actions = []
  const tsConfigRefs = []

  const oneType = answers.tsBuildTypes.length === 1

  if (answers.tsBuildTypes.includes("cjs")) {
    tsConfigRefs.push("./src/tsconfig" + (oneType ? "" : ".cjs") + ".json")
    actions.push({
      action: "write",
      path: join(destDir, "src/tsconfig" + (oneType ? "" : ".cjs") + ".json"),
      source: JSON.stringify({
        "compilerOptions": {
          "composite": true,
          "module": "commonjs",
          "outDir": "../dist" + (oneType ? "" : "/cjs"),
          "rootDir": ".",
          "target": "es5"
        },
        "extends": "../tsconfig.base.json"
      })
    })
  }

  if (answers.tsBuildTypes.includes("esm")) {
    tsConfigRefs.push("./src/tsconfig" + (oneType ? "" : ".esm") + ".json")
    actions.push({
      action: "write",
      path: join(destDir, "src/tsconfig" + (oneType ? "" : ".esm") + ".json"),
      source: JSON.stringify({
        "compilerOptions": {
          "composite": true,
          "module": "es2015",
          "outDir": "../dist" + (oneType ? "" : "/esm"),
          "rootDir": ".",
          "target": "es5"
        },
        "extends": "../tsconfig-base.json"
      })
    })
  }
  
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
        "references": tsConfigRefs
      },
      null,
      2
    )
  })

  return actions
}
