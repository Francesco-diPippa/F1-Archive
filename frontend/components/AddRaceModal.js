"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  CirclePlus,
  MapPin,
  Trophy,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { findCircuits } from "@/lib/circuit";
import { saveRace } from "@/lib/race";

/**
 * Modal component for adding or updating a race.
 *
 * Props:
 * - isOpen: boolean to control visibility
 * - onClose: callback when closing modal
 * - onSubmit: callback invoked with API response
 * - raceToUpdate: optional race object for editing
 */
const AddRaceModal = ({ isOpen, onClose, onSubmit, raceToUpdate }) => {
  const currentYear = new Date().getFullYear();

  // Circuits list and loading state
  const [circuits, setCircuits] = useState([]);
  const [loadingCircuits, setLoadingCircuits] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    id: null,
    year: currentYear,
    circuitId: "",
    name: "",
    round: "",
    date: "",
  });

  /**
   * Load circuits from API.
   */
  const loadCircuits = useCallback(async () => {
    setLoadingCircuits(true);
    try {
      const data = await findCircuits();
      setCircuits(data);
    } catch (error) {
      console.error("Error loading circuits:", error);
      toast.error("Failed to load circuits.");
    } finally {
      setLoadingCircuits(false);
    }
  }, []);

  /**
   * Initialize form and fetch circuits when modal opens or raceToUpdate changes.
   */
  useEffect(() => {
    if (!isOpen) return;

    // Pre-fill form if editing an existing race
    if (raceToUpdate) {
      setFormData({
        id: raceToUpdate._id,
        year: raceToUpdate.year,
        circuitId: raceToUpdate.circuitId,
        name: raceToUpdate.name,
        round: String(raceToUpdate.round),
        date: raceToUpdate.date,
      });
    } else {
      // Reset form for new race
      setFormData({
        id: null,
        year: currentYear,
        circuitId: "",
        name: "",
        round: "",
        date: "",
      });
    }

    loadCircuits();
  }, [isOpen, raceToUpdate, currentYear, loadCircuits]);

  /**
   * Handle input changes.
   */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  /**
   * Validate form and submit to API.
   */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Validate date is within current year
      const selected = new Date(formData.date);
      const maxDate = new Date(currentYear, 11, 31);
      if (selected > maxDate) {
        toast.error(`Date cannot exceed ${currentYear}.`);
        return;
      }

      try {
        const payload = {
          _id: formData.id,
          year: formData.year,
          circuitId: parseInt(formData.circuitId, 10),
          name: formData.name.trim(),
          round: parseInt(formData.round, 10),
          date: formData.date,
        };

        const response = await saveRace(payload);
        toast.success("Race saved successfully.");
        onSubmit?.(response);
        onClose();
      } catch (error) {
        console.error("Error saving race:", error);
        toast.error("Failed to save race.");
      }
    },
    [formData, currentYear, onSubmit, onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-red-600 to-red-800 p-6 text-white">
          <h2 className="flex items-center text-xl font-bold">
            <CirclePlus className="mr-2 h-6 w-6" />
            {raceToUpdate ? "Edit Race" : "Add New Race"}
          </h2>
          <button onClick={onClose} aria-label="Close modal">
            <X className="h-6 w-6 hover:text-red-200" />
          </button>
        </div>

        {/* Body */}
        {loadingCircuits ? (
          <div className="p-6 text-center text-gray-600">
            Loading circuits...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            {/* Year (read-only) */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                <CalendarIcon className="inline mr-1 w-4 h-4" />
                Year
              </label>
              <input
                name="year"
                value={formData.year}
                readOnly
                className="w-full rounded-lg border-gray-300 bg-gray-100 px-3 py-2 text-gray-700 cursor-not-allowed"
              />
            </div>

            {/* Circuit selector */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                <MapPin className="inline mr-1 w-4 h-4" />
                Circuit *
              </label>
              <select
                name="circuitId"
                value={formData.circuitId}
                onChange={handleChange}
                required
                className="w-full rounded-lg border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-500 text-gray-700"
              >
                <option value="">Select a circuit...</option>
                {circuits.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} — {c.location}, {c.country}
                  </option>
                ))}
              </select>
            </div>

            {/* Race Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                <Trophy className="inline mr-1 w-4 h-4" />
                Race Name *
              </label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter race name"
                className="w-full rounded-lg border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-500 text-gray-700"
              />
            </div>

            {/* Round */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                <CalendarIcon className="inline mr-1 w-4 h-4" />
                Round
              </label>
              <input
                name="round"
                type="number"
                value={formData.round}
                onChange={handleChange}
                placeholder="Enter round number"
                className="w-full rounded-lg border-gray-300 px-3 py-2 text-gray-700"
              />
            </div>

            {/* Date */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                <CalendarIcon className="inline mr-1 w-4 h-4" />
                Race Date *
              </label>
              <input
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
                max={`${currentYear}-12-31`}
                className="w-full rounded-lg border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-500 text-gray-700"
              />
              <p className="mt-1 text-xs text-gray-500">
                Date must be within {currentYear}
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-gradient-to-r from-red-600 to-red-800 px-4 py-2 text-white font-medium hover:from-red-700 hover:to-red-900 transition"
              >
                {raceToUpdate ? "Update Race" : "Add Race"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddRaceModal;
