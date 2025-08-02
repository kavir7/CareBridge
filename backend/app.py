import google.generativeai as genai
import PIL.Image
import os

class SimpleTextExtractor:
    def __init__(self, api_key: str):
        # Set up the Gemini API connection
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    def extract_all_text(self, image_path: str) -> str:
        # Read text from prescription image
        try:
            image = PIL.Image.open(image_path)
            
            # Tell the AI what we want
            prompt = """Extract all text from this prescription image. 
            Get everything you can see - names, dates, numbers, addresses, everything.
            Just return the text, no extra formatting."""
            
            response = self.model.generate_content([prompt, image])
            return response.text.strip()
            
        except FileNotFoundError:
            return "ERROR: Can't find the image file"
        except Exception as e:
            return f"ERROR: Something went wrong - {str(e)}"
    
    def find_specific_info(self, all_text: str, what_to_find: str) -> str:
        # Look for specific information in the extracted text
        try:
            prompt = f"""Look through this prescription text and find the {what_to_find}.
            
            Text from prescription:
            {all_text}
            
            Just give me the {what_to_find}, nothing else."""
            
            response = self.model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            return f"ERROR: {str(e)}"