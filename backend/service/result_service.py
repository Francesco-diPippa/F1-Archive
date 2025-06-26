from typing import Optional, List, Union
from database import Database
from models.result import ResultModel


class ResultService:
    def __init__(self):
        self.collection = Database().get_collection('results')
        # Indici per performance e controlli
        self.collection.create_index([("driverId", 1)])
        self.collection.create_index([("raceId", 1), ("grid", 1)], unique=False)
        self.collection.create_index([("raceId", 1), ("positionOrder", 1)], unique=False)
        self.collection.create_index([("raceId", 1), ("driverId", 1)], unique=False)

    def _check_unique_positions(
        self,
        race_id: int,
        grid: int,
        position_order: int,
        exclude_id: Optional[int] = None
    ) -> None:
        """
        Verifica che per la gara indicata non esistano già grid o positionOrder uguali.
        Se exclude_id è fornito, esclude quel documento dal controllo (utile per update).
        """
        query = {
            "raceId": race_id,
            "$or": [{"grid": grid}, {"positionOrder": position_order}]
        }
        if exclude_id is not None:
            query["_id"] = {"$ne": exclude_id}
        if self.collection.count_documents(query) > 0:
            raise ValueError(
                f"Per la gara {race_id} la posizione di partenza ({grid}) o di arrivo ({position_order}) è già presente"
            )

    def _check_unique_driver(
        self,
        race_id: int,
        driver_id: int,
        exclude_id: Optional[int] = None
    ) -> None:
        """
        Verifica che per la gara indicata un pilota non sia già registrato.
        Se exclude_id è fornito, esclude quel documento dal controllo.
        """
        query = {"raceId": race_id, "driverId": driver_id}
        if exclude_id is not None:
            query["_id"] = {"$ne": exclude_id}
        if self.collection.count_documents(query) > 0:
            raise ValueError(
                f"Per la gara {race_id} il pilota {driver_id} è già presente"
            )

    def save(self, result: ResultModel) -> Union[int, None]:
        """Salva o aggiorna un risultato nel database, con controlli di unicità su grid, positionOrder e driver."""
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

        exclude_id = result.id if result.id else None
        # Controlli unicità
        self._check_unique_positions(result.raceId, result.grid, result.positionOrder, exclude_id=exclude_id)
        self._check_unique_driver(result.raceId, result.driverId, exclude_id=exclude_id)

        if result.id:
            res = self.collection.update_one({'_id': result.id}, {'$set': result_data})
            return res.modified_count
        else:
            next_id = self._get_next_id()
            result_data['_id'] = next_id
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
        """Inserisce o aggiorna molti risultati in un batch con controlli di unicità per ciascuna gara."""
        if not results:
            return []

        inserted_or_updated_ids: List[int] = []
        next_id = self._get_next_id()
        # Map per tenere traccia di grid/position e driver nel batch per ogni gara
        batch_info: dict[int, dict[str, set[int]]] = {}

        for result in results:
            race_id = result.raceId
            info = batch_info.setdefault(race_id, {"grids": set(), "positions": set(), "drivers": set()})

            exclude_id = result.id if result.id else None
            # Controlli DB
            self._check_unique_positions(race_id, result.grid, result.positionOrder, exclude_id=exclude_id)
            self._check_unique_driver(race_id, result.driverId, exclude_id=exclude_id)

            # Controlli nel batch
            if result.grid in info["grids"] or result.positionOrder in info["positions"]:
                raise ValueError(
                    f"Duplicato nel batch per gara {race_id}: posizione di partenza ({result.grid}) o di arrivo ({result.positionOrder}) già presenti"
                )
            if result.driverId in info["drivers"]:
                raise ValueError(
                    f"Duplicato nel batch per gara {race_id}: il pilota {result.driverId} è già presente"
                )

            info["grids"].add(result.grid)
            info["positions"].add(result.positionOrder)
            info["drivers"].add(result.driverId)

            # Operazione DB
            result_data = {
                "raceId": race_id,
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
                self.collection.update_one({'_id': result.id}, {'$set': result_data})
                inserted_or_updated_ids.append(result.id)
            else:
                result_data['_id'] = next_id
                self.collection.insert_one(result_data)
                inserted_or_updated_ids.append(next_id)
                next_id += 1

        return inserted_or_updated_ids

    def get_race_standings(self, race_id: int) -> List[dict]:
        results_cursor = self.collection.find({'raceId': int(race_id)}, sort=[('positionOrder', 1)])
        drivers_collection = Database().get_collection('drivers')
        constructors_collection = Database().get_collection('constructors')

        standings: List[dict] = []
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
