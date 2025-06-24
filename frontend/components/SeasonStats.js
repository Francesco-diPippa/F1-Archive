import React from "react";

/**
 * Season statistics component
 * Displays key metrics like total drivers, teams, and points
 */
const SeasonStats = ({ seasonStats }) => {
  const stats = [
    {
      value: seasonStats.totalDrivers || 0,
      label: "Drivers",
    },
    {
      value: seasonStats.uniqueTeams || 0,
      label: "Teams",
    },
    {
      value: seasonStats.totalPoints || 0,
      label: "Total Points",
    },
  ];

  return (
    <section className="py-8 bg-white border-b">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-6 px-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-3xl font-bold text-red-600">{stat.value}</div>
            <div className="text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SeasonStats;
