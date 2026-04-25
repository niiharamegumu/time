import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const nextArg = process.argv[2];

const packageJsonPath = path.join(root, "package.json");
const packageLockPath = path.join(root, "package-lock.json");
const cargoTomlPath = path.join(root, "src-tauri", "Cargo.toml");
const cargoLockPath = path.join(root, "src-tauri", "Cargo.lock");
const tauriConfigPath = path.join(root, "src-tauri", "tauri.conf.json");

const semverPattern = /^(\d+)\.(\d+)\.(\d+)$/;
const bumpTypes = new Set(["major", "minor", "patch"]);

function usage() {
  console.error("Usage: npm run version:bump -- <major|minor|patch|x.y.z>");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function parseVersion(version) {
  const match = version.match(semverPattern);

  if (!match) {
    throw new Error(`Unsupported version "${version}". Use x.y.z format.`);
  }

  return match.slice(1).map(Number);
}

function resolveNextVersion(currentVersion, target) {
  if (!target) {
    usage();
    process.exit(1);
  }

  if (semverPattern.test(target)) {
    return target;
  }

  if (!bumpTypes.has(target)) {
    usage();
    throw new Error(`Unsupported bump target "${target}".`);
  }

  const [major, minor, patch] = parseVersion(currentVersion);

  if (target === "major") {
    return `${major + 1}.0.0`;
  }

  if (target === "minor") {
    return `${major}.${minor + 1}.0`;
  }

  return `${major}.${minor}.${patch + 1}`;
}

function updateCargoToml(version) {
  const cargoToml = fs.readFileSync(cargoTomlPath, "utf8");
  let foundPackageVersion = false;
  const nextCargoToml = cargoToml.replace(
    /(^version\s*=\s*")([^"]+)(")/m,
    (_match, prefix, _currentVersion, suffix) => {
      foundPackageVersion = true;
      return `${prefix}${version}${suffix}`;
    },
  );

  if (!foundPackageVersion) {
    throw new Error("Could not find package version in src-tauri/Cargo.toml.");
  }

  fs.writeFileSync(cargoTomlPath, nextCargoToml);
}

function updateCargoLock(version) {
  if (!fs.existsSync(cargoLockPath)) {
    return;
  }

  const cargoLock = fs.readFileSync(cargoLockPath, "utf8");
  let foundRootPackage = false;
  const nextCargoLock = cargoLock.replace(
    /(\[\[package\]\]\nname = "time"\nversion = ")([^"]+)(")/,
    (_match, prefix, _currentVersion, suffix) => {
      foundRootPackage = true;
      return `${prefix}${version}${suffix}`;
    },
  );

  if (!foundRootPackage) {
    throw new Error("Could not find root package version in src-tauri/Cargo.lock.");
  }

  fs.writeFileSync(cargoLockPath, nextCargoLock);
}

function updateTauriConfig(version) {
  const tauriConfig = fs.readFileSync(tauriConfigPath, "utf8");
  JSON.parse(tauriConfig);

  let foundVersion = false;
  const nextTauriConfig = tauriConfig.replace(
    /(^\s*"version"\s*:\s*")([^"]+)(")/m,
    (_match, prefix, _currentVersion, suffix) => {
      foundVersion = true;
      return `${prefix}${version}${suffix}`;
    },
  );

  if (!foundVersion) {
    throw new Error("Could not find version in src-tauri/tauri.conf.json.");
  }

  fs.writeFileSync(tauriConfigPath, nextTauriConfig);
}

const packageJson = readJson(packageJsonPath);
const nextVersion = resolveNextVersion(packageJson.version, nextArg);

packageJson.version = nextVersion;
writeJson(packageJsonPath, packageJson);

const packageLock = readJson(packageLockPath);
packageLock.version = nextVersion;

if (packageLock.packages?.[""]) {
  packageLock.packages[""].version = nextVersion;
}

writeJson(packageLockPath, packageLock);

updateTauriConfig(nextVersion);
updateCargoToml(nextVersion);
updateCargoLock(nextVersion);

console.log(`Version bumped to ${nextVersion}`);
