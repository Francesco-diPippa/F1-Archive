from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
from database import Database
from service.driver_service import DriverService
from models.driver import DriverModel
from models.constructor import ConstructorModel
from service.constructor_service import ConstructorService
from service.race_service import RaceService
from routes.driver_routes import driver_bp
from routes.constructor_routes import constructor_bp
from routes.race_routes import race_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app)
    
    db = Database()
    db.connect()

    # Blueprint registration
    app.register_blueprint(driver_bp, url_prefix='/api/driver')
    app.register_blueprint(constructor_bp, url_prefix='/api/constructor')
    app.register_blueprint(race_bp, url_prefix='/api/race')
    
    @app.route('/api/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'Movie API Server is running'
        }), 200
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint non trovato'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Errore interno del server'}), 500
        
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)