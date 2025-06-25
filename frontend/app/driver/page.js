"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  List,
  Filter,
  X,
  ArrowDownAZ,
  ArrowUpZA,
  CirclePlus,
} from "lucide-react";
import Header from "@/components/Header";
import DriverList from "@/components/DriverList";
import DriverCard from "@/components/DriverCard";
import { findDriver, findDrivers, findNationalities } from "@/lib/driver";
import AddDriverModal from "@/components/AddDriverModal";
import toast from "react-hot-toast";

// Modal Component per Add Driver

const DriversPage = () => {
  // View and UI states
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [addDriver, setAddDriver] = useState(false);

  // Data and filter states
  const [nationalities, setNationalities] = useState([]);
  const [allDrivers, setAllDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNationality, setSelectedNationality] = useState("");
  const [sortAlpha, setSortAlpha] = useState("asc");

  const [driverToUpdate, setDriverToUpdate] = useState(null);

  // Indicates if any filters are applied
  const hasActiveFilters = !!selectedNationality || !!searchQuery.trim();

  useEffect(() => {
    const fetchNationalities = async () => {
      try {
        const data = await findNationalities();
        setNationalities(data);
      } catch (err) {
        console.error("Error loading drivers:", err);
      }
    };
    fetchNationalities();
  }, [allDrivers]);

  // Fetch drivers whenever nationality or sort order changes
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const data = await findDrivers(selectedNationality || null, sortAlpha);
        setAllDrivers(data);
      } catch (err) {
        console.error("Error loading drivers:", err);
      }
    };
    fetchDrivers();
  }, [selectedNationality, sortAlpha]);

  // Filter drivers based on search query
  useEffect(() => {
    const filtered = allDrivers.filter((driver) => {
      const fullName = `${driver.forename} ${driver.surname}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });
    setFilteredDrivers(filtered);
  }, [searchQuery, allDrivers]);

  // Clear filters handler
  const clearFilters = useCallback(() => {
    setSelectedNationality("");
    setSearchQuery("");
  }, []);

  useEffect(() => console.log(driverToUpdate), [driverToUpdate]);

  const handleAddDriver = useCallback(async (response) => {
    if (response.status === 201) {
      const data = response.data;
      console.log("Response:", data);
      toast.success(data.message);

      try {
        const updatedDrivers = await findDrivers(
          selectedNationality || null,
          sortAlpha
        );
        setAllDrivers(updatedDrivers);
        setDriverToUpdate(null);
      } catch (err) {
        console.error("Error reloading drivers:", err);
      }
    }
  }, []);

  const handleUpdateDriver = useCallback(async (driverId) => {
    console.log(`Updating driver ${driverId}`);

    try {
      const driver = await findDriver(driverId);
      setDriverToUpdate(driver);
      setAddDriver(true);
    } catch (err) {
      console.error("Error reloading driver:", err);
    }
  }, []);

  const handleDeleteDriver = useCallback(async (response) => {
    if (response.status === 200) {
      const data = response.data;
      console.log("Response:", data);
      toast.success(data.message);

      try {
        const updatedDrivers = await findDrivers(
          selectedNationality || null,
          sortAlpha
        );
        setAllDrivers(updatedDrivers);
      } catch (err) {
        console.error("Error reloading drivers:", err);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero section */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            F1 Drivers Archive
          </h1>
          <p className="text-xl md:text-2xl text-red-100 mb-8">
            Explore {allDrivers.length} Formula 1 drivers from past and present
          </p>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
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

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              )}

              {/* Nationality Dropdown */}
              {showFilters && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">
                    Nationality
                  </label>
                  <select
                    className="px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    value={selectedNationality}
                    onChange={(e) => setSelectedNationality(e.target.value)}
                  >
                    <option value="">All Countries</option>
                    {nationalities.map((nat) => (
                      <option key={nat} value={nat}>
                        {nat}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Search, Sort, Add, and View Mode Buttons */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <input
                type="text"
                placeholder="Search drivers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-700"
              />

              {/* Sort A-Z / Z-A */}
              <button
                onClick={() =>
                  setSortAlpha((prev) => (prev === "asc" ? "desc" : "asc"))
                }
                className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-700 ${
                  sortAlpha ? "bg-red-100 border-red-500 text-red-700" : ""
                }`}
              >
                {sortAlpha === "asc" ? <ArrowDownAZ /> : <ArrowUpZA />}
              </button>

              {/* Toggle Add Driver */}
              <button
                onClick={() => setAddDriver(true)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-700 hover:bg-red-50 hover:border-red-500 hover:text-red-700 transition-all duration-200"
                title="Add New Driver"
              >
                <CirclePlus className="w-5 h-5" />
              </button>

              {/* View mode switch */}
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
          </div>

          {/* Results summary */}
          <p className="mb-6 text-gray-600">
            Showing {filteredDrivers.length} of {allDrivers.length} drivers
          </p>

          {/* Display Drivers */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDrivers.map((driver) => (
                <DriverCard
                  key={driver._id}
                  driver={driver}
                  onDelete={handleDeleteDriver}
                  onUpdate={handleUpdateDriver}
                />
              ))}
            </div>
          ) : (
            <DriverList
              drivers={filteredDrivers}
              onDelete={handleDeleteDriver}
            />
          )}
        </div>
      </section>

      {/* Add Driver Modal */}
      <AddDriverModal
        isOpen={addDriver}
        onClose={() => setAddDriver(false)}
        nationalities={nationalities}
        onSubmit={handleAddDriver}
        onUpdate
        driverToUpdate={driverToUpdate}
      />
    </div>
  );
};

export default DriversPage;
