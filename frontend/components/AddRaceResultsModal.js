"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Trophy,
  User,
  Flag,
  Hash,
  ArrowUpRight,
  BarChart,
} from "lucide-react";
import toast from "react-hot-toast";
import { findDrivers } from "@/lib/driver";
import { findConstructors } from "@/lib/constructor";
import { saveResult } from "@/lib/result";

// Mapping of finishing positions to championship points
const POINTS_MAP = {
  1: 25,
  2: 18,
  3: 15,
  4: 12,
  5: 10,
  6: 8,
  7: 6,
  8: 4,
  9: 2,
  10: 1,
};

/**
 * Modal component for adding or updating a race result.
 *
 * Props:
 * - isOpen: boolean flag to control visibility
 * - onClose: function to call when closing the modal
 * - onSubmit: callback invoked with the saved result
 * - selectedRace: race details (name, round, raceId)
 * - resultToUpdate: optional existing result for editing
 */
const AddRaceResultsModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedRace,
  resultToUpdate,
}) => {
  const [result, setResult] = useState({
    driverId: "",
    constructorId: "",
    positionOrder: "",
    retired: false,
    grid: "",
    points: "",
    laps: "",
  });
  const [drivers, setDrivers] = useState([]);
  const [constructors, setConstructors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch drivers and constructors from API
  const loadDriversAndConstructors = useCallback(async () => {
    try {
      const driversData = await findDrivers(null, "asc");
      setDrivers(driversData);
      const constructorsData = await findConstructors();
      setConstructors(constructorsData);
    } catch (error) {
      console.error("Error loading drivers and constructors:", error);
      toast.error("Failed to load drivers or constructors.");
    }
  }, []);

  // Initialize form when modal opens or editing data changes
  useEffect(() => {
    if (!isOpen) return;

    loadDriversAndConstructors();

    if (resultToUpdate) {
      setResult({
        driverId: String(resultToUpdate.driverId),
        constructorId: String(resultToUpdate.constructorId),
        positionOrder: String(resultToUpdate.positionOrder),
        retired: resultToUpdate.positionText === "R",
        grid: String(resultToUpdate.grid),
        points: String(resultToUpdate.points),
        laps: String(resultToUpdate.laps),
      });
    } else {
      // Reset form for new entry
      setResult({
        driverId: "",
        constructorId: "",
        positionOrder: "",
        retired: false,
        grid: "",
        points: "",
        laps: "",
      });
    }
  }, [isOpen, resultToUpdate, loadDriversAndConstructors]);

  /**
   * Handle changes in form inputs, updating state and recalculating points.
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setResult((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // Recalculate points when position changes and not retired
      if (name === "positionOrder" && !prev.retired) {
        const pos = parseInt(value, 10);
        updated.points = String(POINTS_MAP[pos] || 0);
      }

      // Zero points if retired, otherwise recalc
      if (name === "retired") {
        if (checked) {
          updated.points = "0";
        } else {
          const pos = parseInt(prev.positionOrder, 10);
          updated.points = String(POINTS_MAP[pos] || 0);
        }
      }

      return updated;
    });
  };

  /**
   * Submit form data to save or update a race result.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare payload for API
      const payload = {
        _id: resultToUpdate?._id || null,
        raceId: resultToUpdate
          ? resultToUpdate.raceId
          : parseInt(selectedRace.raceId, 10),
        driverId: parseInt(result.driverId, 10),
        constructorId: parseInt(result.constructorId, 10),
        positionOrder: parseInt(result.positionOrder, 10),
        positionText: result.retired ? "R" : result.positionOrder,
        grid: parseInt(result.grid, 10),
        points: parseInt(result.points, 10),
        laps: parseInt(result.laps, 10),
        statusId: 1,
      };

      const saved = await saveResult(payload);
      onSubmit(saved);
      onClose();
    } catch (error) {
      console.error("Error saving result:", error);
      toast.error(`Save failed: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-6 rounded-t-xl flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center">
              <Trophy className="w-6 h-6 mr-2" />
              {resultToUpdate ? "Edit Race Result" : "Add Race Result"}
            </h2>
            {selectedRace && (
              <p className="text-sm mt-1">
                {selectedRace.name} — Round {selectedRace.round}
              </p>
            )}
          </div>
          <button onClick={onClose} aria-label="Close modal">
            <X className="w-6 h-6 hover:text-red-200 transition-colors" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Driver selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              <User className="inline w-4 h-4 mr-2" />Driver *
            </label>
            <select
              name="driverId"
              value={result.driverId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-lg text-gray-700"
            >
              <option value="">Select a driver...</option>
              {drivers.map((d) => (
                <option key={d._id} value={String(d._id)}>
                  {d.forename} {d.surname}
                </option>
              ))}
            </select>
          </div>

          {/* Constructor selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              <Flag className="inline w-4 h-4 mr-2" />Constructor *
            </label>
            <select
              name="constructorId"
              value={result.constructorId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-lg text-gray-700"
            >
              <option value="">Select a constructor...</option>
              {constructors.map((c) => (
                <option key={c._id} value={String(c._id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Finishing position */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              <Hash className="inline w-4 h-4 mr-2" />Final Position
            </label>
            <input
              type="number"
              name="positionOrder"
              value={result.positionOrder}
              onChange={handleInputChange}
              placeholder="e.g. 1"
              className="w-full px-3 py-2 border rounded-lg text-gray-700"
            />
          </div>

          {/* Grid position */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              <ArrowUpRight className="inline w-4 h-4 mr-2" />Starting Grid
            </label>
            <input
              type="number"
              name="grid"
              value={result.grid}
              onChange={handleInputChange}
              placeholder="e.g. 3"
              className="w-full px-3 py-2 border rounded-lg text-gray-700"
            />
          </div>

          {/* Points awarded */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              <BarChart className="inline w-4 h-4 mr-2" />Points
            </label>
            <input
              type="number"
              name="points"
              value={result.points}
              disabled
              className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700"
            />
          </div>

          {/* Completed laps */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Completed Laps
            </label>
            <input
              type="number"
              name="laps"
              value={result.laps}
              onChange={handleInputChange}
              placeholder="e.g. 58"
              className="w-full px-3 py-2 border rounded-lg text-gray-700"
            />
          </div>

          {/* Retired checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="retired"
              checked={result.retired}
              onChange={handleInputChange}
              className="h-4 w-4 text-red-600 border-gray-300 rounded "
            />
            <label className="text-sm text-gray-700">Retired</label>
          </div>

          {/* Modal actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium transition-all duration-200 ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:from-red-700 hover:to-red-900"
              }`}
            >
              {loading ? "Saving..." : resultToUpdate ? "Update Result" : "Add Result"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRaceResultsModal;
