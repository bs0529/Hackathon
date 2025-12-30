import fs from 'fs';
import path from 'path';

const dataDir = 'meis_data'; // Adjusted path relative to cwd
const output = 'src/fishData.js';

const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'file_list.json');
const fishList = [];

files.forEach(file => {
    try {
        const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
        const json = JSON.parse(content);
        if (json.ovrGlbFileNm) {
            // Check for 2D image
            const fishName = json.ovrLvbNm;
            // Mac filenames might be NFD, so let's handle normalization if needed. 
            // We will look for a file that *contains* the fish name in the images directory.
            const imageDir = 'public/assets/images';
            let image2d = '/fs.png'; // Default

            try {
                if (!fs.existsSync(imageDir)) {
                    // skip
                } else {
                    const manualImages = fs.readdirSync(imageDir);
                    // Normalize both for comparison
                    const target = `sticker_${fishName}.png`.normalize('NFC');
                    const found = manualImages.find(img => img.normalize('NFC') === target);
                    if (found) {
                        image2d = `/assets/images/${found}`;
                    }
                }
            } catch (e) {
                console.log("Error checking images", e);
            }

            fishList.push({
                name: fishName,
                model: `/assets/models/${json.ovrGlbFileNm}`,
                image2d: image2d,
                description: json.ovrStleDstcftCn || "정보 없음"
            });
        }
    } catch (err) {
        console.error(`Error parsing ${file}:`, err);
    }
});

const fileContent = `export const fishData = ${JSON.stringify(fishList, null, 2)};`;

fs.writeFileSync(output, fileContent);
console.log(`Generated ${output} with ${fishList.length} fish.`);
