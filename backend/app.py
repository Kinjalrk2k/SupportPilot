from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.orders.views import router as orders_router
from routes.docs.views import router as docs_router
from routes.documents.views import router as documents_router
from fastapi.staticfiles import StaticFiles
from config.openapi import custom_openapi
from dotenv import load_dotenv
import os
import uvicorn

load_dotenv()
PORT = os.getenv("PORT")

app = FastAPI(docs_url="/swagger")

app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(docs_router, prefix="/docs", tags=["docs"])
app.include_router(orders_router, prefix="/orders", tags=["orders"])
app.include_router(documents_router, prefix="/documents", tags=["documents"])

app.openapi = custom_openapi(app)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(PORT))
