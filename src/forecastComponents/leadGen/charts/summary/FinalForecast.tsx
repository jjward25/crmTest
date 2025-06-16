"use client";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);


export default function OpenForecastTotalARR() {
 

  return (
    <div className="border border-primary-3 p-4 rounded-md bg-primary-4 w-full">
      <h3 className="text-primary-5 font-semibold mb-2">Forecast Next Quarter based on Qualifications</h3>
      <p className="text-primary-5 text-3xl font-bold">${(237931+202604).toLocaleString()} <span className="text-sm align-top text-primary-4">{`(+13%/$54k)`}</span></p>
      
    </div>
  );
}