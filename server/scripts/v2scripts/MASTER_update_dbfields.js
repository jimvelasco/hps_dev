import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scripts = [
  "createUnitTable.js",
  "populateUnitTable.js",
  "copyUnitPincodes.js",
  "removeUserParkingFields.js",
  "copyRenterVehicleOwnerType.js",
  "copyUnitnumberToPincodevalue.js"
];

const serverDirectory = fileURLToPath(new URL("../../", import.meta.url));

for (const script of scripts) {
  console.log(`Running ${script}`);
  const result = spawnSync(process.execPath, [fileURLToPath(new URL(script, import.meta.url))], {
    cwd: serverDirectory,
    stdio: "inherit"
  });

  if (result.error) {
    console.error(`Failed to run ${script}:`, result.error);
    process.exitCode = 1;
    break;
  }

  if (result.status !== 0) {
    console.error(`${script} failed${result.signal ? ` with signal ${result.signal}` : ` with exit code ${result.status}`}`);
    process.exitCode = result.status || 1;
    break;
  }
}
