"""
Celery application factory.

Creates a Celery instance wired to Flask's app context
so tasks can access Flask extensions (mongo, config, etc).
"""
from celery import Celery
from src.config import Config


def make_celery(app=None):
    """
    Create a Celery instance.
    
    If a Flask app is provided, configures Celery to run tasks
    within the Flask application context (required for MongoDB access).
    """
    celery = Celery(
        'eventify',
        broker=Config.CELERY_BROKER_URL,
        backend=Config.CELERY_RESULT_BACKEND,
    )

    celery.conf.update(
        # Serialization
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        timezone='UTC',
        enable_utc=True,

        # Optimization for Free Plan
        task_always_eager=Config.CELERY_TASK_ALWAYS_EAGER,
        task_eager_propagates=True,

        # Retry defaults
        task_acks_late=True,                  # Ack AFTER task completes (prevents message loss on crash)
        task_reject_on_worker_lost=True,      # Requeue if worker dies mid-task
        worker_prefetch_multiplier=1,         # Don't hoard tasks — fair distribution

        # Result expiry
        result_expires=3600,                  # Results expire after 1 hour

        # Task routes — organize by priority
        task_routes={
            'src.tasks.email_tasks.*': {'queue': 'emails'},
            'src.tasks.ticket_tasks.*': {'queue': 'tickets'},
        },

        # Default queue for unrouted tasks
        task_default_queue='default',
    )

    if app:
        # Wrap task execution in Flask app context
        class ContextTask(celery.Task):
            abstract = True

            def __call__(self, *args, **kwargs):
                with app.app_context():
                    return self.run(*args, **kwargs)

        celery.Task = ContextTask

    return celery


# Create a standalone instance for worker startup
# (worker process runs `celery -A src.celery_app:celery worker`)
celery = make_celery()
