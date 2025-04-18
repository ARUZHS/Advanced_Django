import os
import logging
import spacy
import pymupdf4llm
from docx import Document
from celery import shared_task
from resumes.models import Resume
import time
from .models import ResumeFeedback
import traceback

# Set up logging
logger = logging.getLogger(__name__)

try:
    nlp = spacy.load('en_core_web_sm')
    logger.info("Successfully loaded spaCy model")
except Exception as e:
    logger.error(f"Failed to load spaCy model: {str(e)}")
    logger.error(traceback.format_exc())
    raise

# Load skills from file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILLS_FILE = os.path.join(BASE_DIR, 'resumes', 'skills.txt')

try:
    with open(SKILLS_FILE, 'r') as f:
        SKILLS = {line.strip().lower() for line in f if line.strip()}
    logger.info(f"Successfully loaded {len(SKILLS)} skills from {SKILLS_FILE}")
except Exception as e:
    logger.error(f"Failed to load skills file: {str(e)}")
    logger.error(traceback.format_exc())
    SKILLS = set()  # Fallback to empty set

@shared_task(bind=True, max_retries=3)
def process_resume(self, resume_id):
    try:
        logger.info(f"Starting resume processing for resume_id: {resume_id}")
        resume = Resume.objects.get(id=resume_id)
        file_path = resume.file.path
        logger.info(f"Processing file: {file_path}")

        # Extract raw text
        if file_path.endswith('.pdf'):
            logger.info("Processing PDF file")
            doc = pymupdf4llm.to_markdown(file_path)
            raw_text = doc
        elif file_path.endswith('.docx'):
            logger.info("Processing DOCX file")
            doc = Document(file_path)
            raw_text = '\n'.join(paragraph.text for paragraph in doc.paragraphs)
        else:
            logger.error(f"Unsupported file type: {file_path}")
            return

        # Clean text
        logger.info("Cleaning text")
        cleaned_text = ' '.join(word for word in raw_text.split() if word.strip())
        cleaned_text = ''.join(char for char in cleaned_text if char.isprintable())

        # Extract skills
        logger.info("Extracting skills")
        text_lower = cleaned_text.lower()
        words = set(text_lower.split())
        skills = [skill for skill in SKILLS if skill in words]

        # spaCy processing
        try:
            logger.info("Running spaCy analysis")
            doc = nlp(text_lower)
            extra_entities = [ent.text for ent in doc.ents if ent.label_ in ['SKILLS']]
            skills.extend(extra_entities)
        except Exception as e:
            logger.error(f"Error in spaCy processing: {str(e)}")
            logger.error(traceback.format_exc())

        extracted_data = {
            'skills': list(set(skills)),
            'text': cleaned_text[:5000],
        }

        resume.extracted_data = extracted_data
        resume.processed = True
        resume.save()
        logger.info(f"Successfully processed resume {resume_id}")

    except Exception as e:
        logger.error(f"Error processing resume {resume_id}: {str(e)}")
        logger.error(traceback.format_exc())
        # Retry the task with exponential backoff
        self.retry(exc=e, countdown=2 ** self.request.retries)

@shared_task(bind=True, max_retries=3)
def generate_resume_feedback(self, feedback_id):
    try:
        logger.info(f"Starting feedback generation for feedback_id: {feedback_id}")
        feedback = ResumeFeedback.objects.get(id=feedback_id)
        
        # Simulate processing time
        time.sleep(2)  # Reduced from 10 to 2 seconds
        
        # Mock feedback content instead of calling OpenAI
        mock_feedback = {
            "strengths": [
                "Strong technical background",
                "Good project experience",
                "Clear communication skills"
            ],
            "improvements": [
                "Add more quantifiable achievements",
                "Include relevant certifications",
                "Expand on leadership experience"
            ],
            "skill_gaps": [
                "Cloud computing platforms",
                "DevOps tools",
                "Agile methodologies"
            ],
            "recommendations": [
                "Add metrics to project descriptions",
                "Include any relevant certifications",
                "Highlight team leadership experiences"
            ]
        }
        
        # Update the feedback object with mock data
        feedback.content = mock_feedback
        feedback.status = 'completed'
        feedback.save()
        logger.info(f"Successfully generated mock feedback for {feedback_id}")
        
        return True
    except Exception as e:
        logger.error(f"Error generating feedback for {feedback_id}: {str(e)}")
        logger.error(traceback.format_exc())
        # Update feedback status to failed
        try:
            feedback = ResumeFeedback.objects.get(id=feedback_id)
            feedback.status = 'failed'
            feedback.save()
        except Exception as save_error:
            logger.error(f"Failed to update feedback status: {str(save_error)}")
            logger.error(traceback.format_exc())
        # Retry the task with exponential backoff
        self.retry(exc=e, countdown=2 ** self.request.retries)