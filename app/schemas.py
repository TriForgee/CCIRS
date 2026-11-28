from typing import Literal
from pydantic import BaseModel, Field

Category = Literal[
    "IT_Network",
    "Electrical",
    "Plumbing_Water",
    "Classroom_Equipment",
    "Facilities_Infrastructure",
    "Cleanliness_Sanitation",
    "Safety_Security",
    "Transport",
]

class ComplaintCreate(BaseModel):
    description: str = Field(min_length=10, max_length=500)
    category: Category
