from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from bson.errors import InvalidId
from service.result_service import ResultService
from models.result import ResultModel

# Create a Blueprint for the 'result' endpoint
result_bp = Blueprint('result', __name__)
result_service = ResultService()

# Route to get all results
@result_bp.route('/all', methods=['GET'])
def find_all_results():
    results = result_service.find_all()
    return jsonify({'results': [r.to_dict() for r in results]}), 200

# Route to find a result by its ID
@result_bp.route('/<id>', methods=['GET'])
def find_result_by_id(id):
    result = result_service.find_by_id(id)
    if result:
        return jsonify(result.to_dict()), 200
    return jsonify({'error': 'Result not found'}), 404

# Route to save a new result
@result_bp.route('', methods=['POST'])
def save_result():
    try:
        result = ResultModel(**request.get_json())
    except ValidationError as e:
        return jsonify({'errors': e.errors()}), 422
    result_id = result_service.save(result)
    return jsonify({'message': 'Result saved', '_id': result_id}), 201

# Route to delete a result by its ID
@result_bp.route('/<id>', methods=['DELETE'])
def delete_result(id):
    try:
        success = result_service.delete_by_id(id)
    except InvalidId:
        return jsonify({'error': 'Invalid ID'}), 400
    if not success:
        return jsonify({'error': 'Result not found'}), 404
    return jsonify({'message': 'Result deleted successfully'}), 200
