import React from "react";
import Header from "@/components/Header";

/**
 * Loading spinner component displayed while fetching season data
 */
const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading season data...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;