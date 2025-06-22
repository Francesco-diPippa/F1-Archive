from typing import Optional, List, Union
from database import Database
from models.constructor import ConstructorModel
from models.result import ResultModel


class ConstructorService:
    def __init__(self):
        self.collection = Database().get_collection('constructors')

    def save(self, constructor: ConstructorModel) -> Union[int, None]:
        """Salva o aggiorna un costruttore nel database."""
        constructor_data = {
            "constructorRef": constructor.constructorRef,
            "name": constructor.name,
            "nationality": constructor.nationality,
            "url": constructor.url
        }

        if constructor.id:
            result = self.collection.update_one(
                {'_id': constructor.id},
                {'$set': constructor_data}
            )
            return result.modified_count
        else:
            constructor_data['_id'] = self._get_next_id()
            result = self.collection.insert_one(constructor_data)
            return result.inserted_id

    def find_by_id(self, _id: int) -> Optional[ConstructorModel]:
        data = self.collection.find_one({'_id': int(_id)})
        return ConstructorModel(**data) if data else None

    def find_all(self) -> List[ConstructorModel]:
        return [ConstructorModel(**data) for data in self.collection.find()]

    def delete_by_id(self, _id: int) -> bool:
        try:
            result = self.collection.delete_one({'_id': int(_id)})
            return result.deleted_count > 0
        except Exception:
            return False

    def delete(self, constructor: ConstructorModel) -> bool:
        return self.delete_by_id(constructor.id) if constructor.id else False

    def exists_constructor_id(self, _id: int) -> bool:
        return self.collection.count_documents({'_id': int(_id)}) > 0

    def count(self) -> int:
        return self.collection.count_documents({})

    def _get_next_id(self) -> int:
        last_doc = self.collection.find_one(sort=[("_id", -1)])
        return last_doc['_id'] + 1 if last_doc else 1
    
    def find_results(self, id: int, year: Optional[int] = None, from_year: Optional[int] = None, to_year: Optional[int] = None) -> Optional[ConstructorModel]:
        """
        Retrieve race results for a constructor, optionally filtered by year or range of years.
        """
        pipeline = [
            { "$match": { "_id": int(id) } },
            {
                "$lookup": {
                    "from": "results",
                    "localField": "_id",
                    "foreignField": "constructorId",
                    "as": "race_results"
                }
            },
            { "$unwind": "$race_results" },
            {
                "$lookup": {
                    "from": "races",
                    "localField": "race_results.raceId",
                    "foreignField": "_id",
                    "as": "race_info"
                }
            },
            { "$unwind": "$race_info" }
        ]

        # Apply filtering by year or year range
        if year is not None:
            pipeline.append({
                "$match": {
                    "$expr": { "$eq": ["$race_info.year", year] }
                }
            })
        else:
            conditions = []
            if from_year is not None:
                conditions.append({ "$gte": ["$race_info.year", from_year] })
            if to_year is not None:
                conditions.append({ "$lte": ["$race_info.year", to_year] })
            if conditions:
                pipeline.append({
                    "$match": {
                        "$expr": { "$and": conditions }
                    }
                })

        # Group the constructor data back with race results
        pipeline.append({
            "$group": {
                "_id": "$_id",
                "constructorRef": { "$first": "$constructorRef" },
                "name": { "$first": "$name" },
                "nationality": { "$first": "$nationality" },
                "url": { "$first": "$url" },
                "race_results": { "$push": "$race_results" }
            }
        })

        # Run the aggregation pipeline
        result_cursor = self.collection.aggregate(pipeline)
        result_list = list(result_cursor)

        if not result_list:
            return self.find_by_id(id)  # Return basic constructor if no results found

        # Build ConstructorModel with race results
        constructor = self.find_by_id(id)
        if constructor:
            for r in result_list[0].get("race_results", []):
                constructor.results.append(ResultModel(**r))

        return constructor
    
    def find_constructors_by_driverId(self, driver_id: int) -> List[ConstructorModel]:
        pipeline = [
            {
                "$lookup": {
                    "from": "results",
                    "localField": "_id",
                    "foreignField": "constructorId",
                    "as": "results"
                }
            },
            { "$unwind": "$results" },
            {
                "$match": {
                    "results.driverId": int(driver_id)
                }
            },
            {
                "$group": {
                    "_id": "$_id",
                    "constructorRef": { "$first": "$constructorRef" },
                    "name": { "$first": "$name" },
                    "nationality": { "$first": "$nationality" },
                    "url": { "$first": "$url" }
                }
            }
        ]

        constructors = list(self.collection.aggregate(pipeline))
        return [ConstructorModel(**data) for data in constructors]
        


