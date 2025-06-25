"use client";
import React, { useState, useEffect } from "react";
import { X, CirclePlus, User, Flag, Calendar } from "lucide-react";
import { saveDriver } from "@/lib/driver";
import toast from "react-hot-toast";

function getDate(rawDate) {
  const date = new Date(rawDate);
  const pad = (n) => n.toString().padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function AddDriverModal({
  isOpen,
  onClose,
  nationalities,
  onSubmit,
  driverToUpdate,
}) {
  const [formData, setFormData] = useState({
    forename: "",
    surname: "",
    nationality: "",
    dob: "",
    url: "",
  });

  useEffect(() => {
    if (driverToUpdate && isOpen) {
      setFormData({
        forename: driverToUpdate.forename || "",
        surname: driverToUpdate.surname || "",
        nationality: driverToUpdate.nationality || "",
        dob: getDate(driverToUpdate.dob) || "",
        url: driverToUpdate.url || "",
        id: driverToUpdate._id,
      });
    } else if (isOpen) {
      setFormData({
        forename: "",
        surname: "",
        nationality: "",
        dob: "",
        url: "",
      });
    }
  }, [driverToUpdate, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log(formData);

      const response = await saveDriver(formData);
      onSubmit(response); // facoltativo, dipende se vuoi passare i dati al parent
      // Reset form
      setFormData({
        forename: "",
        surname: "",
        nationality: "",
        dob: "",
        url: "",
      });
      onClose();
    } catch (error) {
      console.error("Errore API:", error);
      toast.error(toString(error));
      // opzionale: mostrare un messaggio di errore all'utente
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center">
              <CirclePlus className="mr-3 w-6 h-6" />
              Add New Driver
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline w-4 h-4 mr-2" />
              First Name *
            </label>
            <input
              type="text"
              name="forename"
              value={formData.forename}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-700"
              placeholder="Enter first name..."
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline w-4 h-4 mr-2" />
              Last Name *
            </label>
            <input
              type="text"
              name="surname"
              value={formData.surname}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-700"
              placeholder="Enter last name..."
            />
          </div>

          {/* Nationality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Flag className="inline w-4 h-4 mr-2" />
              Nationality *
            </label>
            <select
              name="nationality"
              value={formData.nationality}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-700"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-2" />
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              required
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-700"
            />
          </div>

          {/* URL/Wikipedia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wikipedia URL
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-700"
              placeholder="https://en.wikipedia.org/wiki/..."
            />
          </div>

          {/* Form Actions */}
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
              Add Driver
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDriverModal;
