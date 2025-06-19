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
    drivers = driver_service.find_all()
    return jsonify({'drivers': [d.to_dict() for d in drivers]}), 200

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
