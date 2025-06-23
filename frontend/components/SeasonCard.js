import React, { useState } from "react";
import { MapPin, ChevronRight, Trash } from "lucide-react";
import Link from "next/link";
import { deleteSeason } from "@/lib/season";
import toast from "react-hot-toast";

function SeasonCard({ season, onDelete }) {
  const currentYear = new Date().getFullYear();
  const isCurrentSeason = parseInt(season.year) === currentYear;
  const status = isCurrentSeason ? "In corso" : "Conclusa";

  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async (e) => {
    e.preventDefault();
    setIsDeleting(true);
    try {
      const response = await deleteSeason(season.year);
      onDelete(response);
    } catch (error) {
      console.error("Errore:", error);
      toast.error(error?.message || "Errore durante l'eliminazione");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200">
      {/* Barra colorata in alto */}
      <div className={`h-2 bg-gradient-to-r ${season.color}`} />

      {/* Contenuto principale con link */}
      <Link href={`/${season.year}`} className="block p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900">{season.year}</h3>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isCurrentSeason
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {status}
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 text-sm text-gray-600">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {season.raceCount} gare
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
        </div>
      </Link>

      {/* Azioni in basso */}
      <div className="px-6 pb-4 flex items-center justify-end">
        <button
          onClick={() => setShowConfirm(true)}
          className="text-red-600 hover:text-red-800"
          title="Elimina stagione"
        >
          <Trash className="w-5 h-5" />
        </button>
      </div>

      {/* Modale di conferma */}
      {showConfirm && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Sei sicuro di voler eliminare la stagione{" "}
              <span className="font-bold">{season.year}</span>?
            </h2>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
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
}

export default SeasonCard;
