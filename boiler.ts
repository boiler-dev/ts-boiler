import { join } from "path"
import {
  GenerateBoiler,
  PromptBoiler,
  InstallBoiler,
} from "boiler-dev"

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

export const install: InstallBoiler = async () => {
  const actions = []

  actions.push({
    action: "npmInstall",
    dev: true,
    source: ["@types/node", "typescript"],
  })

  return actions
}

export const generate: GenerateBoiler = async ({
  answers,
  cwdPath,
  files,
}) => {
  const actions = []
  const tsConfigRefs = []

  const oneType = answers.tsBuildTypes.length === 1

  if (answers.tsBuildTypes.includes("cjs")) {
    const dotCjs = oneType ? "" : ".cjs"

    tsConfigRefs.push("./src/tsconfig" + dotCjs + ".json")

    actions.push({
      action: "write",
      path: join(
        cwdPath,
        "src/tsconfig" + dotCjs + ".json"
      ),
      source: {
        compilerOptions: {
          composite: true,
          module: "commonjs",
          outDir: "../dist" + (oneType ? "" : "/cjs"),
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
      path: join(
        cwdPath,
        "src/tsconfig" + dotEsm + ".json"
      ),
      source: {
        compilerOptions: {
          composite: true,
          module: "es2015",
          outDir: "../dist" + (oneType ? "" : "/esm"),
          rootDir: ".",
          target: "es5",
        },
        extends: "../tsconfig-base.json",
      },
    })
  }

  for (const file of files) {
    if (file.name === "tsconfig.base.json") {
      actions.push({
        action: "write",
        path: join(cwdPath, file.name),
        source: file.source,
      })
    }
  }

  actions.push({
    action: "write",
    path: join(cwdPath, "tsconfig.json"),
    source: {
      compileOnSave: true,
      extends: "./tsconfig.base.json",
      files: [],
      references: tsConfigRefs.map(path => ({ path })),
    },
  })

  actions.push({
    action: "merge",
    path: join(cwdPath, "package.json"),
    source: {
      scripts: {
        build: "tsc -b",
        watch: "tsc -b -w",
      },
    },
  })

  return actions
}
