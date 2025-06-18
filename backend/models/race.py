from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class RaceModel(BaseModel):
    year: int
    round: int
    circuitId: int
    name: str = Field(..., min_length=2)
    date: Optional[datetime] = None  # parsing automatico
    url: Optional[str] = None
    id: Optional[int] = Field(default=None, alias="_id")

    class Config:
        json_encoders = {
            datetime: lambda v: v.strftime('%Y-%m-%d')
        }

    def get_name(self) -> str:
        return f"{self.name}"

    def to_dict(self) -> dict:
        return self.model_dump(by_alias=True, exclude_none=True)

    def __repr__(self):
        return f"Race(id={self._id}, name='{self.get_name()}', date='{self.date}')"
