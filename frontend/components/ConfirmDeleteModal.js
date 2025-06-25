
import React from "react";

/**
 * Confirmation modal for race deletion
 * Provides a confirmation dialog before deleting a race
 */
const ConfirmDeleteModal = ({ isOpen, isDeleting, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-200">
        {/* Modal Header */}
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Are you sure you want to delete?
        </h2>
        
        {/* Modal Description */}
        <p className="text-gray-600 mb-6">
          This action cannot be undone. All data will be permanently removed.
        </p>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <span className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Deleting...</span>
              </span>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;