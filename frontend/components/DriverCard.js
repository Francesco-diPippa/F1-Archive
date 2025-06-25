import React, { useState } from "react";
import { User, Trash, ExternalLink, SquarePen } from "lucide-react";
import FlagByNationality from "./FlagByNationality";
import { deleteDriver } from "@/lib/driver";
import toast from "react-hot-toast";
import Link from "next/link";

function DriverCard({ driver, onDelete, onUpdate }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async (e) => {
    e.preventDefault();
    setIsDeleting(true);
    try {
      const response = await deleteDriver(driver._id);
      onDelete(response);
    } catch (error) {
      console.error("Errore:", error);
      toast.error(toString(error));
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Parte superiore: info e link alla pagina del pilota */}
      <Link href={`/driver/${driver._id}`} className="block p-6">
        <div className="mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {driver.forename} {driver.surname}
              </h3>
              <FlagByNationality nationality={driver.nationality} />
            </div>
          </div>
        </div>
      </Link>

      {/* Parte inferiore: azioni */}
      <div className="px-6 pb-4 flex items-center space-x-4 justify-end">
        <a
          href={driver.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-600 hover:text-cyan-800"
          title="Apri Wikipedia"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
        <button
          onClick={() => setShowConfirm(true)}
          className="text-red-600 hover:text-red-800"
          title="Elimina"
        >
          <Trash className="w-5 h-5" />
        </button>
        <button
          onClick={() => onUpdate(driver._id)}
          className="text-blue-600 hover:text-blue-800"
          title="Update"
        >
          <SquarePen className="w-5 h-5" />
        </button>
      </div>

      {/* Modale di conferma */}
      {showConfirm && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Sei sicuro di voler eliminare il pilota{" "}
              <span className="font-bold">
                {driver.forename} {driver.surname}
              </span>
              ?
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

export default DriverCard;
