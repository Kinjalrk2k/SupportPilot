from dotenv import load_dotenv
import os
from workflow.utils import str_to_bool
from phoenix.otel import register

load_dotenv()
ENABLE_TRACING = str_to_bool(os.getenv("ENABLE_TRACING", "false"))
PHOENIX_TRACING_URL = os.getenv("PHOENIX_TRACING_URL")

if ENABLE_TRACING:
    tracer_provider = register(
        project_name="support_pilot_agent",
        endpoint=PHOENIX_TRACING_URL,
        auto_instrument=True,
    )
