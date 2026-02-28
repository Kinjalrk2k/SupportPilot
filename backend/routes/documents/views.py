from fastapi import FastAPI, UploadFile, File, HTTPException, APIRouter
from fastapi.responses import JSONResponse
import chromadb
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import MarkdownHeaderTextSplitter, MarkdownTextSplitter
from langchain_core.documents import Document
from .schemas import DocumentListResponse, StandardResponse
from config.chroma_db import vector_db, CHUNK_SIZE, CHUNK_OVERLAP

router = APIRouter()


def process_markdown_file(content: str, filename: str):
    """Splits markdown and tags every chunk with the filename."""
    headers_to_split_on = [
        ("#", "Header 1"),
        ("##", "Header 2"),
        ("###", "Header 3"),
        ("####", "Header 4"),
        ("#####", "Header 5"),
    ]
    markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
    
    # Initial split by headers
    header_splits = markdown_splitter.split_text(content)
    
    # Fallback split for large tables/paragraphs
    text_splitter = MarkdownTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
    final_chunks = text_splitter.split_documents(header_splits)
    
    # Tag EVERY chunk with the filename so we can find/delete it later
    for chunk in final_chunks:
        chunk.metadata["source"] = filename
        
    return final_chunks


@router.post("/")
async def upload_document(file: UploadFile = File(...)):
    """CREATE: Upload a new markdown file and embed it."""
    if not file.filename.endswith(".md"):
        raise HTTPException(status_code=400, detail="Only .md files are supported.")
    
    # Read the file
    content_bytes = await file.read()
    content_str = content_bytes.decode("utf-8")
    
    # Process and split
    chunks = process_markdown_file(content_str, file.filename)
    
    # Add to ChromaDB
    vector_db.add_documents(chunks)
    
    return {"message": f"Successfully ingested '{file.filename}' into {len(chunks)} chunks."}


@router.get("/", response_model=DocumentListResponse)
async def list_documents():
    """READ: List all unique files currently in the database."""
    # We query the underlying Chroma collection for all metadata
    collection = vector_db._collection
    results = collection.get(include=["metadatas"])
    
    if not results or not results["metadatas"]:
        return {"documents": []}
    
    # Extract unique filenames from the metadata
    unique_files = set()
    for metadata in results["metadatas"]:
        if "source" in metadata:
            unique_files.add(metadata["source"])
            
    return {"documents": list(unique_files)}


@router.delete("/{filename}", response_model=StandardResponse)
async def delete_document(filename: str):
    """DELETE: Remove a file entirely from the database."""
    collection = vector_db._collection
    
    # Delete all chunks where the metadata 'source' matches the filename
    try:
        collection.delete(where={"source": filename})
        return {"message": f"Successfully deleted all chunks for '{filename}'."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete: {str(e)}")


@router.put("/{filename}", response_model=StandardResponse)
async def update_document(filename: str, file: UploadFile = File(...)):
    """UPDATE: Replaces an existing file with a new version."""
    if file.filename != filename:
        raise HTTPException(status_code=400, detail="URL filename must match uploaded filename.")
    
    # 1. Delete the old chunks
    collection = vector_db._collection
    collection.delete(where={"source": filename})
    
    # 2. Process and add the new chunks
    content_bytes = await file.read()
    content_str = content_bytes.decode("utf-8")
    chunks = process_markdown_file(content_str, filename)
    vector_db.add_documents(chunks)
    
    return {"message": f"Successfully updated '{filename}'. Re-indexed into {len(chunks)} chunks."}

