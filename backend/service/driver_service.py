from typing import Optional, List, Union
from database import Database
from models.driver import DriverModel
from models.result import ResultModel


class DriverService:
    def __init__(self):
        self.collection = Database().get_collection('drivers')

    def save(self, driver: DriverModel) -> Union[int, None]:
        """Save or update a driver in the database."""
        driver_data = {
            'driverRef': driver.driverRef,
            'forename': driver.forename,
            'surname': driver.surname,
            'dob': driver.dob,
            'nationality': driver.nationality,
            'url': driver.url
        }

        if driver.id:
            result = self.collection.update_one({'_id': driver.id}, {'$set': driver_data})
            return result.modified_count
        else:
            driver_data['_id'] = self._get_next_id()
            result = self.collection.insert_one(driver_data)
            return result.inserted_id

    def find_by_id(self, _id: int) -> Optional[DriverModel]:
        """Retrieve a driver by ID."""
        driver_data = self.collection.find_one({'_id': int(_id)})
        return DriverModel(**driver_data) if driver_data else None

    def find_all(self) -> List[DriverModel]:
        """Retrieve all drivers."""
        return [DriverModel(**data) for data in self.collection.find()]

    def delete_by_id(self, _id: int) -> bool:
        """Delete a driver by ID."""
        try:
            result = self.collection.delete_one({'_id': int(_id)})
            return result.deleted_count > 0
        except Exception:
            return False

    def delete(self, driver: DriverModel) -> bool:
        """Delete a driver using a DriverModel instance."""
        return self.delete_by_id(driver.id) if driver.id else False

    def exists_driver_id(self, _id: int) -> bool:
        """Check if a driver exists by ID."""
        return self.collection.count_documents({'_id': int(_id)}) > 0

    def count(self) -> int:
        """Count the total number of drivers."""
        return self.collection.count_documents({})

    def _get_next_id(self) -> int:
        """Get the next available driver ID."""
        last_doc = self.collection.find_one(sort=[("_id", -1)])
        return last_doc['_id'] + 1 if last_doc else 1

    def find_results(self, id: int, year: Optional[int] = None, from_year: Optional[int] = None, to_year: Optional[int] = None) -> Optional[DriverModel]:
        """Retrieve race results for a driver, optionally filtered by year or range of years."""
        pipeline = [
            { "$match": { "_id": int(id) } },
            {
                "$lookup": {
                    "from": "results",
                    "localField": "_id",
                    "foreignField": "driverId",
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

        # Apply year filters
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

        # Group back driver and results
        pipeline.append({
            "$group": {
                "_id": "$_id",
                "forename": { "$first": "$forename" },
                "surname": { "$first": "$surname" },
                "dob": { "$first": "$dob" },
                "nationality": { "$first": "$nationality" },
                "url": { "$first": "$url" },
                "race_results": { "$push": "$race_results" }
            }
        })

        # Execute aggregation pipeline
        result_cursor = self.collection.aggregate(pipeline)
        result_list = list(result_cursor)

        if not result_list:
            result_list = []

        # Construct DriverModel with results
        driver = self.find_by_id(id)
        if result_list.__len__() > 0:
            for r in result_list[0].get("race_results", []):
                driver.results.append(ResultModel(**r))

        return driver
