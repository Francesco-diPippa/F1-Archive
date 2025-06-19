from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from bson.errors import InvalidId
from service.race_service import RaceService
from models.race import RaceModel

# Create a Blueprint for the 'race' endpoint
race_bp = Blueprint('race', __name__)
race_service = RaceService()  # Initialize the RaceService instance

# Route to get all races
@race_bp.route('/all', methods=['GET'])
def find_all_races():
    races = race_service.find_all()
    return jsonify({'races': [r.to_dict() for r in races]}), 200

# Route to find a race by its ID
@race_bp.route('/<id>', methods=['GET'])
def find_race_by_id(id):
    race = race_service.find_by_id(id)
    if race:
        return jsonify(race.to_dict()), 200
    return jsonify({'error': 'Race not found'}), 404

# Route to save a new race
@race_bp.route('', methods=['POST'])
def save_race():
    try:
        race = RaceModel(**request.get_json())
    except ValidationError as e:
        return jsonify({'errors': e.errors()}), 422
    race_id = race_service.save(race)
    return jsonify({'message': 'Race saved', '_id': race_id}), 201

# Route to delete a race by its ID
@race_bp.route('/<id>', methods=['DELETE'])
def delete_race(id):
    try:
        success = race_service.delete_by_id(id)
    except InvalidId:
        return jsonify({'error': 'Invalid ID'}), 400
    if not success:
        return jsonify({'error': 'Race not found'}), 404
    return jsonify({'message': 'Race deleted successfully'}), 200

# Route to find all seasons

# /seasons	Restituisce tutte le stagioni
# /seasons?year=2018	Solo la stagione 2018
# /seasons?from_year=2010&to_year=2015	Stagioni dal 2010 al 2015
# /seasons?from_year=2020	Stagioni dal 2020 in poi
# /seasons?to_year=2020	Stagioni fino 2020 
@race_bp.route('/seasons', methods=['GET'])
def find_seasons():
    year = request.args.get('year', type=int)
    from_year = request.args.get('from_year', type=int)
    to_year = request.args.get('to_year', type=int)

    # Validazione: from_year non deve essere maggiore di to_year
    if from_year is not None and to_year is not None and from_year > to_year:
        return jsonify({
            "error": "Invalid year range: from_year must be less than or equal to to_year"
        }), 400

    seasons = race_service.find_seasons(year=year, from_year=from_year, to_year=to_year)
    return jsonify(seasons), 200
