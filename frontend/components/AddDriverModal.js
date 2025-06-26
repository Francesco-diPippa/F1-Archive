"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  CirclePlus,
  User,
  Flag,
  Calendar as CalendarIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { saveDriver } from "@/lib/driver";

/**
 * Formats a raw date string (ISO) into YYYY-MM-DD.
 * @param {string} rawDate - The raw ISO date string.
 * @returns {string} - Formatted date for input value.
 */
const formatDate = (rawDate) => {
  const date = new Date(rawDate);
  const pad = (num) => num.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
};

/**
 * Modal component for adding or editing a driver.
 *
 * Props:
 * @param {boolean} isOpen - Controls modal visibility.
 * @param {() => void} onClose - Callback to close modal.
 * @param {string[]} nationalities - List of nationality options.
 * @param {(response: any) => void} onSubmit - Callback after successful save.
 * @param {object} [driverToUpdate] - Existing driver object for editing.
 */
const AddDriverModal = ({
  isOpen,
  onClose,
  nationalities,
  onSubmit,
  driverToUpdate,
}) => {
  const [formData, setFormData] = useState({
    forename: "",
    surname: "",
    nationality: "",
    dob: "",
    url: "",
    id: null,
  });

  /**
   * Initializes form data when modal opens or driverToUpdate changes.
   */
  useEffect(() => {
    if (!isOpen) return;

    if (driverToUpdate) {
      setFormData({
        id: driverToUpdate._id,
        forename: driverToUpdate.forename || "",
        surname: driverToUpdate.surname || "",
        nationality: driverToUpdate.nationality || "",
        dob: driverToUpdate.dob ? formatDate(driverToUpdate.dob) : "",
        url: driverToUpdate.url || "",
      });
    } else {
      setFormData({
        forename: "",
        surname: "",
        nationality: "",
        dob: "",
        url: "",
        id: null,
      });
    }
  }, [isOpen, driverToUpdate]);

  /**
   * Handles input changes for controlled inputs.
   */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  /**
   * Submits form data to save or update a driver.
   */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        const payload = {
          _id: formData.id,
          forename: formData.forename.trim(),
          surname: formData.surname.trim(),
          nationality: formData.nationality,
          dob: formData.dob,
          url: formData.url.trim(),
        };

        const response = await saveDriver(payload);
        toast.success(response.data?.message || "Driver saved successfully.");
        onSubmit?.(response);
        setFormData({
          forename: "",
          surname: "",
          nationality: "",
          dob: "",
          url: "",
          id: null,
        });
        onClose();
      } catch (error) {
        console.error("Error saving driver:", error);
        toast.error(error?.message || "Failed to save driver.");
      }
    },
    [formData, onSubmit, onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-red-600 to-red-800 p-6 text-white">
          <h2 className="flex items-center text-xl font-bold">
            <CirclePlus className="mr-2 h-6 w-6" />
            {driverToUpdate ? "Edit Driver" : "Add New Driver"}
          </h2>
          <button onClick={onClose} aria-label="Close modal">
            <X className="h-6 w-6 hover:text-red-200" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* First Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              <User className="inline mr-1 h-4 w-4" />
              First Name *
            </label>
            <input
              name="forename"
              type="text"
              value={formData.forename}
              onChange={handleChange}
              required
              placeholder="Enter first name"
              className="w-full rounded-lg border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-500 text-gray-700"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              <User className="inline mr-1 h-4 w-4" />
              Last Name *
            </label>
            <input
              name="surname"
              type="text"
              value={formData.surname}
              onChange={handleChange}
              required
              placeholder="Enter last name"
              className="w-full rounded-lg border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-500 text-gray-700"
            />
          </div>

          {/* Nationality */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              <Flag className="inline mr-1 h-4 w-4" />
              Nationality *
            </label>
            <select
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              required
              className="w-full rounded-lg border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-500 text-gray-700"
            >
              <option value="">Select nationality...</option>
              {nationalities.map((nat) => (
                <option key={nat} value={nat}>
                  {nat}
                </option>
              ))}
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              <CalendarIcon className="inline mr-1 h-4 w-4" />
              Date of Birth *
            </label>
            <input
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              required
              className="w-full rounded-lg border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-500 text-gray-700"
            />
          </div>

          {/* Wikipedia URL */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Wikipedia URL
            </label>
            <input
              name="url"
              type="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://en.wikipedia.org/wiki/..."
              className="w-full rounded-lg border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-500 text-gray-700"
            />
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
              {driverToUpdate ? "Update Driver" : "Add Driver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDriverModal;
