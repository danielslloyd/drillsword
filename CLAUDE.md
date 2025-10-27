# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Drillsword** is a web-based Bible verse memorization and quiz application. Users are shown a Bible verse and must identify the book, chapter, and verse reference. The application supports multiple difficulty levels and languages including English (ESV), Greek (Koine), Hebrew, and Latin (Vulgata Clementina).

## Architecture

### Core Components

1. **Main Application** ([index.html](index.html))
   - Single-page application with vanilla JavaScript (ES6 modules)
   - No build system or package manager
   - Skeleton CSS framework for responsive layout

2. **Data Files**
   - `bible_obj.js` - Bible metadata (66 books with chapter/verse counts, ESV omitted verses list)
   - `easy_med.js` - Pre-loaded ESV verses for easy/medium difficulty (50 verses for easy, ~500 for medium)
   - `greek.js` - Koine Greek New Testament verses (SBLGNT text)
   - `hebrew.js` - Hebrew Old Testament verses (WLC text)
   - `latin.js` - Latin Vulgate verses (Vulgata Clementina, 31,434 verses)
   - `rec_obj.js` - Book recommendations (Amazon links) for each Bible book
   - `chapters/` - Pre-fetched verse data in JSON format, organized as `BBBCCC.json` (e.g., `001001.json` for Genesis 1)

3. **Verse Indexing System**
   - 9-digit format: `BBBCCCVVV` (book, chapter, verse with zero-padding)
   - Example: `043003016` = John 3:16 (book 43, chapter 3, verse 16)
   - Hash function for URL sharing: reverses hex representation with offset

### Data Flow

1. **Difficulty Modes**:
   - Easy (diff=1): Use pre-loaded `easy_med.js` data (50 verses)
   - Medium (diff=2): Use pre-loaded `easy_med.js` data (~500 verses)
   - Hard (diff=3): Fetch from ESV API (`https://api.esv.org/v3/passage/text/`)
   - Greek (diff=4): Lazy-load `greek.js` via dynamic imports when first selected
   - Hebrew (diff=5): Lazy-load `hebrew.js` via dynamic imports when first selected
   - Latin (diff=6): Lazy-load `latin.js` via dynamic imports when first selected

2. **Scoring Algorithm** ([index.html:525-542](index.html#L525-L542))
   - Uses verse distance calculation (accounts for verse position in entire Bible)
   - Score formula: `max(0, floor((10000 - distance^1.5) / 100))`
   - Career score persists via cookies

3. **URL Sharing**
   - Uses `?v=` parameter with hashed verse index
   - Hash function at [index.html:274-282](index.html#L274-L282)

## Development

### No Build Process

This is a static HTML/CSS/JS application:
- Open [index.html](index.html) directly in browser for local development
- No compilation, transpilation, or bundling required
- ES6 modules loaded via `<script type="module">`

### Testing Locally

1. Use a local web server to avoid CORS issues:
   ```bash
   python -m http.server 8000
   # or
   npx serve .
   ```
2. Navigate to `http://localhost:8000`
3. Greek/Hebrew modes require the respective data files to be present

### API Integration

- **ESV API** (Hard mode only):
  - API key embedded in code: `5f5ae66881bd4ab25ee64e64c6cec8e4903182bf`
  - Endpoint: `https://api.esv.org/v3/passage/text/`
  - Parameters: `include-passage-references=false`, `include-verse-numbers=false`, etc.

### Fonts

- **English/ESV**: Amiri, GFS Didot, Frank Ruhl Libre (Google Fonts)
- **Greek**: GFS Didot (primary)
- **Hebrew**: Frank Ruhl Libre (primary)
- Font file included: `GentiumBookPlus-Regular.woff2`

## Key Implementation Details

### Verse Data Structure

```javascript
{
  "canonical": "John 3:16",
  "passages": ["verse text here"],
  "query": "043003016"
}
```

### Chapter JSON Files

- Located in `chapters/` directory
- Format: `BBBCCC.json` (e.g., `001001.json` = Genesis 1)
- Contains all verses for that chapter with Hebrew/Greek text
- Structure: `{"query":"BBBCCC", "verses":[{}, {verse1}, {verse2}, ...]}`

### Validation

- `isValid()` function checks if verse index is within Bible bounds
- Handles ESV omitted verses (textual variants not in ESV)
- List in `bible_obj.js` line 68

### Book Recommendations

- Amazon affiliate links stored in `rec_obj.js`
- Displayed based on current verse's book
- Random selection from available recommendations for that book

## Important Notes

- **Cookie Storage**: Career scores stored in `document.cookie` (no expiration set)
- **Inline JavaScript**: All application logic in `<script type="module">` block starting at [index.html:137](index.html#L137)
- **Timer Feature**: Hidden by default, tracks time for each verse (max 30 seconds)
- **Attribution**:
  - SBLGNT Greek text requires attribution per license (commented in code)
  - Vulgata Clementina is Public Domain
- **Vulgate XML**: `SF_2014-02-26_LAT_VULGHETZENAUER_(VULGATA CLEMENTINA HETZENAUER EDITORE).xml` - source file for Latin mode
  - Parsed by `parse_vulgate.js` to generate `latin.js`
  - Only includes 66 Protestant canon books (deuterocanonical books excluded)

## File Organization

```
drillsword/
├── index.html          # Main application (HTML + JS)
├── bible_obj.js        # Bible structure metadata
├── easy_med.js         # Pre-loaded ESV verses
├── greek.js            # Greek NT (lazy-loaded, ~4.5MB)
├── hebrew.js           # Hebrew OT (lazy-loaded, ~4.3MB)
├── latin.js            # Latin Vulgate (lazy-loaded, ~5.4MB)
├── rec_obj.js          # Book recommendations
├── chapters/           # Pre-fetched verse JSON files (Hebrew/Greek)
├── parse_vulgate.js    # Script to generate latin.js from XML
├── SF_2014-02-26_LAT_VULGHETZENAUER_*.xml  # Source Vulgate XML
├── css/
│   ├── normalize.css
│   └── skeleton.css
├── images/             # UI icons and images
├── .htaccess           # Apache config for hosting
└── GentiumBookPlus-Regular.woff2  # Font file
```

## Regenerating Latin Data

If you need to regenerate the `latin.js` file from the Vulgate XML:

```bash
node parse_vulgate.js
```

This will:
- Parse the Vulgata Clementina XML file
- Extract all 66 Protestant canon books (skipping deuterocanonical books)
- Generate `latin.js` with 31,434 verses in the correct format
- Map book names (handles "Psalm" vs "Psalms" naming difference)
