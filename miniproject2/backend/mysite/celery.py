import os
import logging
from celery import Celery
from celery.signals import after_setup_logger, worker_process_init

# Set up logging
logger = logging.getLogger(__name__)

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite.settings')

app = Celery('mysite')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

@worker_process_init.connect
def setup_worker(**kwargs):
    # Configure logging for worker processes
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('celery_worker.log'),
            logging.StreamHandler()
        ]
    )

@after_setup_logger.connect
def setup_loggers(logger, *args, **kwargs):
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Add file handler
    fh = logging.FileHandler('celery.log')
    fh.setFormatter(formatter)
    logger.addHandler(fh)
    
    # Set log level to DEBUG for more detailed information
    logger.setLevel(logging.DEBUG)

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    logger.info(f'Request: {self.request!r}')