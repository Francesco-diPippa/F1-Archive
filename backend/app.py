from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database import Database
from routes.driver_routes import driver_bp
from routes.constructor_routes import constructor_bp
from routes.race_routes import race_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS
    CORS(app)

    # Initialize and connect to the database
    db = Database()
    db.connect()

    # Register API blueprints with prefixes
    app.register_blueprint(driver_bp, url_prefix='/api/driver')
    app.register_blueprint(constructor_bp, url_prefix='/api/constructor')
    app.register_blueprint(race_bp, url_prefix='/api/race')

    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'API server is running'
        }), 200

    # Handle 404 errors (route not found)
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404

    # Handle 500 errors (internal server errors)
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500

    return app

# Run the app
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
