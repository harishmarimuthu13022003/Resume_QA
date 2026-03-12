from pypdf import PdfReader

def extract_text_from_pdf(file_path):
    print(f"Reading PDF from: {file_path}")
    reader = PdfReader(file_path)
    text = ""

    for page in reader.pages:
        content = page.extract_text()
        if content:
            text += content
    
    print(f"Extracted {len(text)} characters from PDF")
    return text