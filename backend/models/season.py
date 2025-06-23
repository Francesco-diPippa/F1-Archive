from pydantic import BaseModel, Field
from typing import List, Optional
from models.race import RaceModel

class SeasonModel(BaseModel):
    year: int # Also id
    driverChampion: Optional[int] = None
    constructorChampion: Optional[int] = None
    raceCount: int
    races: Optional[List] = []

    def to_dict(self) -> dict:
        # Export dict using field aliases and excluding fields with None values
        return self.model_dump(by_alias=True, exclude_none=True)

    def __repr__(self):
        return f"Season(year={self.year}, driverChampionId='{self.driverChampion()}')"
