from fastapi import FastAPI
from routes.chat.views import router as chat_router
from routes.docs.views import router as docs_router
from fastapi.staticfiles import StaticFiles
from config.openapi import custom_openapi

app = FastAPI(docs_url=None, redoc_url=None)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(docs_router, prefix="/docs", tags=["docs"])
app.include_router(chat_router, prefix="/chat", tags=["chat"])

app.openapi = custom_openapi(app)
