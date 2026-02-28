from langgraph.checkpoint.redis.aio import AsyncRedisSaver
from workflow.graph import workflow
import time
from langchain_core.messages import HumanMessage
import json
from dotenv import load_dotenv
import os
from pydantic import BaseModel
from producer.kafka import publish_to_kafka, TOPIC_MESSAGES, TOPIC_CATEGORIZATION

load_dotenv()
REDIS_URI = os.getenv("REDIS_URI")


async def get_agent_history(thread_id: str):
    async with AsyncRedisSaver.from_conn_string(REDIS_URI) as checkpointer:
        await checkpointer.setup()  # first time setting up

        agent = workflow.compile(checkpointer=checkpointer)
        config = {"configurable": {"thread_id": thread_id}}
        state = await agent.aget_state(config)

        return state
