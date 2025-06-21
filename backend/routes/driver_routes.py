from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from bson.errors import InvalidId
from models.driver import DriverModel
from service.driver_service import DriverService

# Create a Blueprint for driver-related routes
driver_bp = Blueprint('driver', __name__)
driver_service = DriverService()

# Route to get all drivers
@driver_bp.route('/all', methods=['GET'])
def find_all_drivers():
    nationality = request.args.get('nationality', type=str)
    sort_alpha = request.args.get('sortAlpha', type=str)
    
    drivers = driver_service.find_all(nationality=nationality, sort_alpha=sort_alpha)
    return jsonify([d.to_dict() for d in drivers]), 200

# Route to get a specific driver by ID
@driver_bp.route('/<id>', methods=['GET'])
def find_by_driver_id(id):
    driver = driver_service.find_by_id(id)
    if driver:
        return jsonify(driver.to_dict()), 200
    return jsonify({'error': 'Driver not found'}), 404

# Route to create a new driver
@driver_bp.route('', methods=['POST'])
def save_driver():
    try:
        driver = DriverModel(**request.get_json())
    except ValidationError as e:
        print(e.errors())
        return jsonify({'errors': e.errors()}), 422
    driver_id = driver_service.save(driver)
    return jsonify({'message': 'Driver saved successfully', '_id': driver_id}), 201

# Route to delete a driver by ID
@driver_bp.route('/<id>', methods=['DELETE'])
def delete_driver(id):
    try:
        success = driver_service.delete_by_id(id)
    except InvalidId:
        return jsonify({'error': 'Invalid ID'}), 400
    if not success:
        return jsonify({'error': 'Driver not found'}), 404
    return jsonify({'message': 'Driver deleted successfully'}), 200

@driver_bp.route('/find_results/<id>', methods=['GET'])
def find_driver_results(id: int):
    year = request.args.get('year', type=int)
    from_year = request.args.get('from_year', type=int)
    to_year = request.args.get('to_year', type=int)

    # Validazione: from_year non deve essere maggiore di to_year
    if from_year is not None and to_year is not None and from_year > to_year:
        return jsonify({
            "error": "Invalid year range: from_year must be less than or equal to to_year"
        }), 400
    
    result = driver_service.find_results(id, year=year, from_year=from_year, to_year=to_year)
    return jsonify(result.to_dict()), 200

@driver_bp.route('/find_nationalities', methods=['GET'])
def find_driver_nationalities():
    result = driver_service.find_all_nationalities()
    return jsonify(result), 200   

