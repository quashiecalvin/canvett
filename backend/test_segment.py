from services.parser import parse_resume
from services.segmenter import segment_resume

text = parse_resume("CV.pdf")
sections = segment_resume(text)

for name, content in sections.items():
    print(f"=== {name.upper()} ===")
    print(content[:200])
    print()
