import React from "react";
import { ChevronRight } from "lucide-react";

function SeasonItem({season}) {
  return (
    <tr key={season.year} className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-lg font-bold text-gray-900">{season.year}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-semibold text-gray-900"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-gray-800"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-gray-600">{season.count}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <ChevronRight className="w-5 h-5 text-gray-400 hover:text-red-600 transition-colors" />
      </td>
    </tr>
  );
}

export default SeasonItem;
