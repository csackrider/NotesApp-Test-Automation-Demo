import * as fs from "node:fs";


export async function reSeedData() {
    try {
        const data = fs.readFileSync("./tests/resources/seedData.json", 'utf-8');
        const jsonData = JSON.parse(data);
        const jsonString = JSON.stringify(jsonData, null, 2);
        fs.writeFileSync("./server/db.json", jsonString);
    } catch (error) {
        console.error('Error copying JSON data:', error.message);
    }
}




