"use client";
import React, { useEffect, useState } from "react";
import { X, CirclePlus, MapPin, Trophy, Calendar } from "lucide-react";
import { saveRace } from "@/lib/race";
import toast from "react-hot-toast";
import { findCircuits } from "@/lib/circuit";
import { formToJSON } from "axios";

function AddRaceModal({ isOpen, onClose, onSubmit, raceToUpdate }) {
  const currentYear = new Date().getFullYear();
  const [circuits, setCircuits] = useState([]);
  const [isLoadingCircuits, setIsLoadingCircuits] = useState(true);
  const [formData, setFormData] = useState({
    year: currentYear,
    circuitId: "",
    round: "",
    name: "",
    date: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    const loadCircuits = async () => {
      setIsLoadingCircuits(true);
      try {
        const data = await findCircuits(); // await was missing
        setCircuits(data);
      } catch (error) {
        console.error("Errore durante il caricamento dei circuiti:", error);
        toast.error("Errore nel caricamento dei circuiti");
      } finally {
        setIsLoadingCircuits(false);
      }
    };

    if (raceToUpdate) {
      setFormData({
        id: parseInt(raceToUpdate._id),
        circuitId: raceToUpdate.circuitId,
        date: raceToUpdate.date,
        name: raceToUpdate.name,
        round: raceToUpdate.round,
        year: raceToUpdate.year,
      });
    }

    loadCircuits();
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedDate = new Date(formData.date);
    const maxDate = new Date(currentYear, 11, 31);

    if (selectedDate > maxDate) {
      toast.error("La data non può essere oltre l'anno corrente");
      return;
    }

    try {
      console.log("form data");
      console.log(formData);

      const response = await saveRace(formData);
      onSubmit?.(response);
      setFormData({
        year: currentYear,
        circuitId: "",
        round: "",
        name: "",
        date: "",
      });
      onClose();
    } catch (error) {
      console.error("Errore API:", error);
      toast.error("Errore durante il salvataggio della gara");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center">
              <CirclePlus className="mr-3 w-6 h-6" />
              Add New Race
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {isLoadingCircuits ? (
          <div className="p-6 text-center text-gray-600">
            Loading circuits...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Year
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
              />
            </div>

            {/* Circuit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-2" />
                Circuit *
              </label>
              <select
                name="circuitId"
                value={formData.circuitId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-700"
              >
                <option value="">Select circuit...</option>
                {circuits.map((circuit) => (
                  <option key={circuit._id} value={circuit._id}>
                    {circuit.name} - {circuit.location}, {circuit.country}
                  </option>
                ))}
              </select>
            </div>

            {/* Race Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Trophy className="inline w-4 h-4 mr-2" />
                Race Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-700"
                placeholder="Enter race name..."
              />
            </div>

            {/* Round */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Round
              </label>
              <input
                type="number"
                name="round"
                placeholder="Enter race round..."
                value={formData.round}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
              />
            </div>

            {/* Race Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Race Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                max={`${currentYear}-12-31`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-700"
              />
              <p className="text-xs text-gray-500 mt-1">
                Date cannot exceed current year ({currentYear})
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-200 font-medium"
              >
                Add Race
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AddRaceModal;
