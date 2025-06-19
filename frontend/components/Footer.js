import React from "react";
import { Trophy } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              Formula 1 Dashboard
            </span>
          </div>
          <div className="flex space-x-6 text-gray-600">
            <a href="#" className="hover:text-red-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-red-600 transition-colors">
              Termini
            </a>
            <a href="#" className="hover:text-red-600 transition-colors">
              Contatti
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
