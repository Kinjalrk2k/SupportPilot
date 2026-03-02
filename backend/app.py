from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from config.openapi import custom_openapi
from dotenv import load_dotenv
import os
import uvicorn

from routes.docs.views import router as docs_router
from routes.orders.views import router as orders_router
from routes.documents.views import router as documents_router
from routes.tickets.views import router as tickets_router
from routes.messages.views import router as messages_router
from routes.stats.views import router as stats_router

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
app.include_router(tickets_router, prefix="/tickets", tags=["tickets"])
app.include_router(messages_router, prefix="/messages", tags=["messages"])
app.include_router(stats_router, prefix="/stats", tags=["stats"])

app.openapi = custom_openapi(app)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(PORT))
