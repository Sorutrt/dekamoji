const execPath = process.execPath.replaceAll("\\", "/");

if (!execPath.includes("/mise/installs/node/")) {
  console.error("This project must be run through mise.");
  console.error("Use: mise exec -- <command>");
  console.error(`Current node: ${process.execPath}`);
  process.exit(1);
}
