import requests
import json
from workflow.state import AgentState
from dotenv import load_dotenv
import os

load_dotenv()
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL")


def fetch_order_data(state: AgentState):
    order_id = state.get("order_id")

    if not order_id:
        return {"order_context": "No relevant order details found"}

    response = requests.get(f"{BACKEND_BASE_URL}/orders/{order_id}")
    data = response.json()
    return {"order_context": json.dumps(data)}
