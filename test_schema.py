from pydantic import ValidationError
from app.schemas import ComplaintCreate

test_cases = [
     {
        "description": "Wi-Fi is not working in the lab",
        "category": "IT_Network"
    },
    {
        "description": "Wi-Fi",
        "category": "IT_Network"
    },
    {
        "description": "The classroom projector is broken",
        "category": "Projector"
    }
]

for case in test_cases:
    try:
        complaint = ComplaintCreate(
            description = case["description"],
            category = case["category"]    
        )

        print("complaint accepted")
        print(complaint)
        
    except ValidationError as error:
        print("complaint rejected")
        print(error)