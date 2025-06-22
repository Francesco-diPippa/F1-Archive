from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from bson.errors import InvalidId
from models.constructor import ConstructorModel
from service.constructor_service import ConstructorService

# Create a Blueprint for constructor-related routes
constructor_bp = Blueprint('constructor', __name__)
constructor_service = ConstructorService()

# Route to retrieve all constructors
@constructor_bp.route('/all', methods=['GET'])
def find_all_constructors():
    constructors = constructor_service.find_all()
    return jsonify({'constructors': [c.to_dict() for c in constructors]}), 200

# Route to retrieve a constructor by ID
@constructor_bp.route('/<id>', methods=['GET'])
def find_by_constructor_id(id):
    constructor = constructor_service.find_by_id(id)
    if constructor:
        return jsonify(constructor.to_dict()), 200
    return jsonify({'error': 'Constructor not found'}), 404

# Route to create a new constructor
@constructor_bp.route('', methods=['POST'])
def save_constructor():
    try:
        constructor = ConstructorModel(**request.get_json())
    except ValidationError as e:
        return jsonify({'errors': e.errors()}), 422
    constructor_id = constructor_service.save(constructor)
    return jsonify({'message': 'Constructor saved successfully', '_id': constructor_id}), 201

# Route to delete a constructor by ID
@constructor_bp.route('/<id>', methods=['DELETE'])
def delete_constructor(id):
    try:
        success = constructor_service.delete_by_id(id)
    except InvalidId:
        return jsonify({'error': 'Invalid ID'}), 400
    if not success:
        return jsonify({'error': 'Constructor not found'}), 404
    return jsonify({'message': 'Constructor deleted successfully'}), 200

@constructor_bp.route('/find_results/<id>', methods=['GET'])
def find_constructor_results(id: int):
    year = request.args.get('year', type=int)
    from_year = request.args.get('from_year', type=int)
    to_year = request.args.get('to_year', type=int)

    # Validazione: from_year non deve essere maggiore di to_year
    if from_year is not None and to_year is not None and from_year > to_year:
        return jsonify({
            "error": "Invalid year range: from_year must be less than or equal to to_year"
        }), 400
    
    result = constructor_service.find_results(id, year=year, from_year=from_year, to_year=to_year)
    return jsonify(result.to_dict()), 200

@constructor_bp.route('/find_costructors_by_driverId/<id>', methods=['GET'])
def find_constructors_by_driverId(id):
    constructors = constructor_service.find_constructors_by_driverId(id)
    return jsonify([c.to_dict() for c in constructors]), 200