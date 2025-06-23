from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from bson.errors import InvalidId
from service.season_service import SeasonService
from models.season import SeasonModel

# Create a Blueprint for the 'season' endpoint
season_bp = Blueprint('season', __name__)
season_service = SeasonService()

# Route to find all seasons

# /seasons	Restituisce tutte le stagioni
# /seasons?year=2018	Solo la stagione 2018
# /seasons?from_year=2010&to_year=2015	Stagioni dal 2010 al 2015
# /seasons?from_year=2020	Stagioni dal 2020 in poi
# /seasons?to_year=2020	Stagioni fino 2020 
@season_bp.route('', methods=['GET'])
def find_seasons():
    year = request.args.get('year', type=int)
    from_year = request.args.get('from_year', type=int)
    to_year = request.args.get('to_year', type=int)

    # Validazione: from_year non deve essere maggiore di to_year
    if from_year is not None and to_year is not None and from_year > to_year:
        return jsonify({
            "error": "Invalid year range: from_year must be less than or equal to to_year"
        }), 400

    seasons = season_service.find(year=year, from_year=from_year, to_year=to_year)
    
    if seasons.__len__() == 1:
        return jsonify(seasons[0].to_dict()), 200
    return jsonify([s.to_dict() for s in seasons]), 200

@season_bp.route('/standing', methods=['GET'])
def find_driver_standing():
    year = request.args.get('year', type=int)
    standing = season_service.find_driver_standing(year=year)
    return jsonify(standing), 200

@season_bp.route('/<year>', methods=['GET'])
def find_season(year):
    season = season_service.find_season(year=int(year))
    return jsonify(season.to_dict()), 200

@season_bp.route('/<year>', methods=['DELETE'])
def delete_season(year):
    season = season_service.delete_season(year=int(year))
    if season:
        return jsonify({'succes': True, 'message': 'Season deleted'}), 200
    else:
        return jsonify({'succes': False, 'message': 'Error deleting season'}), 404