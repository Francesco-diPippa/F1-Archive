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
        result_id = result_service.save(result)
        return jsonify({'message': 'Result saved', '_id': result_id}), 201

    except ValidationError as e:
        return jsonify({'errors': e.errors()}), 422

    except ValueError as e:
        # Qui catturo il ValueError lanciato dal service
        return jsonify({'error': str(e)}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

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

# Route to save multiple results in batch
@result_bp.route('/batch', methods=['POST'])
def save_results_batch():
    try:
        results_data = request.get_json()
        if not isinstance(results_data, list):
            return jsonify({'error': 'Input must be a list of results'}), 400

        results = [ResultModel(**data) for data in results_data]
    except ValidationError as e:
        return jsonify({'errors': e.errors()}), 422
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    inserted_ids = result_service.save_many(results)
    return jsonify({'message': 'Batch insert successful', 'inserted_ids': inserted_ids}), 201

# Route to get race standings by race ID
@result_bp.route('/standings/<race_id>', methods=['GET'])
def get_race_standings(race_id):
    try:
        standings = result_service.get_race_standings(race_id)
        if not standings:
            return jsonify({'message': 'No results found for the given raceId'}), 404
        return jsonify(standings), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
