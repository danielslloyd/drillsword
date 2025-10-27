#!/usr/bin/env python3
"""Parse Vulgate XML and generate latin.js file"""

import xml.etree.ElementTree as ET
import json

# Book name mapping from Vulgate to standard Protestant canon numbering
# We'll only use the 66 Protestant canon books for compatibility
BOOK_MAP = {
    "Genesis": 1, "Exodus": 2, "Leviticus": 3, "Numbers": 4, "Deuteronomy": 5,
    "Joshua": 6, "Judges": 7, "Ruth": 8, "1 Samuel": 9, "2 Samuel": 10,
    "1 Kings": 11, "2 Kings": 12, "1 Chronicles": 13, "2 Chronicles": 14,
    "Ezra": 15, "Nehemiah": 16, "Esther": 17, "Job": 18, "Psalms": 19,
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
}

def parse_vulgate(xml_file):
    """Parse Vulgate XML and extract verses"""
    tree = ET.parse(xml_file)
    root = tree.getroot()

    verses = [{}]  # Start with empty object at index 0

    for book in root.findall('BIBLEBOOK'):
        book_name = book.get('bname')

        # Skip deuterocanonical books not in Protestant canon
        if book_name not in BOOK_MAP:
            print(f"Skipping {book_name} (not in Protestant canon)")
            continue

        book_num = BOOK_MAP[book_name]
        print(f"Processing {book_name} (book {book_num})")

        for chapter in book.findall('CHAPTER'):
            chapter_num = int(chapter.get('cnumber'))

            for vers in chapter.findall('VERS'):
                verse_num = int(vers.get('vnumber'))
                verse_text = vers.text or ""

                # Create verse query in BBBCCCVVV format
                query = f"{book_num:03d}{chapter_num:03d}{verse_num:03d}"

                # Create canonical reference
                canonical = f"{book_name} {chapter_num}:{verse_num}"

                verse_obj = {
                    "canonical": canonical,
                    "passages": [verse_text],
                    "query": query
                }

                verses.append(verse_obj)

    return verses

def main():
    xml_file = "SF_2014-02-26_LAT_VULGHETZENAUER_(VULGATA CLEMENTINA HETZENAUER EDITORE).xml"

    print("Parsing Vulgate XML...")
    verses = parse_vulgate(xml_file)
    print(f"Extracted {len(verses) - 1} verses")

    # Generate JavaScript file
    js_content = "var latin = {   \"verses\" : "
    js_content += json.dumps(verses, ensure_ascii=False, indent=0)
    js_content += "\n};\nexport default latin;"

    with open("latin.js", "w", encoding="utf-8") as f:
        f.write(js_content)

    print("Generated latin.js successfully!")
    print(f"Sample verse: {verses[1]}")

if __name__ == "__main__":
    main()
