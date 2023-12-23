export default function requiredEnvVar(key: string): string {
  if (!process.env[key]) {
    throw new Error(
      `Please set ${key} in env vars. (Did you export vars for your env to .env?)`,
    );
  }
  return process.env[key]!;
}
