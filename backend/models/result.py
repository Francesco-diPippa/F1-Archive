from pydantic import BaseModel, Field
from typing import Optional

class ResultModel(BaseModel):
    raceId: int
    driverId: int
    constructorId: int
    grid: int # Starting position
    positionText: str = Field(..., min_length=1) # Ending position (R for retired)
    positionOrder: int # Real ending position (numeric)
    points: float
    laps: int
    statusId: int
    id: Optional[int] = Field(default=None, alias="_id")  # Mongo-style ID aliasing

    def to_dict(self) -> dict:
        # Export dict using field aliases and excluding fields with None values
        return self.model_dump(by_alias=True, exclude_none=True)

    def __repr__(self):
        return f"Race(id={self.id}, name='{self.get_name()}', date='{self.date}')"
