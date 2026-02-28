from confluent_kafka import Consumer
from dotenv import load_dotenv
import os
import json

load_dotenv()

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS")
KAFKA_GROUP_ID = os.getenv("KAFKA_GROUP_ID")

TOPIC_CATEGORIZATION = "ticket_categorization_events"
TOPIC_MESSAGES = "chat_messages_events"

TOPICS_TO_LISTEN = [TOPIC_CATEGORIZATION, TOPIC_MESSAGES]

KAFKA_CONFIG = {
    "bootstrap.servers": KAFKA_BOOTSTRAP_SERVERS,
    "group.id": KAFKA_GROUP_ID,  # Identifies this consumer cluster
    "auto.offset.reset": "earliest",  # Read from the beginning if no previous offset exists
    "enable.auto.commit": True,  # Automatically acknowledge processed messages
}

consumer = Consumer(KAFKA_CONFIG)
