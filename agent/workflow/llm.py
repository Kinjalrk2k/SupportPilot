from langchain.chat_models import init_chat_model

llm = init_chat_model(model="llama-3.1-8b-instant", model_provider="groq")
