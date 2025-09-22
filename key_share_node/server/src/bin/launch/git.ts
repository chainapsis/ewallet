import { execSync } from "child_process";

export function getGitCommitHash(): string | null {
  try {
    // Execute the git command to get the short commit hash of HEAD
    const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
    return commitHash;
  } catch (err: any) {
    console.error("Error getting Git commit hash:", err.message);

    return null;
  }
}
