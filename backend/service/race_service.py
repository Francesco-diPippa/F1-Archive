from typing import Optional, List, Union
from database import Database
from models.race import RaceModel


class RaceService:
    def __init__(self):
        self.collection = Database().get_collection('races')

    def save(self, race: RaceModel) -> Union[int, None]:
        """Salva o aggiorna un costruttore nel database."""
        race_data = {
            "year": race.year,
            "round": race.round,
            "circuitId": race.circuitId,
            "name": race.name,
            "date": race.date,
            "url": race.url
        }

        if race.id:
            result = self.collection.update_one(
                {'_id': race.id},
                {'$set': race_data}
            )
            return result.modified_count
        else:
            race_data['_id'] = self._get_next_id()
            result = self.collection.insert_one(race_data)
            return result.inserted_id

    def find_by_id(self, _id: int) -> Optional[RaceModel]:
        data = self.collection.find_one({'_id': int(_id)})
        return RaceModel(**data) if data else None

    def find_all(self) -> List[RaceModel]:
        return [RaceModel(**data) for data in self.collection.find()]

    def delete_by_id(self, _id: int) -> bool:
        try:
            result = self.collection.delete_one({'_id': int(_id)})
            return result.deleted_count > 0
        except Exception:
            return False

    def delete(self, race: RaceModel) -> bool:
        return self.delete_by_id(race.id) if race.id else False

    def exists_race_id(self, _id: int) -> bool:
        return self.collection.count_documents({'_id': int(_id)}) > 0

    def count(self) -> int:
        return self.collection.count_documents({})

    def _get_next_id(self) -> int:
        last_doc = self.collection.find_one(sort=[("_id", -1)])
        return last_doc['_id'] + 1 if last_doc else 1
