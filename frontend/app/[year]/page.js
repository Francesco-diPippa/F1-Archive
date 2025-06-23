"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Trophy,
  Users,
  ChevronLeft,
  Medal,
  MapPin,
} from "lucide-react";
import Header from "@/components/Header";
import { useParams, useRouter } from "next/navigation";
import { findSeasonDriverStanding, findSeason } from "@/lib/season";
import Link from "next/link";

function convertDateFormat(dateStr) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

const SeasonDetail = () => {
  const router = useRouter();
  const { year: year } = useParams();
  const [seasonData, setSeasonData] = useState(null);
  const [driversStandings, setDriversStandings] = useState([]);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("drivers");

  // Simulazione dati stagione - sostituisci con la tua API
  useEffect(() => {
    const loadSeasonData = async () => {
      try {
        setLoading(true);
        const season = await findSeason(year);
        const standing = await findSeasonDriverStanding(year);

        setSeasonData(season);
        setRaces(season.races);
        setDriversStandings(standing);
      } catch (error) {
        console.error("Error loading season data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSeasonData();
  }, [year]);

  // Statistiche aggregate
  const seasonStats = useMemo(() => {
    if (!driversStandings.length) return {};

    const totalPoints = driversStandings.reduce(
      (sum, driver) => sum + driver.totalPoints,
      0
    );
    const totalWins = driversStandings.reduce(
      (sum, driver) => sum + driver.wins,
      0
    );
    const uniqueTeams = [
      ...new Set(driversStandings.map((standing) => standing.constructorName)),
    ].length;

    return {
      totalPoints,
      totalWins,
      uniqueTeams,
      totalDrivers: driversStandings.length,
    };
  }, [driversStandings]);

  const getPositionColor = (position) => {
    switch (position) {
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

  const getPositionIcon = (position) => {
    if (position <= 3) {
      return <Medal className="w-5 h-5" />;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento stagione...</p>
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
              className="flex items-center space-x-2 text-red-100 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
              <span>Torna all'archivio</span>
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Stagione {seasonData.year}
            </h1>
            <p className="text-xl md:text-2xl text-red-100 mb-8">
              Formula 1 World Championship
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-2 text-red-100">
                <Trophy className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-sm opacity-75">Campione Piloti</div>
                  <Link href={`/driver/${driversStandings[0].driverId}`}>
                    <div className="font-semibold">
                      {driversStandings[0].forename}{" "}
                      {driversStandings[0].surname}
                    </div>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-2 text-red-100">
                <Calendar className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-sm opacity-75">Gare Totali</div>
                  <div className="font-semibold">{seasonData.raceCount}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {seasonStats.totalDrivers}
              </div>
              <div className="text-gray-600">Piloti</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {seasonStats.uniqueTeams}
              </div>
              <div className="text-gray-600">Team</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {seasonStats.totalPoints}
              </div>
              <div className="text-gray-600">Punti Totali</div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab("drivers")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "drivers"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Classifica Piloti
            </button>
            <button
              onClick={() => setActiveTab("races")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "races"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <MapPin className="w-4 h-4 inline mr-2" />
              Calendario Gare
            </button>
          </div>

          {/* Drivers Standings */}
          {activeTab === "drivers" && (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">
                  Classifica Piloti {seasonData.year}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pilota
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Punti
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vittorie
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {driversStandings.map((driver, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getPositionColor(
                              index + 1
                            )}`}
                          >
                            {getPositionIcon(index + 1)}
                            <span className="font-semibold">{index + 1}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/driver/${driver.driverId}`}>
                            <div className="font-medium text-gray-900">
                              {driver.forename} {driver.surname}
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-700">
                            {driver.constructorName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-red-600">
                            {driver.totalPoints}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-700">{driver.wins}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Races Calendar */}
          {activeTab === "races" && (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">
                  Calendario Gare {seasonData.year}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Round
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gran Premio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vincitore
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team Vincente
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {races.map((race) => (
                      <tr
                        key={race.round}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center w-10 h-10 bg-red-100 text-red-800 rounded-full font-semibold">
                            {race.round}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{race.flag}</span>
                            <div>
                              <div className="font-medium text-gray-900">
                                {race.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {race.circuitName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-700">
                            {convertDateFormat(race.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {race.winner || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-700">
                            {race.team || "-"}
                          </div>
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
    </div>
  );
};

export default SeasonDetail;
