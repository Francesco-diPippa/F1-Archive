from typing import Optional, List, Union
from database import Database
from models.result import ResultModel


class ResultService:
    def __init__(self):
        self.collection = Database().get_collection('results')
        self.collection.create_index([("driverId", 1)])

    def save(self, result: ResultModel) -> Union[int, None]:
        """Salva o aggiorna un costruttore nel database."""
        result_data = {
            "raceId": result.raceId,
            "driverId": result.driverId,
            "constructorId": result.constructorId,
            "grid": result.grid,
            "positionText": result.positionText,
            "positionOrder": result.positionOrder,
            "points": result.points,
            "laps": result.laps,
            "statusId": result.statusId
        }

        if result.id:
            res = self.collection.update_one(
                {'_id': result.id},
                {'$set': result_data}
            )
            return res.modified_count
        else:
            result_data['_id'] = self._get_next_id()
            res = self.collection.insert_one(result_data)
            return res.inserted_id

    def find_by_id(self, _id: int) -> Optional[ResultModel]:
        data = self.collection.find_one({'_id': int(_id)})
        return ResultModel(**data) if data else None

    def find_all(self) -> List[ResultModel]:
        return [ResultModel(**data) for data in self.collection.find()]

    def delete_by_id(self, _id: int) -> bool:
        try:
            result = self.collection.delete_one({'_id': int(_id)})
            return result.deleted_count > 0
        except Exception:
            return False

    def delete(self, result: ResultModel) -> bool:
        return self.delete_by_id(result.id) if result.id else False

    def exists_result_id(self, _id: int) -> bool:
        return self.collection.count_documents({'_id': int(_id)}) > 0

    def count(self) -> int:
        return self.collection.count_documents({})

    def _get_next_id(self) -> int:
        last_doc = self.collection.find_one(sort=[("_id", -1)])
        return last_doc['_id'] + 1 if last_doc else 1

    def save_many(self, results: List[ResultModel]) -> List[int]:
        """Inserisce o aggiorna molti risultati in un batch usando l'id del risultato."""
        if not results:
            return []

        inserted_or_updated_ids = []
        next_id = self._get_next_id()

        for result in results:
            result_data = {
                "raceId": result.raceId,
                "driverId": result.driverId,
                "constructorId": result.constructorId,
                "grid": result.grid,
                "positionText": result.positionText,
                "positionOrder": result.positionOrder,
                "points": result.points,
                "laps": result.laps,
                "statusId": result.statusId
            }

            if result.id:
                print(result.id)
                # Aggiorna documento esistente con _id = result.id
                self.collection.update_one(
                    {'_id': result.id},
                    {'$set': result_data}
                )
                inserted_or_updated_ids.append(result.id)
            else:
                # Inserisce nuovo documento con nuovo _id
                result_data['_id'] = next_id
                self.collection.insert_one(result_data)
                inserted_or_updated_ids.append(next_id)
                next_id += 1

        return inserted_or_updated_ids

    
    def get_race_standings(self, race_id: int) -> List[dict]:
        """Restituisce la classifica della gara con i dettagli di pilota e costruttore."""
        results_cursor = self.collection.find({'raceId': int(race_id)}, sort=[('positionOrder', 1)])

        # Accesso alle collezioni di piloti e costruttori
        drivers_collection = Database().get_collection('drivers')
        constructors_collection = Database().get_collection('constructors')

        standings = []
        for result_data in results_cursor:
            driver = drivers_collection.find_one({'_id': result_data['driverId']})
            constructor = constructors_collection.find_one({'_id': result_data['constructorId']})
            result = ResultModel(**result_data)

            enriched_result = {
                "resultId": result.id,
                "positionOrder": result.positionOrder,
                "positionText": result.positionText,
                "points": result.points,
                "driverId": result.driverId,
                "driverName": f"{driver['forename']} {driver['surname']}" if driver else "N/D",
                "constructorId": result.constructorId,
                "constructorName": constructor['name'] if constructor else "N/D",
            }
            standings.append(enriched_result)

        return standings


