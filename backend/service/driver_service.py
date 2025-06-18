from typing import Optional, List, Union
from database import Database
from models.driver import DriverModel


class DriverService:
    def __init__(self):
        self.collection = Database().get_collection('drivers')

    def save(self, driver: DriverModel) -> Union[int, None]:
        """Salva o aggiorna un pilota nel database."""
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
        driver_data = self.collection.find_one({'_id': int(_id)})
        return DriverModel(**driver_data) if driver_data else None

    def find_all(self) -> List[DriverModel]:
        return [DriverModel(**data) for data in self.collection.find()]

    def delete_by_id(self, _id: int) -> bool:
        try:
            result = self.collection.delete_one({'_id': int(_id)})
            return result.deleted_count > 0
        except Exception:
            return False

    def delete(self, driver: DriverModel) -> bool:
        return self.delete_by_id(driver.id) if driver.id else False

    def exists_driver_id(self, _id: int) -> bool:
        return self.collection.count_documents({'_id': int(_id)}) > 0

    def count(self) -> int:
        return self.collection.count_documents({})

    def _get_next_id(self) -> int:
        last_doc = self.collection.find_one(sort=[("_id", -1)])
        return last_doc['_id'] + 1 if last_doc else 1