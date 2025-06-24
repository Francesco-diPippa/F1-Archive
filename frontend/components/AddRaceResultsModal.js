"use client";
import React, { useState, useEffect } from "react";
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

const pointsMap = {
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

const AddRaceResultsModal = ({ isOpen, onClose, onSubmit, selectedRace }) => {
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

  const loadDriversAndConstructors = async () => {
    try {
      const driversData = await findDrivers(null, "asc");
      setDrivers(driversData);

      const constructorsData = await findConstructors();
      setConstructors(constructorsData);
    } catch (error) {
      console.error("Error loading drivers and constructors:", error);
      toast.error("Errore nel caricamento di piloti e costruttori.");
    }
  };

  useEffect(() => {
    if (isOpen) {
      setResult({
        driverId: "",
        constructorId: "",
        positionOrder: "",
        retired: false,
        grid: "",
        points: "",
        laps: "",
      });
      loadDriversAndConstructors();
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setResult((prev) => {
      let updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // Se si sta aggiornando la posizione
      if (name === "positionOrder") {
        const position = parseInt(value);
        if (!prev.retired) {
          updated.points = pointsMap[position] || 0;
        }
      }

      // Se si sta aggiornando il checkbox "retired"
      if (name === "retired") {
        if (checked) {
          updated.points = 0;
          updated.positionText = "R";
        } else {
          const position = parseInt(prev.positionOrder);
          updated.points = pointsMap[position] || 0;
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalResult = {
        raceId: parseInt(selectedRace.raceId),
        driverId: parseInt(result.driverId),
        constructorId: parseInt(result.constructorId),
        positionOrder: parseInt(result.positionOrder),
        positionText: result.retired ? "R" : result.positionOrder,
        grid: parseInt(result.grid),
        points: parseInt(result.points),
        laps: parseInt(result.laps),
        statusId: 1,
      };
      const response = saveResult(finalResult);
      onSubmit(response);
      onClose();
    } catch (error) {
      console.error("Errore nel salvataggio del risultato:", error);
      toast.error("Errore durante il salvataggio");
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
              Aggiungi Risultato Gara
            </h2>
            {selectedRace && (
              <p className="text-sm text-white mt-1">
                {selectedRace.name} - Round {selectedRace.round}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="hover:text-red-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Driver */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline w-4 h-4 mr-2" />
              Pilota *
            </label>
            <select
              name="driverId"
              value={result.driverId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
            >
              <option value="">Seleziona pilota...</option>
              {drivers.map((driver) => (
                <option key={driver._id} value={driver._id}>
                  {driver.forename} {driver.surname}
                </option>
              ))}
            </select>
          </div>

          {/* Constructor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Flag className="inline w-4 h-4 mr-2" />
              Costruttore *
            </label>
            <select
              name="constructorId"
              value={result.constructorId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
            >
              <option value="">Seleziona costruttore...</option>
              {constructors.map((constructor) => (
                <option key={constructor._id} value={constructor._id}>
                  {constructor.name}
                </option>
              ))}
            </select>
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="inline w-4 h-4 mr-2" />
              Posizione finale
            </label>
            <input
              type="number"
              name="positionOrder"
              value={result.positionOrder}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
              placeholder="Es: 1"
            />
          </div>

          {/* Grid Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ArrowUpRight className="inline w-4 h-4 mr-2" />
              Posizione di partenza (griglia)
            </label>
            <input
              type="number"
              name="grid"
              value={result.grid}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
              placeholder="Es: 3"
            />
          </div>

          {/* Points */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BarChart className="inline w-4 h-4 mr-2" />
              Punti
            </label>
            <input
              type="number"
              name="points"
              value={result.points}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
              placeholder="Es: 25"
              disabled
            />
          </div>

          {/* Laps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giri completati
            </label>
            <input
              type="number"
              name="laps"
              value={result.laps}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
              placeholder="Es: 58"
            />
          </div>

          {/* Retired */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="retired"
              checked={result.retired}
              onChange={handleInputChange}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="retired" className="text-sm text-gray-700">
              Ritirato
            </label>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-200 font-medium ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Salvataggio..." : "Aggiungi Risultato"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRaceResultsModal;
