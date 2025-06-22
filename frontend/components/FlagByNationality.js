"use client";

import React from "react";
import { nationalityToCountryCode } from "@/lib/nationCode";
import ReactCountryFlag from "react-country-flag";

function FlagByNationality({ nationality, size = 32, showText = true }) {
  const code = nationalityToCountryCode[nationality];

  if (!code) {
    return (
      <span title={nationality} className="p-2 text-2xl">
        🌐
      </span>
    );
  }

  return (
    <div className="text-sm text-gray-500 flex items-center">
      <ReactCountryFlag
        svg
        countryCode={code}
        style={{ fontSize: `${size}px`, lineHeight: `${size}px` }}
        className=""
        title={nationality}
      />
      {showText && <p className="m-3">{nationality}</p>}
    </div>
  );
}

export default FlagByNationality;
