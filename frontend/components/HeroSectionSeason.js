import React from "react";
import { ChevronLeft, Trophy, Calendar } from "lucide-react";
import Link from "next/link";

function HeroSectionSeason({ seasonData, firstDriver, router }) {
  return (
    <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-red-100 hover:text-white transition"
          >
            <ChevronLeft className="w-6 h-6" />
            <span>Back to Archive</span>
          </button>
        </div>

        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Season {seasonData.year}
          </h1>
          <p className="text-xl md:text-2xl text-red-100 mb-8">
            Formula 1 World Championship
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-red-100">
              <Trophy className="w-6 h-6" />
              <div className="text-left">
                <div className="text-sm opacity-75">Drivers Champion</div>
                {firstDriver && (
                  <Link href={`/driver/${firstDriver.driverId}`}>
                    <div className="font-semibold">
                      {firstDriver.forename} {firstDriver.surname}
                    </div>
                  </Link>
                )}
              </div>
            </div>

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
}

export default HeroSectionSeason;
