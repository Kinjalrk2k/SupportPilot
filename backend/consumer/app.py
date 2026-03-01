from .kafka import (
    consumer,
    TOPICS_TO_LISTEN,
    TOPIC_MESSAGES,
    TOPIC_CATEGORIZATION,
)
from confluent_kafka import KafkaError, KafkaException
import json
from .handlers import (
    handle_chat_messages_events,
    handle_ticket_categorization_events,
)
from config.db import SessionLocal
import traceback


def start_consumer():
    consumer.subscribe(TOPICS_TO_LISTEN)
    print(f"Consumer started. Listening to: {TOPICS_TO_LISTEN}")

    try:
        while True:
            msg = consumer.poll(timeout=1.0)

            if msg is None:
                continue

            if msg.error():
                if msg.error().code == KafkaError._PARTITION_EOF:
                    continue  # not a real error
                else:
                    raise KafkaException(msg.error())

            topic_name = msg.topic()
            raw_value = msg.value().decode("utf-8")

            try:
                payload = json.loads(raw_value)
                with SessionLocal() as db:
                    if topic_name == TOPIC_CATEGORIZATION:
                        handle_ticket_categorization_events(payload, db)

                    elif topic_name == TOPIC_MESSAGES:
                        handle_chat_messages_events(payload, db)

                    else:
                        print(f"Received message from unknown topic: {topic_name}")

            except json.JSONDecodeError:
                print(f"Failed to parse JSON from topic {topic_name}: {raw_value}")

            except Exception as e:
                traceback.print_exc()

    except KeyboardInterrupt:
        print("Shutting down consumer gracefully")
    finally:
        # Close down consumer to commit final offsets and leave the group cleanly
        consumer.close()
