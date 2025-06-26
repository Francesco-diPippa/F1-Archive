"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  Calendar,
  Trophy,
  Filter,
  X,
} from "lucide-react";
import Header from "@/components/Header";
import { findDriverResults } from "@/lib/driver";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import FlagByNationality from "@/components/FlagByNationality";
import { findRacesByDriverId } from "@/lib/race";
import { findConstructorsByDriverId } from "@/lib/constructor";
import { findCircuitsByDriverId } from "@/lib/circuit";

const DriverDetailsPage = () => {
  const router = useRouter();
  const { id: driverId } = useParams();

  const [driver, setDriver] = useState(null);
  const [results, setResults] = useState([]);
  const [races, setRaces] = useState({});
  const [constructors, setConstructors] = useState({});
  const [circuits, setCircuits] = useState({});
  const [loading, setLoading] = useState(true);

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCircuit, setSelectedCircuit] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const hasActiveFilters = useMemo(
    () => selectedYear || selectedCircuit || searchQuery.trim(),
    [selectedYear, selectedCircuit, searchQuery]
  );

  const availableYears = useMemo(
    () =>
      [...new Set(Object.values(races).map((r) => r.year))].sort(
        (a, b) => b - a
      ),
    [races]
  );

  const availableCircuits = useMemo(
    () => [...new Set(Object.values(circuits).map((c) => c.name))].sort(),
    [circuits]
  );

  useEffect(() => {
    if (!driverId) return;
    const fetchDriverData = async () => {
      setLoading(true);
      try {
        const driverData = await findDriverResults(driverId);
        const [driverRaces, driverConstructors, driverCircuits] =
          await Promise.all([
            findRacesByDriverId(driverId),
            findConstructorsByDriverId(driverId),
            findCircuitsByDriverId(driverId),
          ]);

        setDriver(driverData);
        setResults(driverData.results);
        setRaces(Object.fromEntries(driverRaces.map((r) => [r._id, r])));
        setConstructors(
          Object.fromEntries(driverConstructors.map((c) => [c._id, c]))
        );
        setCircuits(Object.fromEntries(driverCircuits.map((c) => [c._id, c])));
      } catch (err) {
        console.error("Error loading driver data:", err);
        toast.error("Error loading driver information");
      } finally {
        setLoading(false);
      }
    };
    fetchDriverData();
  }, [driverId]);

  const filteredResults = useMemo(
    () =>
      results.filter((result) => {
        const race = races[result.raceId];
        const circuit = circuits[race?.circuitId];
        return (
          (!searchQuery.trim() ||
            race?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            circuit?.name?.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (!selectedYear || String(race?.year) === selectedYear) &&
          (!selectedCircuit || circuit?.name === selectedCircuit)
        );
      }),
    [results, races, circuits, searchQuery, selectedYear, selectedCircuit]
  );

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedYear("");
    setSelectedCircuit("");
  }, []);

  const stats = useMemo(() => {
    if (!results.length) return null;
    const wins = results.filter((r) => r.positionText === "1").length;
    const podiums = results.filter((r) => parseInt(r.positionText) <= 3).length;
    const points = results.reduce((sum, r) => sum + (r.points || 0), 0);
    const total = results.length;
    return {
      totalRaces: total,
      wins,
      podiums,
      points,
      winRate: ((wins / total) * 100).toFixed(1),
      podiumRate: ((podiums / total) * 100).toFixed(1),
    };
  }, [results]);

  const getPositionColor = useCallback((text) => {
    const pos = parseInt(text);
    if (isNaN(pos)) return "text-gray-500 bg-gray-50";
    if (pos === 1) return "text-yellow-600 bg-yellow-50";
    if (pos === 2) return "text-gray-600 bg-gray-50";
    if (pos === 3) return "text-orange-600 bg-orange-50";
    if (pos <= 10) return "text-green-600 bg-green-50";
    return "text-gray-500 bg-gray-50";
  }, []);

  /* Loading page */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  /* Driver Not Found */
  if (!driver) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Driver not found
            </h2>
            <p className="text-gray-600 mb-4">
              The requested driver could not be found.
            </p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section - Driver Info */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 mb-8 text-red-100 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Drivers</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Driver Basic Info */}
            <div className="lg:col-span-2">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {driver.forename} {driver.surname}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center space-x-3">
                  <FlagByNationality
                    nationality={driver.nationality}
                    showText={false}
                    size={40}
                  />
                  <div>
                    <p className="text-red-100 text-sm">Nationality</p>
                    <p className="text-xl font-semibold">
                      {driver.nationality}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-6 h-6 text-red-200" />
                  <div>
                    <p className="text-red-100 text-sm">Date of Birth</p>
                    <p className="text-xl font-semibold">
                      {driver.dob
                        ? new Date(driver.dob).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Statistics */}
            {stats && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <Trophy className="w-6 h-6 mr-2" />
                  Career Statistics
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-red-100">Total Races</span>
                    <span className="font-bold text-xl">
                      {stats.totalRaces}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-red-100">Wins</span>
                    <span className="font-bold text-xl text-yellow-300">
                      {stats.wins}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-red-100">Podiums</span>
                    <span className="font-bold text-xl">{stats.podiums}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-red-100">Total Points</span>
                    <span className="font-bold text-xl">{stats.points}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-red-100">Win Rate</span>
                    <span className="font-bold text-xl">{stats.winRate}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Race Results Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Race Results
            </h2>
            <p className="text-gray-600">
              Complete race history and performance
            </p>
          </div>

          {/* Filters and Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              {/* Toggle Filters */}
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className={`flex items-center space-x-2 px-4 py-2 text-gray-700 border rounded-lg focus:ring-2 focus:ring-red-500 ${
                  hasActiveFilters
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    !
                  </span>
                )}
              </button>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="flex items-center space-x-2">
                {/* Year Filter */}

                <label className="text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-700"
                >
                  <option value="">All Years</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                {/* Circuit Filter */}

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Circuit
                </label>
                <select
                  value={selectedCircuit}
                  onChange={(e) => setSelectedCircuit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-700"
                >
                  <option value="">All Circuits</option>
                  {availableCircuits.map((circuit) => (
                    <option key={circuit} value={circuit}>
                      {circuit}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <input
                type="text"
                placeholder="Search races..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-700"
              />
            </div>
          </div>

          {/* Results Summary */}
          <p className="mb-6 text-gray-600">
            Showing {filteredResults.length} of {results.length} races
          </p>

          {/* Race Results Table */}
          {filteredResults.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Race
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Circuit
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Constructor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredResults.map((result, index) => {
                      const race = races[result.raceId];
                      const constructor = constructors[result.constructorId];
                      const circuit = circuits[race.circuitId];
                      if (!race) return null; // sicurezza nel caso il race non sia stato caricato

                      return (
                        <tr
                          key={`${race.year}-${race.round}-${index}`}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {race.date
                              ? new Date(race.date).toLocaleDateString()
                              : `${race.year}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {race.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Round {race.round}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {circuit.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPositionColor(
                                result.positionText
                              )}`}
                            >
                              {result.positionText || "DNF"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                            {result.points || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {constructor.name || "N/A"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No races found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {hasActiveFilters
                  ? "Try adjusting your filters"
                  : "No race data available for this driver"}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DriverDetailsPage;
