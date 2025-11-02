# UMD Testudo Course Scraper

This Python web scraper extracts course information from the UMD Testudo Schedule of Classes.

## Setup

1. Create a virtual environment (recommended):

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Usage

### Test Mode (CMSC only):

```bash
python scraper.py --test
```

### Full Scrape (All 172+ course prefixes):

```bash
python scraper.py
```

This will:

- Scrape course information from UMD Testudo for all 172+ course prefixes
- Extract course sections, names, credits, restrictions, prerequisites, and summaries
- Save the data to `classes.json`

**Note:** A full scrape can take 30+ minutes due to rate limiting.

## Output Format

The scraper generates a JSON file with the following structure:

```json
[
  {
    "course_section": "CMSC100",
    "course_name": "Bits and Bytes of Computer and Information Sciences",
    "credits": "1",
    "restrictions": "For first time freshmen and first time transfer students; or permission of CMNS-Computer Science department.",
    "prerequisites": "None",
    "summary": "Students are introduced to the fields (and disciplines) of computer science and information science within a small classroom setting..."
  }
]
```

## Configuration

You can modify the `scraper.py` file to:

- Change the term (currently set to "Spring 2026")
- Add more course prefixes to scrape
- Adjust rate limiting delays
- Modify the output format

## Notes

- The scraper includes rate limiting to be respectful to UMD's servers
- Some fields may be "N/A" if not found on the page
- The scraper handles common errors gracefully
