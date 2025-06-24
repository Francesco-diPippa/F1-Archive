import React from "react";
import { ChevronLeft, Trophy, Calendar } from "lucide-react";
import Link from "next/link";

/**
 * Hero section component for season detail page
 * Displays season title, champion, and basic statistics
 */
const SeasonHero = ({ seasonData, driverStandings, onBack }) => {
  const champion = driverStandings[0];

  return (
    <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-red-100 hover:text-white transition"
          >
            <ChevronLeft className="w-6 h-6" />
            <span>Back to Archive</span>
          </button>
        </div>

        {/* Season Title and Info */}
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Season {seasonData.year}
          </h1>
          <p className="text-xl md:text-2xl text-red-100 mb-8">
            Formula 1 World Championship
          </p>

          {/* Champion and Race Count Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Drivers Champion */}
            <div className="flex items-center justify-center space-x-2 text-red-100">
              <Trophy className="w-6 h-6" />
              <div className="text-left">
                <div className="text-sm opacity-75">Drivers Champion</div>
                {champion && (
                  <Link href={`/driver/${champion.driverId}`}>
                    <div className="font-semibold hover:text-white transition cursor-pointer">
                      {champion.forename} {champion.surname}
                    </div>
                  </Link>
                )}
              </div>
            </div>

            {/* Total Races */}
            <div className="flex items-center justify-center space-x-2 text-red-100">
              <Calendar className="w-6 h-6" />
              <div className="text-left">
                <div className="text-sm opacity-75">Total Races</div>
                <div className="font-semibold">{seasonData.raceCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeasonHero;
