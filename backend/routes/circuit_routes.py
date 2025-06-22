from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from bson.errors import InvalidId
from models.circuit import CircuitModel
from service.circuit_service import CircuitService

# Create a Blueprint for driver-related routes
circuit_bp = Blueprint('circuit', __name__)
circuit_service = CircuitService()

# Route to get all drivers
@circuit_bp.route('/all', methods=['GET'])
def find_all_circuits():
    country = request.args.get('country', type=str)
    sort_alpha = request.args.get('sortAlpha', type=str)
    
    circuits = circuit_service.find_all(country=country, sort_alpha=sort_alpha)
    return jsonify([d.to_dict() for d in circuits]), 200

# Route to get a specific driver by ID
@circuit_bp.route('/<id>', methods=['GET'])
def find_by_id(id):
    circuit = circuit_service.find_by_id(id)
    if circuit:
        return jsonify(circuit.to_dict()), 200
    return jsonify({'error': 'Circuit not found'}), 404

@circuit_bp.route('/find_circuits_by_driverId/<id>', methods=['GET'])
def find_circuits_by_driverId(id):
    circuits = circuit_service.find_by_driverId(id)
    return jsonify([d.to_dict() for d in circuits]), 200

