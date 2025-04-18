from celery import shared_task
import time

@shared_task
def process_sales_order(order_id):
    time.sleep(5)  # Simulate a delay
    return f"Sales Order {order_id} processed successfully!"
