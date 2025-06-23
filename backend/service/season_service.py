from typing import Optional, List
from models.race import RaceModel
from database import Database
from models.season import SeasonModel


class SeasonService:
    def __init__(self):
        self.result_collection = Database().get_collection('results')
        self.race_collection = Database().get_collection('races')

    def find(self, year: Optional[int] = None, from_year: Optional[int] = None, to_year: Optional[int] = None) -> List[SeasonModel]:
        filter = {}
        if year is not None:
            # Priorità: anno specifico
            filter["year"] = year
        else:
            if from_year is not None or to_year is not None:
                filter["year"] = {}
                if from_year is not None:
                    filter["year"]["$gte"] = from_year
                if to_year is not None:
                    filter["year"]["$lte"] = to_year

        pipeline = []
        if filter:
            pipeline.append({"$match": filter})

        pipeline.extend([
            {
                "$group": {
                    "_id": "$year",
                    "raceCount": {"$sum": 1}
                }
            },
            {
                "$sort": {"_id": -1}
            },
            {
                "$project": {
                    "year": "$_id",
                    "_id": 0,
                    "raceCount": 1
                }
            }
        ])

        results = list(self.race_collection.aggregate(pipeline))

        # Costruisci gli oggetti SeasonModel, ma solo con year e raceCount
        seasons = []
        for data in results:
            season = SeasonModel(
                year=data["year"],
                raceCount=data["raceCount"],
                driverChampion=None,
                constructorChampion=None,
                races=[]
            )
            seasons.append(season)

        return seasons

    def find_driver_standing(self, year: int) -> List[dict]:
        pipeline = [
            # Join con 'races' per ottenere l'anno
            {
                "$lookup": {
                    "from": "races",
                    "localField": "raceId",
                    "foreignField": "_id",
                    "as": "race"
                }
            },
            {"$unwind": "$race"},

            # Filtro per anno
            {"$match": {"race.year": year}},

            # Raggruppa per coppia (driverId, constructorId)
            {
                "$group": {
                    "_id": {
                        "driverId": "$driverId",
                        "constructorId": "$constructorId"
                    },
                    "totalPoints": {"$sum": "$points"},
                    "racesCount": {"$sum": 1},
                    "wins": {
                        "$sum": {
                            "$cond": [{"$eq": ["$positionText", "1"]}, 1, 0]
                        }
                    }
                }
            },

            # Join con 'constructors' per ottenere il nome del team
            {
                "$lookup": {
                    "from": "constructors",
                    "localField": "_id.constructorId",
                    "foreignField": "_id",
                    "as": "constructor"
                }
            },
            {"$unwind": "$constructor"},

            # Join con 'drivers' per ottenere nome e cognome
            {
                "$lookup": {
                    "from": "drivers",
                    "localField": "_id.driverId",
                    "foreignField": "_id",
                    "as": "driver"
                }
            },
            {"$unwind": "$driver"},

            # Proiezione finale
            {
                "$project": {
                    "_id": 0,
                    "driverId": "$_id.driverId",
                    "forename": "$driver.forename",
                    "surname": "$driver.surname",
                    "constructorId": "$_id.constructorId",
                    "constructorName": "$constructor.name",
                    "totalPoints": 1,
                    "racesCount": 1,
                    "wins": 1
                }
            },

            # Ordina per punti decrescenti
            {"$sort": {"totalPoints": -1}}
        ]

        return list(self.result_collection.aggregate(pipeline))

    def find_season(self, year: int) -> Optional[SeasonModel]:
        races_data = list(self.race_collection.find({"year": year}))
        if not races_data:
            return None

        enriched_races = []
        for race in races_data:
            circuit = self.race_collection.database["circuits"].find_one({"_id": race["circuitId"]})
            circuit_name = circuit["name"] if circuit else None

            winner_result = self.result_collection.find_one({
                "raceId": race["_id"],
                "positionText": "1"
            })

            if winner_result:
                driver = self.result_collection.database["drivers"].find_one({"_id": winner_result["driverId"]})
                constructor = self.result_collection.database["constructors"].find_one({"_id": winner_result["constructorId"]})

                winner_driver_name = f"{driver['forename']} {driver['surname']}" if driver else None
                team_name = constructor["name"] if constructor else None
            else:
                winner_driver_name = None
                team_name = None

            race_info = {
                "raceId": str(race["_id"]),
                "name": race.get("name"),
                "date": race.get("date"),
                "round": race.get("round"),
                "circuitName": circuit_name,
                "winner": winner_driver_name,
                "team": team_name
            }
            enriched_races.append(race_info)

        season = SeasonModel(
            year=year,
            raceCount=len(enriched_races),
            driverChampion=None,
            constructorChampion=None,
            races=enriched_races
        )

        return season

    def delete_season(self, year: int) -> bool:
        try:
            # Trova tutte le gare dell'anno specificato
            races_data = list(self.race_collection.find({"year": year}))
            if not races_data:
                return False
                    
            # Ottieni gli ID delle gare
            race_ids = [race["_id"] for race in races_data]

            self.result_collection.delete_many({"raceId": {"$in": race_ids}})
            self.race_collection.delete_many({"_id": {"$in": race_ids}})
            return True
        except Exception as e:
            print(e)
            return False
  


