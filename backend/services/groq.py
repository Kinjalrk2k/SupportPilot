from langchain.chat_models import init_chat_model
from langchain.agents import create_agent
from langchain.messages import AnyMessage, AIMessage
from dotenv import load_dotenv

load_dotenv()

model = init_chat_model(model="llama-3.1-8b-instant", model_provider="groq")
agent = create_agent(model=model)

def generate_reply(messages: list[AnyMessage]) -> AIMessage:
    response = agent.invoke({"messages": messages})
    return response["messages"][-1]