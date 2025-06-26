from typing import Optional, List, Union
from database import Database
from models.circuit import CircuitModel
from models.result import ResultModel
from pymongo import ASCENDING, DESCENDING


class CircuitService:
    def __init__(self):
        self.collection = Database().get_collection('circuits')

    def find_by_id(self, _id: int) -> Optional[CircuitModel]:
        """Retrieve a driver by ID."""
        driver_data = self.collection.find_one({'_id': int(_id)})
        return CircuitModel(**driver_data) if driver_data else None

    def find_all(self, country = None, sort_alpha = None) -> List[CircuitModel]:
        """Retrieve all circuits."""
        query = {}
        if country:
            query['country'] = country

        cursor = self.collection.find(query).sort('name', 1)

        if sort_alpha == 'asc':
            cursor.sort('name', ASCENDING)
        elif sort_alpha == 'desc':
            cursor.sort('name', DESCENDING)

        return [CircuitModel(**data) for data in cursor]

    def exists_circuit_id(self, _id: int) -> bool:
        """Check if a driver exists by ID."""
        return self.collection.count_documents({'_id': int(_id)}) > 0

    def count(self) -> int:
        """Count the total number of drivers."""
        return self.collection.count_documents({})

    def _get_next_id(self) -> int:
        """Get the next available driver ID."""
        last_doc = self.collection.find_one(sort=[("_id", -1)])
        return last_doc['_id'] + 1 if last_doc else 1
    
    def find_by_driverId(self, driver_id) -> List[CircuitModel]:
        """Retrieve all circuits where a given driver has raced."""
        results_collection = Database().get_collection('results')

        pipeline = [
            {
                '$match': {
                    'driverId': int(driver_id)
                }
            },
            {
                '$lookup': {
                    'from': 'races',
                    'localField': 'raceId',
                    'foreignField': '_id',
                    'as': 'race'
                }
            },
            {
                '$unwind': '$race'
            },
            {
                '$lookup': {
                    'from': 'circuits',
                    'localField': 'race.circuitId',
                    'foreignField': '_id',
                    'as': 'circuit'
                }
            },
            {
                '$unwind': '$circuit'
            },
            {
                '$replaceRoot': {
                    'newRoot': '$circuit'
                }
            },
            {
                '$group': {
                    '_id': '$_id',
                    'doc': {'$first': '$$ROOT'}
                }
            },
            {
                '$replaceRoot': {
                    'newRoot': '$doc'
                }
            }
        ]

        circuits_cursor = results_collection.aggregate(pipeline)
        return [CircuitModel(**data) for data in circuits_cursor]