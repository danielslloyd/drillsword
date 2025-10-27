#!/usr/bin/env node
/**
 * Parse Vulgate XML and generate latin.js file
 * Run with: node parse_vulgate.js
 */

const fs = require('fs');

// Book name mapping from Vulgate to standard Protestant canon numbering
const BOOK_MAP = {
    "Genesis": 1, "Exodus": 2, "Leviticus": 3, "Numbers": 4, "Deuteronomy": 5,
    "Joshua": 6, "Judges": 7, "Ruth": 8, "1 Samuel": 9, "2 Samuel": 10,
    "1 Kings": 11, "2 Kings": 12, "1 Chronicles": 13, "2 Chronicles": 14,
    "Ezra": 15, "Nehemiah": 16, "Esther": 17, "Job": 18, "Psalm": 19, "Psalms": 19,
    "Proverbs": 20, "Ecclesiastes": 21, "Song of Solomon": 22, "Isaiah": 23,
    "Jeremiah": 24, "Lamentations": 25, "Ezekiel": 26, "Daniel": 27,
    "Hosea": 28, "Joel": 29, "Amos": 30, "Obadiah": 31, "Jonah": 32,
    "Micah": 33, "Nahum": 34, "Habakkuk": 35, "Zephaniah": 36, "Haggai": 37,
    "Zechariah": 38, "Malachi": 39, "Matthew": 40, "Mark": 41, "Luke": 42,
    "John": 43, "Acts": 44, "Romans": 45, "1 Corinthians": 46, "2 Corinthians": 47,
    "Galatians": 48, "Ephesians": 49, "Philippians": 50, "Colossians": 51,
    "1 Thessalonians": 52, "2 Thessalonians": 53, "1 Timothy": 54, "2 Timothy": 55,
    "Titus": 56, "Philemon": 57, "Hebrews": 58, "James": 59, "1 Peter": 60,
    "2 Peter": 61, "1 John": 62, "2 John": 63, "3 John": 64, "Jude": 65,
    "Revelation": 66
};

function parseVulgate(xmlContent) {
    const verses = [{}]; // Start with empty object at index 0

    // Simple regex-based XML parsing (good enough for this structured format)
    const bookRegex = /<BIBLEBOOK[^>]*bname="([^"]+)"[^>]*>([\s\S]*?)<\/BIBLEBOOK>/g;

    let bookMatch;
    while ((bookMatch = bookRegex.exec(xmlContent)) !== null) {
        const bookName = bookMatch[1];
        const bookContent = bookMatch[2];

        // Skip deuterocanonical books not in Protestant canon
        if (!BOOK_MAP[bookName]) {
            console.log(`Skipping ${bookName} (not in Protestant canon)`);
            continue;
        }

        const bookNum = BOOK_MAP[bookName];
        console.log(`Processing ${bookName} (book ${bookNum})`);

        // Parse chapters
        const chapterRegex = /<CHAPTER[^>]*cnumber="(\d+)"[^>]*>([\s\S]*?)<\/CHAPTER>/g;

        let chapterMatch;
        while ((chapterMatch = chapterRegex.exec(bookContent)) !== null) {
            const chapterNum = parseInt(chapterMatch[1]);
            const chapterContent = chapterMatch[2];

            // Parse verses
            const verseRegex = /<VERS[^>]*vnumber="(\d+)"[^>]*>([\s\S]*?)<\/VERS>/g;

            let verseMatch;
            while ((verseMatch = verseRegex.exec(chapterContent)) !== null) {
                const verseNum = parseInt(verseMatch[1]);
                const verseText = verseMatch[2].trim();

                // Create verse query in BBBCCCVVV format
                const query = String(bookNum).padStart(3, '0') +
                             String(chapterNum).padStart(3, '0') +
                             String(verseNum).padStart(3, '0');

                // Create canonical reference (use "Psalms" for display)
                const displayName = bookName === "Psalm" ? "Psalms" : bookName;
                const canonical = `${displayName} ${chapterNum}:${verseNum}`;

                const verseObj = {
                    canonical: canonical,
                    passages: [verseText],
                    query: query
                };

                verses.push(verseObj);
            }
        }
    }

    return verses;
}

function main() {
    const xmlFile = "SF_2014-02-26_LAT_VULGHETZENAUER_(VULGATA CLEMENTINA HETZENAUER EDITORE).xml";

    console.log("Reading Vulgate XML...");
    const xmlContent = fs.readFileSync(xmlFile, 'utf-8');

    console.log("Parsing Vulgate XML...");
    const verses = parseVulgate(xmlContent);
    console.log(`Extracted ${verses.length - 1} verses`);

    // Generate JavaScript file
    const jsContent = `var latin = {   "verses" : ${JSON.stringify(verses, null, 0)}\n};\nexport default latin;`;

    fs.writeFileSync("latin.js", jsContent, 'utf-8');

    console.log("Generated latin.js successfully!");
    console.log(`Sample verse:`, verses[1]);
}

main();
