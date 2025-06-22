from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from models.result import ResultModel

class CircuitModel(BaseModel):
    circuitRef: str = Field(..., min_length=2)
    name: str = Field(..., min_length=1)
    location: Optional[str] = None
    country: Optional[str] = None
    url: Optional[str] = None
    id: Optional[int] = Field(default=None, alias="_id")  # Mongo-style ID aliasing

    results: Optional[list[ResultModel]] = []

    def get_name(self) -> str:
        return f"{self.name}"

    def to_dict(self) -> dict:
        # Convert model to dictionary using aliases, excluding None values
        return self.model_dump(by_alias=True, exclude_none=True)

    def __repr__(self):
        return (
            f"Curcuit(id={self.id}, name='{self.get_name()}', "
            f"Location='{self.location}', {self.country}')"
        )
