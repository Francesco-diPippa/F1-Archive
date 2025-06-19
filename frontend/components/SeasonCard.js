import React from "react";
import { MapPin, ChevronRight } from "lucide-react";

function SeasonCard({season}) {
  return (
    <div
      key={season.year}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden group hover:scale-[1.02]"
    >
      <div className={`h-2 bg-gradient-to-r ${season.color}`} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900">{season.year}</h3>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              season.status === "In corso"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {season.status}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-600 mb-1">Campione del Mondo</div>
            <div className="font-semibold text-gray-900"></div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Team</div>
            <div className="font-medium text-gray-800"></div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              {season.count} gare
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeasonCard;
