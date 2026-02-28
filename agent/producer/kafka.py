from confluent_kafka import Producer
from dotenv import load_dotenv
import os
import json

load_dotenv()

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS")
KAFKA_CLIENT_ID = os.getenv("KAFKA_CLIENT_ID")

TOPIC_CATEGORIZATION = "ticket_categorization_events"
TOPIC_MESSAGES = "chat_messages_events"

KAFKA_CONFIG = {
    "bootstrap.servers": KAFKA_BOOTSTRAP_SERVERS,
    "client.id": KAFKA_CLIENT_ID,
}

producer = Producer(KAFKA_CONFIG)


def publish_to_kafka(topic: str, key: str, payload: dict):
    try:
        producer.produce(
            topic=topic,
            key=key.encode("utf-8"),
            value=json.dumps(payload).encode("utf-8"),
        )
        producer.poll(0)
        producer.flush()
    except Exception as e:
        print(f"[KAFKA ERROR] Failed to publish to {topic}: {e}")
