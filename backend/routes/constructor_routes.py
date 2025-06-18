from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from bson.errors import InvalidId
from models.constructor import ConstructorModel
from service.constructor_service import ConstructorService

constructor_bp = Blueprint('constructor', __name__)
constructor_service = ConstructorService()

@constructor_bp.route('/all', methods=['GET'])
def find_all_constructors():
    constructors = constructor_service.find_all()
    return jsonify({'constructors': [c.to_dict() for c in constructors]}), 200

@constructor_bp.route('/<id>', methods=['GET'])
def find_by_constructor_id(id):
    constructor = constructor_service.find_by_id(id)
    if constructor:
        return jsonify(constructor.to_dict()), 200
    return jsonify({'error': 'Constructor not found'}), 404

@constructor_bp.route('', methods=['POST'])
def save_constructor():
    try:
        constructor = ConstructorModel(**request.get_json())
    except ValidationError as e:
        return jsonify({'errors': e.errors()}), 422
    constructor_id = constructor_service.save(constructor)
    return jsonify({'message': 'Constructor saved', '_id': constructor_id}), 201

@constructor_bp.route('/<id>', methods=['DELETE'])
def delete_constructor(id):
    try:
        success = constructor_service.delete_by_id(id)
    except InvalidId:
        return jsonify({'error': 'ID non valido'}), 400
    if not success:
        return jsonify({'error': 'Constructor non trovato'}), 404
    return jsonify({'message': 'Constructor eliminato con successo'}), 200
