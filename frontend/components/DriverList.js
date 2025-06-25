import React, { useState } from "react";
import { User, Trash, ExternalLink, SquarePen } from "lucide-react";
import FlagByNationality from "./FlagByNationality";
import { deleteDriver } from "@/lib/driver";
import toast from "react-hot-toast";
import Link from "next/link";

function DriverList({ drivers, onDelete, onUpdate }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const handleDeleteClick = (driver) => {
    setSelectedDriver(driver);
    setShowConfirm(true);
  };

  const confirmDelete = async (e) => {
    e.preventDefault();
    if (!selectedDriver) return;

    setIsDeleting(true);
    try {
      const response = await deleteDriver(selectedDriver._id);
      onDelete(response);
    } catch (error) {
      console.error("Errore:", error);
      toast.error(toString(error));
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
      setSelectedDriver(null);
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Drivers List</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {drivers.map((driver) => (
          <div key={driver._id} className="px-6 py-4 hover:bg-red-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <Link href={`/driver/${driver._id}`} className="block p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {driver.forename} {driver.surname}
                    </h4>
                    <FlagByNationality nationality={driver.nationality} />
                  </div>
                </div>
              </Link>

              {/* Link + Delete */}
              <div className="flex items-center space-x-4 justify-end">
                {driver.url && (
                  <a
                    href={driver.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                    title="Vai alla pagina del pilota"
                  >
                    <ExternalLink />
                  </a>
                )}
                <button
                  onClick={() => handleDeleteClick(driver)}
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
            </div>
          </div>
        ))}
      </div>

      {/* Modale di conferma */}
      {showConfirm && selectedDriver && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Sei sicuro di voler eliminare il pilota{" "}
              <span className="font-bold">
                {selectedDriver.forename} {selectedDriver.surname}
              </span>
              ?
            </h2>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setSelectedDriver(null);
                }}
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

export default DriverList;
