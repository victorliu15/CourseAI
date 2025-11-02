import requests
from bs4 import BeautifulSoup
import json
import time
import re

class TestudoScraper:
    def __init__(self, term_code="202601"):
        """
        Initialize scraper with term code
        Term codes: 202601 = Spring 2026, 202508 = Fall 2025, etc.
        """
        self.term_code = term_code
        self.base_url = "https://app.testudo.umd.edu/soc/"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        self.courses = []
        
    def scrape_course_page(self, prefix):
        url = f"{self.base_url}{self.term_code}/{prefix}"
        
        try:
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            full_text = soup.get_text()
            course_matches = list(re.finditer(r'([A-Z]{2,5})(\d{3,4})', full_text))
            
            courses_found = 0
            processed_sections = set()
            
            for i, match in enumerate(course_matches):
                course_code = match.group(0)
                if not course_code.startswith(prefix):
                    continue
                
                if course_code in processed_sections:
                    continue
                
                processed_sections.add(course_code)
                
                start_pos = match.start()
                
                next_pos = len(full_text)
                if i + 1 < len(course_matches):
                    next_match = course_matches[i + 1]
                    if next_match.group(0).startswith(prefix):
                        next_pos = next_match.start()
                
                course_text = full_text[start_pos:next_pos]
                
                course_data = self.parse_course_text(course_text, course_code)
                if course_data:
                    self.courses.append(course_data)
                    courses_found += 1
            
            print(f"Found {courses_found} courses")
            time.sleep(1.5)
            
        except Exception as e:
            print(f"Error: {e}")
    
    def parse_course_text(self, text, course_code):
        """Parse individual course information from a text block"""
        try:
            lines = text.split('\n')
            
            course_name = "N/A"
            after_code = False
            for i, line in enumerate(lines):
                stripped = line.strip()
                if after_code and stripped and stripped != '':
                    if 'Credits' not in stripped and 'Syllabus' not in stripped:
                        course_name = stripped
                        break
                if course_code in stripped:
                    after_code = True
            
            credits_match = re.search(r'Credits:\s*(\d+)', text)
            credits = credits_match.group(1) if credits_match else "N/A"
            
            restriction_match = re.search(r'Restriction:\s*(.+?)(?=\n\*\*|\n[A-Z]|$)', text, re.DOTALL)
            restrictions = "None"
            if restriction_match:
                restrictions = restriction_match.group(1).strip()
                restrictions = re.sub(r'\s+', ' ', restrictions)
                restrictions = restrictions.replace('Cross-listed', '').strip()
            
            prereq_match = re.search(r'Prerequisite:\s*(.+?)(?=\n\*\*|\n[A-Z]|$)', text, re.DOTALL)
            prerequisites = "None"
            if prereq_match:
                prerequisites = prereq_match.group(1).strip()
                prerequisites = re.sub(r'\s+', ' ', prerequisites)
            summary = "N/A"
            show_sections_pos = text.find('Show Sections')
            if show_sections_pos > 0:
                desc_text = text[:show_sections_pos]
                last_metadata_pos = max(
                    desc_text.rfind('Restriction:'),
                    desc_text.rfind('Prerequisite:'),
                    desc_text.rfind('Credit only granted')
                )
                
                if last_metadata_pos > 0:
                    desc_text = desc_text[last_metadata_pos:]
                    desc_lines = desc_text.split('\n')
                    desc_started = False
                    desc_sentences = []
                    
                    for line in desc_lines[2:]:
                        stripped = line.strip()
                        if len(stripped) > 20:
                            desc_started = True
                            desc_sentences.append(stripped)
                        elif desc_started and len(stripped) < 5:
                            break
                    
                    if desc_sentences:
                        summary = ' '.join(desc_sentences[:5])
                        summary = re.sub(r'\s+', ' ', summary).strip()
            if course_name == "N/A":
                return None
            
            return {
                "course_section": course_code,
                "course_name": course_name,
                "credits": credits,
                "restrictions": restrictions,
                "prerequisites": prerequisites,
                "summary": summary
            }
            
        except Exception as e:
            print(f"\nError parsing course {course_code}: {e}")
            return None
    
    def scrape_all_courses(self, prefixes=None):
        if prefixes is None:
            prefixes = [
                "AAAS", "AAST", "ABRM", "AGNR", "AGST", "AMSC", "AMST", "ANSC", "ANTH", "AOSC",
                "ARAB", "ARCH", "AREC", "ARHU", "ARMY", "ARSC", "ARTH", "ARTT", "ASTR", "BCHM",
                "BDBA", "BIOE", "BIOI", "BIOL", "BIOM", "BIPH", "BISI", "BMGT", "BMIN", "BMSO",
                "BSCI", "BSOS", "BSST", "BUAC", "BUDT", "BUFN", "BULM", "BUMK", "BUSI", "BUSM",
                "BUSO", "CBMG", "CCJS", "CHBE", "CHEM", "CHIN", "CHPH", "CHSE", "CINE", "CLAS",
                "CLFS", "CMLT", "CMSC", "COMM", "CPBE", "CPCV", "CPDJ", "CPET", "CPGH", "CPJT",
                "CPMS", "CPPL", "CPSA", "CPSF", "CPSG", "CPSN", "CPSP", "CPSS", "DANC", "DATA",
                "ECON", "EDCP", "EDDI", "EDHD", "EDHI", "EDSP", "EDUC", "EMBA", "ENAE", "ENAI",
                "ENBC", "ENCE", "ENCO", "ENEB", "ENED", "ENEE", "ENES", "ENFP", "ENGL", "ENMA",
                "ENME", "ENPM", "ENRE", "ENSE", "ENSP", "ENST", "ENTM", "ENTS", "ENVH", "EPIB",
                "FGSM", "FIRE", "FMSC", "FREN", "GBHL", "GEMS", "GEOG", "GEOL", "GERS", "GFPL",
                "GREK", "GVPT", "HACS", "HBUS", "HDCC", "HEBR", "HESI", "HESP", "HGLO", "HHUM",
                "HISP", "HIST", "HLSA", "HLSC", "HLTH", "HNUH", "HONR", "IDEA", "IMDM", "IMMR",
                "INAG", "INFM", "INST", "ISRL", "ITAL", "JAPN", "JOUR", "JWST", "KNES", "KORA",
                "LACS", "LARC", "LATN", "LBSC", "LEAD", "LGBT", "LING", "MAIT", "MATH", "MEES",
                "MIEH", "MITH", "MLAW", "MSAI", "MSML", "MSQC", "MUED", "MUSC", "NACS", "NAVY",
                "NEUR", "NFSC", "NIAP", "NIAV", "PEER", "PERS", "PHIL", "PHPE", "PHSC", "PHYS",
                "PLCY", "PLSC", "PORT", "PSYC", "QMMS", "RDEV", "RELS", "RUSS", "SDSB", "SDSI",
                "SLAA", "SLLC", "SMLP", "SOCY", "SPAN", "SPHL", "STAT", "SURV", "TDPS", "THET",
                "TLPL", "TLTC", "UMEI", "UNIV", "URSP", "USLT", "VIPS", "VMSC", "WEID", "WGSS"
            ]
        
        print(f"\nScraping {len(prefixes)} course prefixes...")
        print("=" * 60)
        
        for i, prefix in enumerate(prefixes, 1):
            print(f"[{i}/{len(prefixes)}] ", end="")
            self.scrape_course_page(prefix)
        
        print("=" * 60)
        print(f"\nScraping complete! Total courses found: {len(self.courses)}")
        return self.courses
    
    def save_to_json(self, filename="classes.json"):
        """Save scraped courses to JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.courses, f, indent=2, ensure_ascii=False)
        print(f"Saved {len(self.courses)} courses to {filename}")

def main():
    import sys
    scraper = TestudoScraper(term_code="202601")
    print("This will scrape ALL UMD courses and may take 30+ minutes.")
    print("Press Ctrl+C to cancel, or wait 5 seconds to continue...")
    import time
    time.sleep(5)
    scraper.scrape_all_courses()
    
    scraper.save_to_json("classes.json")
    
    print("\nDone!")

if __name__ == "__main__":
    main()
