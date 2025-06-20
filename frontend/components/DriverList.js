import React from "react";
import { User } from "lucide-react";
import FlagByNationality from "./FlagByNationality";

function DriverList({ drivers }) {
  return (
    <div className="bg-gray-100 rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Drivers List</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {drivers.map((driver) => (
          <div key={driver._id} className="px-6 py-4 hover:bg-red-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    {driver.forename} {driver.surname}
                  </h4>
                  <FlagByNationality nationality={driver.nationality} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DriverList;
