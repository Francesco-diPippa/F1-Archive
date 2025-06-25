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

const SeasonDetail = () => {
  const router = useRouter();
  const { year } = useParams();

  // Data states
  const [seasonData, setSeasonData] = useState(null);
  const [driverStandings, setDriverStandings] = useState([]);
  const [races, setRaces] = useState([]);
  const [raceResults, setRaceResults] = useState({});

  // UI states
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("drivers");
  const [addRaceOpen, setAddRaceOpen] = useState(false);
  const [addResultOpen, setAddResultOpen] = useState(false);
  const [selectedRace, setSelectedRace] = useState(null);
  const [expandedRaces, setExpandedRaces] = useState(new Set());
  const [loadingResults, setLoadingResults] = useState(new Set());

  // Deletion modal states
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRaceId, setSelectedRaceId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmResult, setShowConfirmResult] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState(null);

  // Update modal
  const [resultToUpdate, setResultToUpdate] = useState(null);

  /**
   * Load season details and driver standings.
   */
  const loadSeasonData = useCallback(async () => {
    setLoading(true);
    try {
      const season = await findSeason(year);
      if (!season) {
        toast.error("Failed to load season.");
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
  }, [year, router]);

  useEffect(() => {
    loadSeasonData();
  }, [loadSeasonData]);

  /**
   * Load results for a specific race.
   */
  const loadRaceResults = useCallback(
    async (raceId, forceReload = false) => {
      if (!forceReload && raceResults[raceId]) return;

      setLoadingResults((prev) => new Set(prev).add(raceId));
      try {
        const results = await getRaceStandigs(raceId);
        setRaceResults((prev) => ({ ...prev, [raceId]: results }));
      } catch (error) {
        console.error("Error loading race results:", error);
        toast.error("Failed to load results.");
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
   * Expand/collapse race results dropdown.
   */
  const toggleRaceResults = useCallback(
    async (raceId) => {
      const newExpanded = new Set(expandedRaces);
      if (newExpanded.has(raceId)) {
        newExpanded.delete(raceId);
      } else {
        newExpanded.add(raceId);
        await loadRaceResults(raceId);
      }
      setExpandedRaces(newExpanded);
    },
    [expandedRaces, loadRaceResults]
  );

  /**
   * Aggregated statistics from driver standings.
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
   * Handle race addition.
   */
  const handleAddRace = useCallback(
    async (response) => {
      if (response.status === 201) {
        toast.success(response.data.message);
        await loadSeasonData();
        if (selectedRace?.raceId)
          await loadRaceResults(selectedRace.raceId, true);
      }
    },
    [loadSeasonData, loadRaceResults, selectedRace]
  );

  const handleUpdateRace = useCallback(async (raceId) => {
    try {
      const race = await findRace(parseInt(raceId));
      setSelectedRace(race);
      setAddRaceOpen(true);
    } catch (error) {
      console.error("Error loading race:", error);
      toast.error("Failed to load race.");
      setAddRaceOpen(false);
    }
  }, []);

  /**
   * Prepare deletion confirmation.
   */
  const handleDeleteRace = useCallback((raceId) => {
    setSelectedRaceId(raceId);
    setShowConfirm(true);
  }, []);

  /**
   * Confirm and perform race deletion.
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
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Unexpected error.");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
      setSelectedRaceId(null);
    }
  }, [selectedRaceId, loadSeasonData]);

  /**
   * Handle submission of race results.
   */
  const handleAddResults = useCallback(
    async (result, raceId) => {
      console.log(raceId);

      if (!result) return toast.error("Failed to save results.");

      try {
        toast.success("Results saved.");
        await loadSeasonData();
        await loadRaceResults(raceId, true);
        if (raceId) {
          // Clear cache and force reload
          setRaceResults((prev) => {
            const updated = { ...prev };
            delete updated[raceId];
            return updated;
          });

          await loadRaceResults(raceId, true);
        }

        setAddResultOpen(false);
      } catch (err) {
        console.error("Error saving results:", err);
        toast.error("Error saving results.");
      }
    },
    [loadSeasonData, loadRaceResults]
  );

  const handleDeleteResult = useCallback((resultId, raceId) => {
    setSelectedResultId({ id: resultId, raceId });
    setShowConfirmResult(true);
  }, []);

  const confirmDeleteResult = useCallback(async () => {
    console.log(selectedResultId);

    if (!selectedResultId.id) return;

    setIsDeleting(true);
    try {
      const res = await deleteResult(selectedResultId.id);
      console.log(res);
      if (res.status === 200) {
        toast.success("Result deleted successfully");

        // Ricarica i risultati aggiornati
        await loadRaceResults(selectedResultId.raceId, true);
      } else {
        toast.error("Failed to delete result.");
      }
    } catch (err) {
      console.error("Error deleting result:", err);
      toast.error("Unexpected error.");
    } finally {
      setIsDeleting(false);
      setShowConfirmResult(false);
      setSelectedResultId(null);
    }
  }, [selectedResultId, loadRaceResults]);

  const handleUpdateResult = useCallback(async (resultId) => {
    console.log(`Updating ${resultId}`);
    try {
      const result = await findResult(resultId);
      setResultToUpdate(result);
      const race = await findRace(result.raceId);
      console.log(race);

      setSelectedRace(race);
      setAddResultOpen(true);
    } catch (error) {
      console.error("Error loading race results:", error);
      toast.error("Failed to load results.");
      setAddRaceOpen(false);
      setSelectedRace(null);
    }
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero section with main season info */}
      <HeroSectionSeason
        seasonData={seasonData}
        router={router}
        firstDriver={driverStandings[0]}
      />

      {/* Summary statistics */}
      <SeasonStats seasonStats={seasonStats} />

      {/* Tabs for drivers and races */}
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

          {activeTab === "drivers" && (
            <DriverStandingsTable driverStandings={driverStandings} />
          )}

          {activeTab === "races" && (
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
        onClose={() => setAddRaceOpen(false)}
        onSubmit={handleAddRace}
        raceToUpdate={selectedRace}
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
        onClose={() => setAddResultOpen(false)}
        onSubmit={(result) =>
          handleAddResults(result, selectedRace?.raceId || selectedRace?._id)
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
