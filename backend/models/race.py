from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class RaceModel(BaseModel):
    year: int
    round: int
    circuitId: int
    round: Optional[int]
    name: str = Field(..., min_length=2)
    date: Optional[str] = None  # Automatic parsing by Pydantic
    url: Optional[str] = None
    id: Optional[int] = Field(default=None, alias="_id")  # Mongo-style ID aliasing

    class Config:
        # Custom JSON serialization for datetime fields
        json_encoders = {
            datetime: lambda v: v.strftime('%Y-%m-%d')
        }

    def get_name(self) -> str:
        return self.name

    def to_dict(self) -> dict:
        # Export dict using field aliases and excluding fields with None values
        return self.model_dump(by_alias=True, exclude_none=True)

    def __repr__(self):
        return f"Race(id={self.id}, name='{self.get_name()}', date='{self.date}')"
