const boiler = require("boiler-dev")
const { join } = require("path")

module.exports.setupBoiler = function ({ destDir }) {
  const pkgNames = ["typescript"]
  return boiler.npm.install(destDir, pkgNames, { saveDev: true })
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
    const dotCjs = oneType ? "" : ".cjs"

    tsConfigRefs.push("./src/tsconfig" + dotCjs + ".json")
    
    actions.push({
      action: "write",
      path: join(destDir, "src/tsconfig" + dotCjs + ".json"),
      source: {
        "compilerOptions": {
          "composite": true,
          "module": "commonjs",
          "outDir": "../dist" + (oneType ? "" : "/cjs"),
          "rootDir": ".",
          "target": "es5"
        },
        "extends": "../tsconfig.base.json"
      }
    })
  }

  if (answers.tsBuildTypes.includes("esm")) {
    const dotEsm = oneType ? "" : ".esm"

    tsConfigRefs.push("./src/tsconfig" + dotEsm + ".json")

    actions.push({
      action: "write",
      path: join(destDir, "src/tsconfig" + dotEsm + ".json"),
      source: {
        "compilerOptions": {
          "composite": true,
          "module": "es2015",
          "outDir": "../dist" + (oneType ? "" : "/esm"),
          "rootDir": ".",
          "target": "es5"
        },
        "extends": "../tsconfig-base.json"
      }
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
    source: {
      "compileOnSave": true,
      "extends": "./tsconfig.base.json",
      "files": [],
      "references": tsConfigRefs.map(path => ({ path }))
    }
  })

  return actions
}
