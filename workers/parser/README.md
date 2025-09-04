# Resume Parser Worker (Optional)

This directory contains an optional Python-based resume parser worker that can provide more sophisticated document parsing capabilities.

## Overview

While the main application includes a basic text-based resume parser, this Python worker offers:
- PDF parsing with PyMuPDF
- Advanced text extraction
- Better skill detection
- Enhanced data normalization

## Setup (Optional)

If you want to use the Python parser:

### 1. Install Dependencies
```bash
cd workers/parser
pip install -r requirements.txt
```

### 2. Requirements.txt
```
fastapi==0.104.1
uvicorn==0.24.0
PyMuPDF==1.23.9
python-multipart==0.0.6
pydantic==2.5.0
```

### 3. Basic Implementation
```python
# main.py
from fastapi import FastAPI, UploadFile, File
import fitz  # PyMuPDF
import re

app = FastAPI()

@app.post("/parse")
async def parse_resume(file: UploadFile = File(...)):
    # Read PDF
    pdf_document = fitz.open(stream=await file.read(), filetype="pdf")
    text = ""
    
    for page_num in range(pdf_document.page_count):
        page = pdf_document[page_num]
        text += page.get_text()
    
    # Extract information
    result = extract_resume_data(text)
    
    return result

def extract_resume_data(text: str):
    # Enhanced extraction logic
    email = extract_email(text)
    phone = extract_phone(text)
    skills = extract_skills(text)
    experience = extract_experience(text)
    
    return {
        "text": text,
        "email": email,
        "phone": phone,
        "skills": skills,
        "experience_years": experience
    }
```

### 4. Run the Worker
```bash
uvicorn main:app --host 0.0.0.0 --port 8001
```

### 5. Update Main App
Update the main application to use the Python worker:

```typescript
// In app/api/tools/parse-resume/route.ts
if (file_url && !resume_text) {
  // Send to Python worker
  const response = await fetch('http://localhost:8001/parse', {
    method: 'POST',
    body: formData // with file
  })
  const parsed = await response.json()
  textToParse = parsed.text
  // Use parsed.email, parsed.skills, etc.
}
```

## Why Optional?

This worker is optional because:
1. **Simplicity**: The main app works without it using text input
2. **Deployment**: No need for Python runtime in basic setup
3. **Cost**: Reduces infrastructure complexity
4. **Development**: Faster iteration with TypeScript-only stack

## When to Use

Consider the Python worker when you need:
- Bulk PDF processing
- Higher accuracy skill extraction
- Complex document layouts
- Integration with existing Python ML pipelines

## Alternative Approaches

Instead of a Python worker, you could:
1. **Client-side**: Use PDF.js for browser-based parsing
2. **Serverless**: Deploy Python functions on Vercel/AWS Lambda
3. **Third-party**: Use services like Textract or ParseHub
4. **Hybrid**: Basic parsing in TypeScript, complex cases in Python

The main application is designed to work well with any of these approaches!
