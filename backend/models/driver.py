from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class DriverModel(BaseModel):
    driverRef: str = Field(..., min_length=2)
    forename: str = Field(..., min_length=1)
    surname: str = Field(..., min_length=1)
    dob: Optional[datetime] = None  # parsing automatico
    nationality: str = Field(..., min_length=2)
    url: Optional[str] = None
    id: Optional[int] = Field(default=None, alias="_id")

    class Config:
        json_encoders = {
            datetime: lambda v: v.strftime('%Y-%m-%d')
        }

    def get_full_name(self) -> str:
        return f"{self.forename} {self.surname}"

    def to_dict(self) -> dict:
        return self.model_dump(by_alias=True, exclude_none=True)

    def __repr__(self):
        return f"Driver(driverId={self._id}, name='{self.get_full_name()}', nationality='{self.nationality}')"
