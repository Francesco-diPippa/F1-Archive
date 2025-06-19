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
