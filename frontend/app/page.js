"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Grid, List, Calendar, Trophy, Filter, X } from "lucide-react";
import Header from "@/components/Header";
import { findSeasons } from "@/lib/race";
import SeasonCard from "@/components/SeasonCard";
import SeasonList from "@/components/SeasonList";

const Home = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [allSeasons, setAllSeasons] = useState([]);
  const [filteredSeasons, setFilteredSeasons] = useState([]);

  const [showFilters, setShowFilters] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [yearRangeStart, setYearRangeStart] = useState(undefined);
  const [yearRangeEnd, setYearRangeEnd] = useState(undefined);

  // Fetch all seasons on initial load
  useEffect(() => {
    const loadAllSeasons = async () => {
      try {
        const data = await findSeasons();
        setAllSeasons(data);
        setFilteredSeasons(data);
      } catch (error) {
        console.error("Error loading seasons:", error);
      }
    };

    loadAllSeasons();
  }, []);

  // Filter seasons by year range when filters change
  useEffect(() => {
    const applyFilters = async () => {
      try {
        if (yearRangeStart || yearRangeEnd) {
          const data = await findSeasons(null, yearRangeStart, yearRangeEnd);
          setFilteredSeasons(data);
          setHasActiveFilters(true);
        } else {
          setFilteredSeasons(allSeasons);
          setHasActiveFilters(false);
        }
      } catch (error) {
        console.error("Error applying filters:", error);
      }
    };

    applyFilters();
  }, [yearRangeStart, yearRangeEnd, allSeasons]);

  // Calculate minimum and maximum season year
  const minYear = useMemo(() => {
    if (!allSeasons.length) return null;
    return Math.min(...allSeasons.map((s) => parseInt(s.year)));
  }, [allSeasons]);

  const maxYear = useMemo(() => {
    if (!allSeasons.length) return null;
    return Math.max(...allSeasons.map((s) => parseInt(s.year)));
  }, [allSeasons]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setYearRangeStart(undefined);
    setYearRangeEnd(undefined);
    setFilteredSeasons(allSeasons);
    setHasActiveFilters(false);
  }, [allSeasons]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            F1 Season Archive
          </h1>
          <p className="text-xl md:text-2xl text-red-100 mb-8">
            Explore {minYear && maxYear ? maxYear - minYear + 1 : 0} seasons of
            Formula 1
          </p>
          <div className="flex items-center justify-center space-x-2 text-red-100">
            <Calendar className="w-6 h-6" />
            {minYear && maxYear && (
              <span>
                {minYear}–{maxYear}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Archive Controls and Filters */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              {/* Toggle Filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
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

              {/* Clear Filter Button */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              )}

              {/* Filters Panel */}
              {showFilters && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">
                      Start Year
                    </label>
                    <select
                      className="px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      value={yearRangeStart ?? ""}
                      onChange={(e) =>
                        setYearRangeStart(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                    >
                      <option value="">Start</option>
                      {allSeasons.map((s) => (
                        <option key={s.year} value={s.year}>
                          {s.year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">
                      End Year
                    </label>
                    <select
                      className="px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      value={yearRangeEnd ?? ""}
                      onChange={(e) =>
                        setYearRangeEnd(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                    >
                      <option value="">End</option>
                      {allSeasons
                        .filter(
                          (s) =>
                            !yearRangeStart ||
                            parseInt(s.year) >= parseInt(yearRangeStart)
                        )
                        .map((s) => (
                          <option key={s.year} value={s.year}>
                            {s.year}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-red-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-red-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Display Seasons: Grid or List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSeasons.map((season) => (
                <SeasonCard key={season.year} season={season} />
              ))}
            </div>
          ) : (
            <SeasonList seasons={filteredSeasons} />
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
