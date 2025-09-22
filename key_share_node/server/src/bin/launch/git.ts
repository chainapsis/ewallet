import { execSync } from "child_process";

export function getGitCommitHash(): string | null {
  try {
    const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
    return commitHash;
  } catch (err: any) {
    console.error("Error getting Git commit hash:", err.message);

    return null;
  }
}
