from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates
import os

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "templates")

router = APIRouter()
templates = Jinja2Templates(directory=TEMPLATES_DIR)


@router.get("")
def rapidoc(request: Request):
    return templates.TemplateResponse("rapidoc.html", {"request": request})
