"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Calendar,
  Trophy,
  Users,
  ChevronLeft,
  Medal,
  MapPin,
  CirclePlus,
  Trash,
} from "lucide-react";
import Header from "@/components/Header";
import { useParams, useRouter } from "next/navigation";
import { findSeasonDriverStanding, findSeason } from "@/lib/season";
import Link from "next/link";
import AddRaceModal from "@/components/AddRaceModal";
import toast from "react-hot-toast";
import { deleteRace } from "@/lib/race";

function convertDateFormat(dateStr) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

const SeasonDetail = () => {
  const currentYear = new Date().getFullYear();
  const router = useRouter();
  const { year } = useParams();
  const [seasonData, setSeasonData] = useState(null);
  const [driverStandings, setDriverStandings] = useState([]);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("drivers");
  const [addRaceOpen, setAddRaceOpen] = useState(false);

  // Race deletion state
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRaceId, setSelectedRaceId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch season data and standings
  const loadSeasonData = useCallback(async () => {
    setLoading(true);
    try {
      const season = await findSeason(year);
      if (!season) {
        toast.error("Failed to load season");
        return router.back();
      }
      const standings = await findSeasonDriverStanding(year);
      setSeasonData(season);
      setRaces(season.races);
      setDriverStandings(standings);
    } catch (err) {
      console.error("Error loading season data:", err);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    loadSeasonData();
  }, [loadSeasonData]);

  // Aggregate statistics
  const seasonStats = useMemo(() => {
    if (!driverStandings.length) return {};
    const totalPoints = driverStandings.reduce(
      (sum, d) => sum + d.totalPoints,
      0
    );
    const totalWins = driverStandings.reduce((sum, d) => sum + d.wins, 0);
    const uniqueTeams = new Set(driverStandings.map((d) => d.constructorName))
      .size;

    return {
      totalDrivers: driverStandings.length,
      totalPoints,
      totalWins,
      uniqueTeams,
    };
  }, [driverStandings]);

  // Style position badges
  const getPositionStyle = (pos) => {
    switch (pos) {
      case 1:
        return "bg-yellow-100 border-yellow-400 text-yellow-800";
      case 2:
        return "bg-gray-100 border-gray-400 text-gray-800";
      case 3:
        return "bg-orange-100 border-orange-400 text-orange-800";
      default:
        return "bg-white border-gray-200 text-gray-700";
    }
  };

  // Display medal for top 3
  const getPositionIcon = (pos) =>
    pos <= 3 ? <Medal className="w-5 h-5" /> : null;

  // Handler after adding a race
  const handleAddRace = useCallback(
    async (response) => {
      if (response.status === 201) {
        toast.success(response.data.message);
        await loadSeasonData();
      }
    },
    [loadSeasonData]
  );

  // Confirm race deletion
  const confirmDelete = async () => {
    if (!selectedRaceId) return;
    setIsDeleting(true);
    try {
      const res = await deleteRace(selectedRaceId);
      if (res.status === 200) {
        toast.success(res.data.message);
        await loadSeasonData();
      } else {
        toast.error("Failed to delete race.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Unexpected error.");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
      setSelectedRaceId(null);
    }
  };

  if (loading) {
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
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
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
                  {driverStandings[0] && (
                    <Link href={`/driver/${driverStandings[0].driverId}`}>
                      <div className="font-semibold">
                        {driverStandings[0].forename}{" "}
                        {driverStandings[0].surname}
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

      {/* Statistics */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-6 px-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {seasonStats.totalDrivers}
            </div>
            <div className="text-gray-600">Drivers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {seasonStats.uniqueTeams}
            </div>
            <div className="text-gray-600">Teams</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {seasonStats.totalPoints}
            </div>
            <div className="text-gray-600">Total Points</div>
          </div>
        </div>
      </section>

      {/* Tab Switch */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex border-b mb-8">
            <button
              onClick={() => setActiveTab("drivers")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
                activeTab === "drivers"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Driver Standings
            </button>
            <button
              onClick={() => setActiveTab("races")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
                activeTab === "races"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <MapPin className="w-4 h-4 inline mr-2" />
              Race Calendar
            </button>
          </div>

          {/* Driver Standings Table */}
          {activeTab === "drivers" && (
            <div className="bg-white rounded-lg shadow border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="text-xl font-semibold text-neutral-800">
                  Driver Standings
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-6 py-3 text-left">Pos</th>
                      <th className="px-6 py-3 text-left">Driver</th>
                      <th className="px-6 py-3 text-left">Team</th>
                      <th className="px-6 py-3 text-left">Points</th>
                      <th className="px-6 py-3 text-left">Wins</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {driverStandings.map((driver, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full border ${getPositionStyle(
                              index + 1
                            )}`}
                          >
                            {getPositionIcon(index + 1)}
                            <span className="ml-1 font-semibold">
                              {index + 1}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/driver/${driver.driverId}`}>
                            <span className="text-gray-900 font-medium">
                              {driver.forename} {driver.surname}
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {driver.constructorName}
                        </td>
                        <td className="px-6 py-4 font-semibold text-red-600">
                          {driver.totalPoints}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {driver.wins}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Race Calendar Table */}
          {activeTab === "races" && (
            <div className="bg-white rounded-lg shadow border">
              <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-neutral-800">
                  Race Calendar
                </h2>
                {currentYear === year && (
                  <button
                    onClick={() => setAddRaceOpen(true)}
                    title="Add Race"
                    className="px-3 py-2 border rounded-lg text-gray-700 hover:text-red-700 hover:border-red-500 transition"
                  >
                    <CirclePlus className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-6 py-3">Round</th>
                      <th className="px-6 py-3">Grand Prix</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Winner</th>
                      <th className="px-6 py-3">Team</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y">
                    {races.map((race) => (
                      <tr key={race.raceId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-red-100 text-red-800 rounded-full font-semibold">
                            {race.round}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{race.flag}</span>
                            <div>
                              <div className="font-medium text-gray-900">
                                {race.name}
                              </div>
                              <div className="text-sm text-gray-900">
                                {race.circuitName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {convertDateFormat(race.date)}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {race.winner || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {race.team || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          <button
                            onClick={() => {
                              setSelectedRaceId(race.raceId);
                              setShowConfirm(true);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Modals */}
      <AddRaceModal
        isOpen={addRaceOpen}
        onClose={() => setAddRaceOpen(false)}
        onSubmit={handleAddRace}
      />
      {/* Modale di conferma */}
      {showConfirm && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Sei sicuro di voler eliminare la gara ?
            </h2>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setSelectedRaceId(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Annulla
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminazione..." : "Elimina"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonDetail;
