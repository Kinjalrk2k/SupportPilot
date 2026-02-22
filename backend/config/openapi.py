from fastapi.openapi.utils import get_openapi

def custom_openapi(app):
    def openapi():
        if app.openapi_schema:
            return app.openapi_schema

        openapi_schema = get_openapi(
            title="SupportPilot - API Documentation",
            version="1.0.0",
            description="Here's a longer description of the custom **OpenAPI** schema",
            routes=app.routes,
        )
        openapi_schema["info"]["x-logo"] = {
            "url": "https://ui-avatars.com/api/?name=Support+Pilot&rounded=true"
        }

        app.openapi_schema = openapi_schema
        return app.openapi_schema

    return openapi
