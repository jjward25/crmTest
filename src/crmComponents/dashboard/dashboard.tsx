"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CustomTooltip } from "../tooltip";
import BubbleChart from "./bubblechart";
import MostEngagedCampaigns from "./engagementL90";
import EngagementSummaryTable from "./engagementSummaryTable";
import EngagementWebCharts from "./webCharts";
import EngagementUseCaseCharts from "./webUseCases";

export default function Dashboard() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`mt-6 mx-2 bg-primary-5 overflow-hidden mb-4 rounded-xl text-white ${isExpanded ? 'border border-primary-2' : ''}`}>
      {/* Accordion Header */}
      <div
        className={`flex justify-between items-center cursor-pointer ${isExpanded ? 'border-b border-primary-2' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className={`text-xl font-semibold bg-primary-3 px-2 py-1 rounded-tl-xl`}>Dashboard</h2>
        <div className="flex items-center mr-4">
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </div>
      </div>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="grid grid-cols-12 grid-rows-[400px_450px] gap-4 w-full bg-primary-5 rounded-xl overflow-auto pt-2">
          {/* Tooltip */}
          <div className="absolute top-2 left-2 z-10">
            <CustomTooltip
              content="This dashboard is meant to help you picture where your business is growing, and how different sales strategies are performing, before you move on to individual account management."
            />
          </div>

          {/* Engagement Web Charts */}
          <div className="col-span-3 row-span-2 overflow-auto h-full">
            <EngagementWebCharts />
          </div>

          {/* Most Engaged Campaigns */}
          <div className="col-span-3 row-span-1">
            <MostEngagedCampaigns />
          </div>

          {/* Engagement Use Case Charts */}
          <div className="col-span-3 row-span-1 max-h-[400px] overflow-auto">
            <EngagementUseCaseCharts />
          </div>

          {/* Bubble Chart */}
          <div className="col-span-3 row-span-1">
            <BubbleChart />
          </div>

          {/* Engagement Summary Table */}
          <div className="col-span-9 row-span-2 row-start-2 col-start-4 overflow-auto max-h-[400px] border border-primary-3 rounded-lg">
            <h3 className="text-xl font-semibold pl-3 py-3 text-primary-3">Engagement Summary: What kinds of engagements are converting?</h3>
            <EngagementSummaryTable />
          </div>

        </div>
      )}
    </div>
  );
}