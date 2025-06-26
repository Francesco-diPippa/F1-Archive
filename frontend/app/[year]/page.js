"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Users, MapPin } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import Header from "@/components/Header";
import AddRaceModal from "@/components/AddRaceModal";
import AddRaceResultsModal from "@/components/AddRaceResultsModal";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import DriverStandingsTable from "@/components/DriverStandingsTable";
import HeroSectionSeason from "@/components/HeroSectionSeason";
import SeasonStats from "@/components/SeasonStats";
import RaceCalendarTable from "@/components/RaceCalendarTable";

import { findSeason, findSeasonDriverStanding } from "@/lib/season";
import { deleteRace, findRace } from "@/lib/race";
import { deleteResult, findResult, getRaceStandigs } from "@/lib/result";

/**
 * SeasonDetail
 * Displays season overview, driver standings, and race calendar.
 * Handles CRUD operations for races and race results.
 */
const SeasonDetail = () => {
  const router = useRouter();
  const { year } = useParams();

  // Data
  const [seasonData, setSeasonData] = useState(null);
  const [driverStandings, setDriverStandings] = useState([]);
  const [races, setRaces] = useState([]);
  const [raceResults, setRaceResults] = useState({});

  // UI State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("drivers");
  const [addRaceOpen, setAddRaceOpen] = useState(false);
  const [addResultOpen, setAddResultOpen] = useState(false);
  const [selectedRace, setSelectedRace] = useState(null);
  const [expandedRaces, setExpandedRaces] = useState(new Set());
  const [loadingResults, setLoadingResults] = useState(new Set());

  // Delete modals
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRaceId, setSelectedRaceId] = useState(null);
  const [showConfirmResult, setShowConfirmResult] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Editing results
  const [resultToUpdate, setResultToUpdate] = useState(null);
  const [raceToUpdate, setRaceToUpdate] = useState(null);

  /**
   * Fetch season info and driver standings.
   */
  const loadSeasonData = useCallback(async () => {
    setLoading(true);
    try {
      const season = await findSeason(year);
      if (!season) {
        toast.error("Season not found.");
        return router.back();
      }
      const standings = await findSeasonDriverStanding(year);
      setSeasonData(season);
      setRaces(season.races);
      setDriverStandings(standings);
    } catch (error) {
      console.error("Failed to load season data:", error);
      toast.error("Failed to load season data.");
    } finally {
      setLoading(false);
    }
  }, [year, router]);

  useEffect(() => {
    loadSeasonData();
  }, [loadSeasonData]);

  /**
   * Load results for a given race (with optional force reload).
   */
  const loadRaceResults = useCallback(
    async (raceId, force = false) => {
      if (!force && raceResults[raceId]) return;
      setLoadingResults((prev) => new Set(prev).add(raceId));
      try {
        const results = await getRaceStandigs(raceId);
        setRaceResults((prev) => ({ ...prev, [raceId]: results }));
      } catch (error) {
        console.error("Failed to load race results:", error);
        toast.error("Unable to load race results.");
      } finally {
        setLoadingResults((prev) => {
          const updated = new Set(prev);
          updated.delete(raceId);
          return updated;
        });
      }
    },
    [raceResults]
  );

  /**
   * Toggle expansion of race result list.
   */
  const toggleRaceResults = useCallback(
    async (raceId) => {
      const expanded = new Set(expandedRaces);
      if (expanded.has(raceId)) {
        expanded.delete(raceId);
      } else {
        expanded.add(raceId);
        await loadRaceResults(raceId);
      }
      setExpandedRaces(expanded);
    },
    [expandedRaces, loadRaceResults]
  );

  /**
   * Compute aggregated season statistics.
   */
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

  /**
   * Handle race creation or update.
   */
  const handleAddRace = useCallback(
    async (response) => {
      if (response.status === 201) {
        await loadSeasonData();
        if (selectedRace?.raceId) {
          await loadRaceResults(selectedRace.raceId, true);
        }
      }
    },
    [loadSeasonData, loadRaceResults, selectedRace]
  );

  /**
   * Open modal for editing a race.
   */
  const handleUpdateRace = useCallback(async (raceId) => {
    try {
      const race = await findRace(parseInt(raceId, 10));
      setResultToUpdate(race);
      setAddRaceOpen(true);
    } catch (error) {
      console.error("Failed to load race:", error);
      toast.error("Unable to load race for editing.");
    }
  }, []);

  /**
   * Initiate race deletion confirmation.
   */
  const handleDeleteRace = useCallback((raceId) => {
    setSelectedRaceId(raceId);
    setShowConfirm(true);
  }, []);

  /**
   * Confirm and delete race.
   */
  const confirmDelete = useCallback(async () => {
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
    } catch (error) {
      console.error("Error deleting race:", error);
      toast.error("Unexpected error.");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
      setSelectedRaceId(null);
    }
  }, [selectedRaceId, loadSeasonData]);

  /**
   * Handle adding or updating race results.
   */
  const handleAddResults = useCallback(
    async (result, raceId) => {
      if (!result) return toast.error("Failed to save results.");
      try {
        toast.success("Results saved.");
        await loadSeasonData();
        await loadRaceResults(raceId, true);
        setAddResultOpen(false);
      } catch (error) {
        console.error("Error saving results:", error);
        toast.error("Error saving results.");
      }
    },
    [loadSeasonData, loadRaceResults]
  );

  /**
   * Prepare deletion confirmation for a result.
   */
  const handleDeleteResult = useCallback((resultId, raceId) => {
    setSelectedResultId({ id: resultId, raceId });
    setShowConfirmResult(true);
  }, []);

  /**
   * Confirm and delete race result.
   */
  const confirmDeleteResult = useCallback(async () => {
    if (!selectedResultId?.id) return;
    setIsDeleting(true);
    try {
      const res = await deleteResult(selectedResultId.id);
      if (res.status === 200) {
        toast.success("Result deleted successfully");
        await loadRaceResults(selectedResultId.raceId, true);
      } else {
        toast.error("Failed to delete result.");
      }
    } catch (error) {
      console.error("Error deleting result:", error);
      toast.error("Unexpected error.");
    } finally {
      setIsDeleting(false);
      setShowConfirmResult(false);
      setSelectedResultId(null);
    }
  }, [selectedResultId, loadRaceResults]);

  /**
   * Open modal for editing a race result.
   */
  const handleUpdateResult = useCallback(async (resultId) => {
    try {
      const result = await findResult(resultId);
      const race = await findRace(result.raceId);
      setResultToUpdate(result);
      setSelectedRace(race);
      setAddResultOpen(true);
    } catch (error) {
      console.error("Failed to load result for editing:", error);
      toast.error("Unable to load result.");
    }
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSectionSeason
        seasonData={seasonData}
        router={router}
        firstDriver={driverStandings[0]}
      />
      <SeasonStats seasonStats={seasonStats} />

      {/* Drivers vs Races Tabs */}
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

          {activeTab === "drivers" ? (
            <DriverStandingsTable driverStandings={driverStandings} />
          ) : (
            <RaceCalendarTable
              year={year}
              races={races}
              expandedRaces={expandedRaces}
              raceResults={raceResults}
              loadingResults={loadingResults}
              onAddRace={() => setAddRaceOpen(true)}
              onUpdateRace={handleUpdateRace}
              onDeleteRace={handleDeleteRace}
              onToggleResults={toggleRaceResults}
              onAddResult={(race) => {
                setSelectedRace(race);
                setAddResultOpen(true);
              }}
              onDeleteResult={handleDeleteResult}
              onUpdateResult={handleUpdateResult}
            />
          )}
        </div>
      </section>

      {/* Modals */}
      <AddRaceModal
        isOpen={addRaceOpen}
        onClose={() => {
          setAddRaceOpen(false);
          setRaceToUpdate(null);
        }}
        onSubmit={handleAddRace}
        raceToUpdate={raceToUpdate}
      />

      <ConfirmDeleteModal
        isOpen={showConfirm}
        isDeleting={isDeleting}
        onCancel={() => {
          setShowConfirm(false);
          setSelectedRaceId(null);
        }}
        onConfirm={confirmDelete}
      />

      <AddRaceResultsModal
        isOpen={addResultOpen}
        onClose={() => {
          setAddResultOpen(false);
          setResultToUpdate(null);
        }}
        onSubmit={(res) =>
          handleAddResults(res, selectedRace?.raceId || selectedRace?._id)
        }
        selectedRace={selectedRace}
        resultToUpdate={resultToUpdate}
      />

      <ConfirmDeleteModal
        isOpen={showConfirmResult}
        isDeleting={isDeleting}
        onCancel={() => {
          setShowConfirmResult(false);
          setSelectedResultId(null);
        }}
        onConfirm={confirmDeleteResult}
      />
    </div>
  );
};

export default SeasonDetail;
