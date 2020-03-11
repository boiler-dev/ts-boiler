import { join } from "path"
import { ActionBoiler, PromptBoiler } from "boiler-dev"

export const prompt: PromptBoiler = async () => {
  return [
    {
      type: "checkbox",
      name: "tsBuildTypes",
      message: "typescript build types",
      choices: [
        { name: "commonjs (cjs)", value: "cjs" },
        { name: "es2015 (esm)", value: "esm" },
      ],
      default: (): any => ["cjs"],
    },
  ]
}

export const install: ActionBoiler = async () => {
  const actions = []

  actions.push({
    action: "npmInstall",
    dev: true,
    source: ["@types/node", "typescript"],
  })

  return actions
}

export const generate: ActionBoiler = async ({
  answers,
  cwdPath,
  files,
}) => {
  const actions = []
  const tsConfigRefs = []

  const oneType = answers.tsBuildTypes.length === 1

  tsConfigRefs.push("./boiler/tsconfig.json")

  actions.push({
    action: "write",
    path: "boiler/tsconfig.json",
    source: {
      compilerOptions: {
        composite: true,
        module: "commonjs",
        outDir: "../dist/boiler",
        rootDir: ".",
        target: "es5",
      },
      extends: "../tsconfig.base.json",
    },
  })

  if (answers.tsBuildTypes.includes("cjs")) {
    const dotCjs = oneType ? "" : ".cjs"

    tsConfigRefs.push("./src/tsconfig" + dotCjs + ".json")

    actions.push({
      action: "write",
      path: "src/tsconfig" + dotCjs + ".json",
      source: {
        compilerOptions: {
          composite: true,
          module: "commonjs",
          outDir: "../dist/src",
          rootDir: ".",
          target: "es5",
        },
        extends: "../tsconfig.base.json",
      },
    })
  }

  if (answers.tsBuildTypes.includes("esm")) {
    const dotEsm = oneType ? "" : ".esm"

    tsConfigRefs.push("./src/tsconfig" + dotEsm + ".json")

    actions.push({
      action: "write",
      path: "src/tsconfig" + dotEsm + ".json",
      source: {
        compilerOptions: {
          composite: true,
          module: "es2015",
          outDir: "../dist/src" + (oneType ? "" : "-esm"),
          rootDir: ".",
          target: "es5",
        },
        extends: "../tsconfig.base.json",
      },
    })
  }

  actions.push({
    action: "write",
    path: "tsconfig.base.json",
    sourcePath: "tsconfig.base.json",
  })

  actions.push({
    action: "write",
    path: "tsconfig.json",
    source: {
      compileOnSave: true,
      extends: "./tsconfig.base.json",
      files: [],
      references: tsConfigRefs.map(path => ({ path })),
    },
  })

  actions.push({
    action: "merge",
    path: "package.json",
    source: {
      scripts: {
        build: "tsc -b",
        watch: "tsc -b -w",
      },
    },
  })

  return actions
}
