// Raises the Android app's version on every APK build, so each build installs as an update:
// versionCode goes up by 1 and versionName's last number goes up by 1 (1.2 -> 1.3).
import { readFileSync, writeFileSync } from 'node:fs';

const file = new URL('../android/app/build.gradle', import.meta.url);
let gradle = readFileSync(file, 'utf8');
const code = Number(gradle.match(/versionCode (\d+)/)[1]) + 1;
const name = gradle
  .match(/versionName "([^"]+)"/)[1]
  .replace(/(\d+)$/, (n) => String(Number(n) + 1));
gradle = gradle.replace(/versionCode \d+/, `versionCode ${code}`).replace(/versionName "[^"]+"/, `versionName "${name}"`);
writeFileSync(file, gradle);
console.log(`Android app version ${name} (code ${code})`);
