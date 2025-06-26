// DriverCardOptimized.jsx
// Displays individual driver info with actions: view details, edit, delete.
// Includes a confirmation overlay before deletion to prevent accidental removals.

import React, { useState, useCallback } from "react";
import { User, Trash, ExternalLink, SquarePen } from "lucide-react";
import FlagByNationality from "./FlagByNationality";
import { deleteDriver } from "@/lib/driver";
import toast from "react-hot-toast";
import Link from "next/link";

export default function DriverCard({ driver, onDelete, onUpdate }) {
  // Local UI state
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handler: show delete confirmation overlay
  const handleShowConfirm = useCallback(() => {
    setConfirmVisible(true);
  }, []);

  // Handler: hide confirmation overlay
  const handleCancel = useCallback(() => {
    setConfirmVisible(false);
  }, []);

  // Handler: perform deletion
  const handleDelete = useCallback(
    async (e) => {
      e.preventDefault();
      setIsDeleting(true);

      try {
        const response = await deleteDriver(driver._id);
        toast.success(response.data.message);
        onDelete(response);
      } catch (error) {
        console.error("Deletion error:", error);
        toast.error(error.message || "Failed to delete driver.");
      } finally {
        setIsDeleting(false);
        setConfirmVisible(false);
      }
    },
    [driver._id, onDelete]
  );

  return (
    <div className="bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Top section: driver avatar, name, nationality, link to profile */}
      <Link href={`/driver/${driver._id}`} className="block p-6 hover:bg-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full">
            <User className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{driver.forename} {driver.surname}</h3>
            <FlagByNationality nationality={driver.nationality} />
          </div>
        </div>
      </Link>

      {/* Bottom section: external link, edit, delete */}
      <div className="px-6 pb-4 flex items-center justify-end space-x-4">
        {/* Open Wikipedia page in a new tab */}
        <a
          href={driver.url}
          target="_blank"
          rel="noopener noreferrer"
          title="Open Wikipedia"
          className="text-cyan-600 hover:text-cyan-800"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
        {/* Trigger delete confirmation */}
        <button
          onClick={handleShowConfirm}
          title="Delete driver"
          className="text-red-600 hover:text-red-800"
        >
          <Trash className="w-5 h-5" />
        </button>
        {/* Edit driver details */}
        <button
          onClick={() => onUpdate(driver._id)}
          title="Edit driver"
          className="text-blue-600 hover:text-blue-800"
        >
          <SquarePen className="w-5 h-5" />
        </button>
      </div>

      {/* Confirmation overlay */}
      {confirmVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-xl shadow-2xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Are you sure you want to delete{' '}
              <span className="font-bold">{driver.forename} {driver.surname}</span>?
            </h2>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
