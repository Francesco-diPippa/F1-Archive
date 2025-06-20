import React from "react";
import { User, Flag } from "lucide-react";
import FlagByNationality from "./FlagByNationality";

function DriverCard({ driver }) {
  return (
    <div className="bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {driver.forename} {driver.surname}
              </h3>
              <FlagByNationality nationality={driver.nationality} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriverCard;
