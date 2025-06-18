from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from bson.errors import InvalidId
from service.race_service import RaceService
from models.race import RaceModel

race_bp = Blueprint('race', __name__)
race_service = RaceService()

@race_bp.route('/all', methods=['GET'])
def find_all_races():
    races = race_service.find_all()
    return jsonify({'races': [r.to_dict() for r in races]}), 200

@race_bp.route('/<id>', methods=['GET'])
def find_by_race_id(id):
    constructor = race_service.find_by_id(id)
    if constructor:
        return jsonify(constructor.to_dict()), 200
    return jsonify({'error': 'Race not found'}), 404

@race_bp.route('', methods=['POST'])
def save_race():
    try:
        race = RaceModel(**request.get_json())
    except ValidationError as e:
        return jsonify({'errors': e.errors()}), 422
    race_id = race_service.save(race)
    return jsonify({'message': 'Race saved', '_id': race_id}), 201

@race_bp.route('/<id>', methods=['DELETE'])
def delete_race(id):
    try:
        success = race_service.delete_by_id(id)
    except InvalidId:
        return jsonify({'error': 'ID non valido'}), 400
    if not success:
        return jsonify({'error': 'Race non trovato'}), 404
    return jsonify({'message': 'Race eliminato con successo'}), 200