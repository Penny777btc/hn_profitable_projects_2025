/**
 * Fetch placeholder images from Lorem Picsum (more reliable)
 * Then match them with projects based on color themes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Projects that need images with their color themes
const projectsNeedingImages = [
    { year: '2024', name: 'Grubbux', tag: 'Fintech', picsum_id: 1011 },      // Blue tech
    { year: '2024', name: 'Online Solitaire', tag: 'Gaming', picsum_id: 1025 },  // Green nature
    { year: '2024', name: 'Typing Test', tag: 'Utility', picsum_id: 180 },   // Minimal desk
    { year: '2024', name: 'SqlTool', tag: 'DevTools', picsum_id: 0 },        // Computer
    { year: '2024', name: 'Simple Analytics', tag: 'Analytics', picsum_id: 1021 }, // Data
    { year: '2023', name: 'Typenine', tag: 'iOS App', picsum_id: 160 },      // Phone
    { year: '2023', name: 'Mockup tool', tag: 'Design', picsum_id: 1001 },   // Design
    { year: '2023', name: 'Form Tool', tag: 'SaaS', picsum_id: 1002 },       // Tech
    { year: '2023', name: 'Screenshot API', tag: 'API', picsum_id: 1003 },   // Code
    { year: '2023', name: 'Monitoring Tool', tag: 'DevOps', picsum_id: 1004 }, // Server
    { year: '2023', name: 'Personal Finance', tag: 'Fintech', picsum_id: 1005 },
    { year: '2023', name: 'Job Board', tag: 'Jobs', picsum_id: 1006 },
    { year: '2022', name: 'FPGA Jobs', tag: 'Jobs', picsum_id: 1007 },
    { year: '2022', name: 'MessageDuck', tag: 'Marketing', picsum_id: 1008 },
    { year: '2022', name: 'Bodyweight Fitness', tag: 'Fitness', picsum_id: 1009 },
    { year: '2021', name: 'Fitloop', tag: 'Fitness', picsum_id: 1010 },
    { year: '2021', name: 'Down For Everyone', tag: 'Utility', picsum_id: 1012 },
    { year: '2021', name: 'MicroAcquisitions', tag: 'Education', picsum_id: 1013 },
    { year: '2020', name: 'UserTrack', tag: 'Analytics', picsum_id: 1014 },
    { year: '2020', name: 'Panelbear', tag: 'Analytics', picsum_id: 1015 },
    { year: '2019', name: 'Fine Word Clocks', tag: 'Hardware', picsum_id: 1016 },
    { year: '2019', name: 'BattPrices', tag: 'Affiliate', picsum_id: 1017 },
    { year: '2019', name: 'TinyTask', tag: 'Utility', picsum_id: 1018 },
    { year: '2018', name: 'MarketGod', tag: 'Finance', picsum_id: 1019 },
    { year: '2018', name: 'Status Page', tag: 'SaaS', picsum_id: 1020 },
    { year: '2017', name: 'Startup Ideas', tag: 'Education', picsum_id: 1022 },
    { year: '2017', name: 'Shopify App', tag: 'Shopify', picsum_id: 1023 },
    { year: '2017', name: 'Voice Call Club', tag: 'Community', picsum_id: 1024 },
];

function downloadImage(project) {
    const safeName = project.name.toLowerCase().replace(/\s+/g, '');
    const filename = `${project.year}_${safeName}.jpg`;
    const filepath = path.join(__dirname, 'assets', 'img', filename);

    // Lorem Picsum URL with grayscale for consistent look
    const url = `https://picsum.photos/id/${project.picsum_id}/800/500`;

    console.log(`📥 ${project.name}`);

    try {
        execSync(`curl -L -s -o "${filepath}" "${url}"`, { timeout: 15000 });

        const stats = fs.statSync(filepath);
        if (stats.size > 5000) {
            console.log(`   ✅ ${filename} (${Math.round(stats.size / 1024)}KB)`);
            return { success: true, filename: `assets/img/${filename}`, project };
        } else {
            console.log(`   ⚠️ Too small, skipping`);
            return null;
        }
    } catch (error) {
        console.log(`   ❌ Failed`);
        return null;
    }
}

async function main() {
    console.log('🖼️  Downloading Images from Lorem Picsum\n');
    console.log('═'.repeat(50));

    const imgDir = path.join(__dirname, 'assets', 'img');
    if (!fs.existsSync(imgDir)) {
        fs.mkdirSync(imgDir, { recursive: true });
    }

    const results = [];

    for (const project of projectsNeedingImages) {
        const result = downloadImage(project);
        if (result) results.push(result);
        await new Promise(r => setTimeout(r, 300));
    }

    console.log('\n' + '═'.repeat(50));
    console.log(`\n📊 Downloaded: ${results.length}/${projectsNeedingImages.length} images`);

    if (results.length > 0) {
        console.log('\n📋 Add to data.js:');
        results.slice(0, 10).forEach(r => {
            console.log(`   { name: "${r.project.name}", img: "${r.filename}" }`);
        });
        if (results.length > 10) console.log(`   ... and ${results.length - 10} more`);
    }
}

main();
