import chromadb
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv
import os

load_dotenv()

CHROMA_DB_HOST = os.getenv("CHROMA_DB_HOST")
CHROMA_DB_PORT = os.getenv("CHROMA_DB_PORT")

chroma_client = chromadb.HttpClient(host=CHROMA_DB_HOST, port=CHROMA_DB_PORT)
embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-small-en-v1.5",
    cache_folder="./hf_cache" 
)

vector_db = Chroma(
    client=chroma_client,
    collection_name="support_policies",
    embedding_function=embeddings
)

CHUNK_SIZE = 1500
CHUNK_OVERLAP = 200
