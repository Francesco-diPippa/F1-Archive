from pydantic import BaseModel, Field
from typing import Optional
from models.result import ResultModel

class ConstructorModel(BaseModel):
    constructorRef: str = Field(..., min_length=2)
    name: str = Field(..., min_length=2)
    nationality: str = Field(..., min_length=2)
    url: Optional[str] = None
    id: Optional[int] = Field(default=None, alias="_id")  # MongoDB-style _id support

    results: Optional[list[ResultModel]] = []

    def to_dict(self) -> dict:
        # Serialize model using alias names (e.g. _id) and exclude fields with None
        return self.model_dump(by_alias=True, exclude_none=True)

    def __repr__(self):
        return f"Constructor(id={self.id}, name='{self.name}', nationality='{self.nationality}')"
