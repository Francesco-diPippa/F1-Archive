from typing import Optional, List, Union
from database import Database
from models.constructor import ConstructorModel


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
