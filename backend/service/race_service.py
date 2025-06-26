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
        print(race)
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
        return [RaceModel(**data) for data in self.collection.find().sort('name', 1)]

    def delete_by_id(self, _id: int) -> bool:
        try:
            result = self.collection.delete_one({'_id': int(_id)})
            if result.deleted_count > 0:
                # Elimina tutti i risultati associati
                results_collection = Database().get_collection('results')
                results_collection.delete_many({'raceId': int(_id)})
                return True
            return False
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

    def find_all_races_by_driverId(self, driver_id: int) -> List[RaceModel]:
        pipeline = [
                        {
                            "$lookup": {
                                "from": "results",
                                "let": {"race_id": "$_id"},
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$and": [
                                                    {"$eq": ["$raceId", "$$race_id"]},
                                                    {"$eq": ["$driverId", int(driver_id)]}
                                                ]
                                            }
                                        }
                                    }
                                ],
                                "as": "filtered_results"
                            }
                        },
                        {
                            "$match": {
                                "filtered_results.0": {"$exists": True}
                            }
                        },
                        {
                            "$project": {
                                "filtered_results": 0  # Esclude il campo results filtrato
                            }
                        }
                    ]

        races = list(self.collection.aggregate(pipeline))
        return [RaceModel(**race) for race in races]

