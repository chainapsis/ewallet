import { spawnSync } from "node:child_process";

import { paths } from "../paths";
import { expectSuccess } from "../expect";

export async function publish(..._args: any[]) {
  console.log("Start publishing packages...");

  console.log(
    `1. Ensure you have "npm login"-ed in the first place. \
It's "npm login", not "yarn npm login".
2. git remote "origin" needs to be set up in case you use an alias.
3. Do "yarn ci version" first
`,
  );

  const publishRet = spawnSync(
    "yarn",
    ["lerna", "publish", "from-package", "--loglevel", "verbose"],
    {
      cwd: paths.root,
      stdio: "inherit",
    },
  );

  expectSuccess(publishRet, "publish failed");
}
