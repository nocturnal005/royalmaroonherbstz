import fs from 'fs';
import path from 'path';

const stagingDir = path.resolve("public/images/staging");

const toRemove = [
  "ZOZ_1978.JPG", "ZOZ_1980.JPG", "ZOZ_1991.JPG", "ZOZ_2009.JPG",
  "ZOZ_2017.JPG", "ZOZ_2021.JPG", "ZOZ_2023.JPG", "ZOZ_2025.JPG",
  "ZOZ_2029.JPG", "ZOZ_2033.JPG", "ZOZ_2039.JPG", "ZOZ_2047.JPG",
  "ZOZ_2061.JPG", "ZOZ_2067.JPG", "ZOZ_2072.JPG", "ZOZ_2089.JPG",
  "ZOZ_2098.JPG", "ZOZ_2109.JPG", "ZOZ_2115.JPG", "ZOZ_2127.JPG",
  "ZOZ_2131.JPG", "ZOZ_2132.JPG", "ZOZ_2135.JPG", "ZOZ_2139.JPG",
  "ZOZ_2152.JPG", "ZOZ_2155.JPG", "ZOZ_2158.JPG", "ZOZ_2169.JPG",
  "ZOZ_2172.JPG", "ZOZ_2202.JPG", "ZOZ_2203.JPG", "ZOZ_2210.JPG",
  "ZOZ_2219.JPG", "ZOZ_2225.JPG", "ZOZ_2233.JPG", "ZOZ_2236.JPG",
  "ZOZ_2243.JPG", "ZOZ_2245.JPG", "ZOZ_2262.JPG", "ZOZ_2263.JPG",
  "ZOZ_2887.JPG", "ZOZ_2889.JPG", "ZOZ_2890.JPG", "ZOZ_2907.JPG",
  "ZOZ_2914.JPG", "ZOZ_2915.JPG", "ZOZ_2916.JPG", "ZOZ_2920.JPG"
];

let removed = 0;
for (const file of toRemove) {
  const filePath = path.join(stagingDir, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    removed++;
    console.log(`Removed: ${file}`);
  } else {
    console.log(`Not found (already removed): ${file}`);
  }
}

console.log(`\nRemoved ${removed} of ${toRemove.length} files.`);

// Update manifest
const remaining = fs.readdirSync(stagingDir).filter(f => f.endsWith('.JPG') || f.endsWith('.jpg'));
fs.writeFileSync('src/data/stagingImages.json', JSON.stringify(remaining, null, 2));
console.log(`Manifest updated: ${remaining.length} images remain.`);
