from pydantic import BaseModel, Field, model_validator
from langchain_core.output_parsers import PydanticOutputParser
from typing import Literal


class IssueExtractionResult(BaseModel):
    category: Literal["Billing", "Technical", "Login", "General" "Delivery"] = Field(
        description="Categorize the issue: Billing, Technical, Login, General or Delivery.",
        default="General",
    )

    priority: Literal["Low", "Medium", "High", "Urgent"] = Field(
        description="Assess priority: Low, Medium, High, or Urgent.", default="Low"
    )

    confidence: float = Field(
        description="A score from 0.0 to 1.0 indicating how confident you are in this classification. A vague message should have a low score.",
        ge=0.0,
        le=1.0,
        default=0.0,
    )

    sentiment_score: float = Field(
        description="A score from -1.0 (extremely negative/angry) to 1.0 (extremely positive/happy). 0.0 is neutral.",
        default=0.0,
    )

    requires_knowledge_search: bool = Field(
        default=False,
        description="Set to True ONLY if the user is asking a factual question about policies, pricing, or features that requires looking up documentation. Set to False for greetings, complaints, or simple conversational replies.",
    )

    requires_order_check: bool = Field(
        default=False,
        description="Set to True ONLY if the user is asking about the status, location, delivery date, or details of their specific order or package. Set to False for general policy questions, greetings, or complaints.",
    )

    requires_escalation: bool = Field(
        default=False,
        description="Set to True ONLY if the user explicitly asks to speak to a human, live agent, or manager, OR if their input is extremely abusive and furious.",
    )

    # The Dynamic Validator
    @model_validator(mode="before")
    @classmethod
    def drop_empty_strings(cls, data: any) -> any:
        """
        Scans the incoming JSON dictionary. If any string is empty or just spaces,
        it removes the key entirely, forcing Pydantic to use the field's default value.
        """
        # Ensure the incoming data is actually a dictionary
        if isinstance(data, dict):
            cleaned_data = {}
            for key, value in data.items():
                # If it's a string and it's empty/blank, we skip adding it to our clean dict
                if isinstance(value, str) and not value.strip():
                    continue
                # Otherwise, keep the data
                cleaned_data[key] = value
            return cleaned_data
        return data


issue_extraction_parser = PydanticOutputParser(pydantic_object=IssueExtractionResult)
