/** By Rep and Stage **/
WITH date_range AS (
  SELECT 
    date_day,
    DAY_OF_WEEK_NAME,
    DATE_TRUNC('month', date_day) as month_start,
    quarter_start_date,
    quarter_end_date,
    year_start_date,
    year_end_date,
    month_end_date,
    quarter_end_date,
    year_end_date
  FROM dbt.DBT_OSMAN.DATE_SPINE
  WHERE date_day BETWEEN DATEFROMPARTS(YEAR(DATEADD(MONTH, -12, GETDATE())), MONTH(DATEADD(MONTH, -12, GETDATE())), 1) 
    AND CAST(GETDATE() AS DATE)
),

opportunity_metrics AS (
  SELECT 
    opps.*,
    CAST(opps.created_date AS DATE) as created_date,
    CAST(opps.discovery_timestamp AS DATE) as discovery_date,
    CAST(opps.qualified_timestamp AS DATE) as qualified_date,
    CAST(opps.scoping_timestamp AS DATE) as scoping_date,
    CAST(opps.pilot_and_poc_timestamp AS DATE) as pilot_date,
    CAST(opps.pricing_and_proposal_timestamp AS DATE) as proposal_date,
    CAST(opps.legal_and_negotiation_timestamp AS DATE) as negotiation_date,
    CAST(opps.proposal_sent_timestamp AS DATE) as proposal_sent_date,
    CAST(opps.close_date AS DATE) as close_date
  FROM dbt.dbt_osman.opportunities opps
  WHERE CAST(opps.created_date AS DATE) BETWEEN DATEFROMPARTS(YEAR(DATEADD(MONTH, -12, GETDATE())), MONTH(DATEADD(MONTH, -12, GETDATE())), 1) 
    AND CAST(GETDATE() AS DATE)
    AND opps.gtm_engineer <> 'Clay Integration User'
)

SELECT 
  dt.date_day,
  dt.DAY_OF_WEEK_NAME,
  max(case when dt.date_day = dt.month_end_date then 1 else 0 end) as month_end,
  max(case when dt.date_day = dt.quarter_end_date then 1 else 0 end) as quarter_end,
  max(case when dt.date_day = dt.year_end_date then 1 else 0 end) as year_end,
  'GTME' AS Dimension_Category,
  opps.gtm_engineer AS Dimension_Value,
  
  /** Metrics for Opportunity Volume x Stage and Time Period **/
  -- Opps Created
  SUM(CASE WHEN opps.created_date = dt.date_day THEN 1 ELSE 0 END) AS opps_created_daily,
  SUM(CASE WHEN opps.created_date >= dt.month_start AND opps.created_date <= dt.date_day THEN 1 ELSE 0 END) AS opps_created_mtd,
  SUM(CASE WHEN opps.created_date BETWEEN dt.quarter_start_date AND dt.quarter_end_date THEN 1 ELSE 0 END) AS opps_created_qtd,
  SUM(CASE WHEN opps.created_date BETWEEN dt.year_start_date AND dt.year_end_date THEN 1 ELSE 0 END) AS opps_created_ytd,
  SUM(CASE WHEN opps.created_date <= dt.date_day THEN 1 ELSE 0 END) AS opps_created_ltd,
  
  -- Opportunities by Stage: Discovery
  SUM(CASE WHEN opps.discovery_date = dt.date_day THEN 1 ELSE 0 END) AS discovery_daily,
  SUM(CASE WHEN opps.discovery_date >= dt.month_start AND opps.discovery_date <= dt.date_day THEN 1 ELSE 0 END) AS discovery_mtd,
  SUM(CASE WHEN opps.discovery_date BETWEEN dt.quarter_start_date AND dt.quarter_end_date THEN 1 ELSE 0 END) AS discovery_qtd,
  SUM(CASE WHEN opps.discovery_date BETWEEN dt.year_start_date AND dt.year_end_date THEN 1 ELSE 0 END) AS discovery_ytd,
  SUM(CASE WHEN opps.discovery_date <= dt.date_day THEN 1 ELSE 0 END) as discovery_ltd,
  
  -- Opportunities by Stage: Qualified
  SUM(CASE WHEN opps.qualified_date = dt.date_day THEN 1 ELSE 0 END) AS qualified_daily,
  SUM(CASE WHEN opps.qualified_date >= dt.month_start AND opps.qualified_date <= dt.date_day THEN 1 ELSE 0 END) AS qualified_mtd,
  SUM(CASE WHEN opps.qualified_date BETWEEN dt.quarter_start_date AND dt.quarter_end_date THEN 1 ELSE 0 END) AS qualified_qtd,
  SUM(CASE WHEN opps.qualified_date BETWEEN dt.year_start_date AND dt.year_end_date THEN 1 ELSE 0 END) AS qualified_ytd,
  SUM(CASE WHEN opps.qualified_date <= dt.date_day THEN 1 ELSE 0 END) as qualified_ltd,
  
  -- Opportunities by Stage: Scoping
  SUM(CASE WHEN opps.scoping_date = dt.date_day THEN 1 ELSE 0 END) AS scoping_daily,
  SUM(CASE WHEN opps.scoping_date >= dt.month_start AND opps.scoping_date <= dt.date_day THEN 1 ELSE 0 END) AS scoping_mtd,
  SUM(CASE WHEN opps.scoping_date BETWEEN dt.quarter_start_date AND dt.quarter_end_date THEN 1 ELSE 0 END) AS scoping_qtd,
  SUM(CASE WHEN opps.scoping_date BETWEEN dt.year_start_date AND dt.year_end_date THEN 1 ELSE 0 END) AS scoping_ytd,
  SUM(CASE WHEN opps.scoping_date <= dt.date_day THEN 1 ELSE 0 END) as scoping_ltd,
  
  -- Opportunities by Stage: Pilot
  SUM(CASE WHEN opps.pilot_date = dt.date_day THEN 1 ELSE 0 END) AS pilot_daily,
  SUM(CASE WHEN opps.pilot_date >= dt.month_start AND opps.pilot_date <= dt.date_day THEN 1 ELSE 0 END) AS pilot_mtd,
  SUM(CASE WHEN opps.pilot_date BETWEEN dt.quarter_start_date AND dt.quarter_end_date THEN 1 ELSE 0 END) AS pilot_qtd,
  SUM(CASE WHEN opps.pilot_date BETWEEN dt.year_start_date AND dt.year_end_date THEN 1 ELSE 0 END) AS pilot_ytd,
  SUM(CASE WHEN opps.pilot_date <= dt.date_day THEN 1 ELSE 0 END) as pilot_ltd,
  
  -- Opportunities by Stage: Proposal
  SUM(CASE WHEN opps.proposal_date = dt.date_day THEN 1 ELSE 0 END) AS proposal_daily,
  SUM(CASE WHEN opps.proposal_date >= dt.month_start AND opps.proposal_date <= dt.date_day THEN 1 ELSE 0 END) AS proposal_mtd,
  SUM(CASE WHEN opps.proposal_date BETWEEN dt.quarter_start_date AND dt.quarter_end_date THEN 1 ELSE 0 END) AS proposal_qtd,
  SUM(CASE WHEN opps.proposal_date BETWEEN dt.year_start_date AND dt.year_end_date THEN 1 ELSE 0 END) AS proposal_ytd,
  SUM(CASE WHEN opps.proposal_date <= dt.date_day THEN 1 ELSE 0 END) as proposal_ltd,
  
  -- Opportunities by Stage: Negotiation
  SUM(CASE WHEN opps.negotiation_date = dt.date_day THEN 1 ELSE 0 END) AS negotiation_daily,
  SUM(CASE WHEN opps.negotiation_date >= dt.month_start AND opps.negotiation_date <= dt.date_day THEN 1 ELSE 0 END) AS negotiation_mtd,
  SUM(CASE WHEN opps.negotiation_date BETWEEN dt.quarter_start_date AND dt.quarter_end_date THEN 1 ELSE 0 END) AS negotiation_qtd,
  SUM(CASE WHEN opps.negotiation_date BETWEEN dt.year_start_date AND dt.year_end_date THEN 1 ELSE 0 END) AS negotiation_ytd,
  SUM(CASE WHEN opps.negotiation_date <= dt.date_day THEN 1 ELSE 0 END) as negotiation_ltd,
  
  -- Opportunities by Stage: Proposal Sent
  SUM(CASE WHEN opps.proposal_sent_date = dt.date_day THEN 1 ELSE 0 END) AS proposal_sent_daily,
  SUM(CASE WHEN opps.proposal_sent_date >= dt.month_start AND opps.proposal_sent_date <= dt.date_day THEN 1 ELSE 0 END) AS proposal_sent_mtd,
  SUM(CASE WHEN opps.proposal_sent_date BETWEEN dt.quarter_start_date AND dt.quarter_end_date THEN 1 ELSE 0 END) AS proposal_sent_qtd,
  SUM(CASE WHEN opps.proposal_sent_date BETWEEN dt.year_start_date AND dt.year_end_date THEN 1 ELSE 0 END) AS proposal_sent_ytd,
  SUM(CASE WHEN opps.proposal_sent_date <= dt.date_day THEN 1 ELSE 0 END) as proposal_sent_ltd,
  
  -- Opportunities by Stage: Closed
  SUM(CASE WHEN opps.close_date = dt.date_day THEN 1 ELSE 0 END) AS closed_daily,
  SUM(CASE WHEN opps.close_date >= dt.month_start AND opps.close_date <= dt.date_day THEN 1 ELSE 0 END) AS closed_mtd,
  SUM(CASE WHEN opps.close_date BETWEEN dt.quarter_start_date AND dt.quarter_end_date THEN 1 ELSE 0 END) AS closed_qtd,
  SUM(CASE WHEN opps.close_date BETWEEN dt.year_start_date AND dt.year_end_date THEN 1 ELSE 0 END) AS closed_ytd,
  SUM(CASE WHEN opps.close_date <= dt.date_day THEN 1 ELSE 0 END) as closed_ltd,
  
  /** Cycle Time by Stage **/
  -- Average Days: Created to Discovery
  AVG(CASE 
    WHEN opps.discovery_date = dt.date_day 
    THEN DATEDIFF(DAY, opps.created_date, opps.discovery_date) 
  END) AS avg_days_created_to_discovery_daily,
  AVG(CASE 
    WHEN opps.discovery_date >= dt.month_start AND opps.discovery_date <= dt.date_day 
    THEN DATEDIFF(DAY, opps.created_date, opps.discovery_date) 
  END) AS avg_days_created_to_discovery_mtd,
  AVG(CASE 
    WHEN opps.discovery_date BETWEEN dt.quarter_start_date AND dt.quarter_end_date 
    THEN DATEDIFF(DAY, opps.created_date, opps.discovery_date) 
  END) AS avg_days_created_to_discovery_qtd,
  AVG(CASE 
    WHEN opps.discovery_date BETWEEN dt.year_start_date AND dt.year_end_date 
    THEN DATEDIFF(DAY, opps.created_date, opps.discovery_date) 
  END) AS avg_days_created_to_discovery_ytd,
  AVG(CASE 
    WHEN opps.discovery_date <= dt.date_day 
    THEN DATEDIFF(DAY, opps.created_date, opps.discovery_date) 
  END) AS avg_days_created_to_discovery_ltd,
  
  -- Average Days: Discovery to Qualified
  AVG(CASE 
    WHEN opps.qualified_date = dt.date_day 
    THEN DATEDIFF(DAY, opps.discovery_date, opps.qualified_date) 
  END) AS avg_days_discovery_to_qualified_daily,
  AVG(CASE 
    WHEN opps.qualified_date >= dt.month_start AND opps.qualified_date <= dt.date_day 
    THEN DATEDIFF(DAY, opps.discovery_date, opps.qualified_date) 
  END) AS avg_days_discovery_to_qualified_mtd,
  AVG(CASE 
    WHEN opps.qualified_date BETWEEN dt.quarter_start_date AND dt.quarter_end_date 
    THEN DATEDIFF(DAY, opps.discovery_date, opps.qualified_date) 
  END) AS avg_days_discovery_to_qualified_qtd,
  AVG(CASE 
    WHEN opps.qualified_date BETWEEN dt.year_start_date AND dt.year_end_date 
    THEN DATEDIFF(DAY, opps.discovery_date, opps.qualified_date) 
  END) AS avg_days_discovery_to_qualified_ytd,
  AVG(CASE 
    WHEN opps.qualified_date <= dt.date_day 
    THEN DATEDIFF(DAY, opps.discovery_date, opps.qualified_date) 
  END) AS avg_days_discovery_to_qualified_ltd,
  
  -- Average Days: Qualified to Scoping
  AVG(CASE 
    WHEN opps.scoping_date = dt.date_day 
    THEN DATEDIFF(DAY, opps.qualified_date, opps.scoping_date) 
  END) AS avg_days_qualified_to_scoping_daily,
  AVG(CASE 
    WHEN opps.scoping_date >= dt.month_start AND opps.scoping_date <= dt.date_day 
    THEN DATEDIFF(DAY, opps.qualified_date, opps.scoping_date) 
  END) AS avg_days_qualified_to_scoping_mtd,
  AVG(CASE 
    WHEN opps.scoping_date BETWEEN dt.quarter_start_date AND dt.quarter_end_date 
    THEN DATEDIFF(DAY, opps.qualified_date, opps.scoping_date) 
  END) AS avg_days_qualified_to_scoping_qtd,
  AVG(CASE 
    WHEN opps.scoping_date BETWEEN dt.year_start_date AND dt.year_end_date 
    THEN DATEDIFF(DAY, opps.qualified_date, opps.scoping_date) 
  END) AS avg_days_qualified_to_scoping_ytd,
  AVG(CASE 
    WHEN opps.scoping_date <= dt.date_day 
    THEN DATEDIFF(DAY, opps.qualified_date, opps.scoping_date) 
  END) AS avg_days_qualified_to_scoping_ltd,
  
  -- Average Days: Scoping to Pilot
  AVG(CASE 
    WHEN opps.pilot_date = dt.date_day 
    THEN DATEDIFF(DAY, opps.scoping_date, opps.pilot_date) 
  END) AS avg_days_scoping_to_pilot_daily,
  AVG(CASE 
    WHEN opps.pilot_date >= dt.month_start AND opps.pilot_date <= dt.date_day 
    THEN DATEDIFF(DAY, opps.scoping_date, opps.pilot_date) 
  END) AS avg_days_scoping_to_pilot_mtd,
  AVG(CASE 
    WHEN opps.pilot_date BETWEEN dt.quarter_start_date AND dt.quarter_end_date 
    THEN DATEDIFF(DAY, opps.scoping_date, opps.pilot_date) 
  END) AS avg_days_scoping_to_pilot_qtd,
  AVG(CASE 
    WHEN opps.pilot_date BETWEEN dt.year_start_date AND dt.year_end_date 
    THEN DATEDIFF(DAY, opps.scoping_date, opps.pilot_date) 
  END) AS avg_days_scoping_to_pilot_ytd,
  AVG(CASE 
    WHEN opps.pilot_date <= dt.date_day 
    THEN DATEDIFF(DAY, opps.scoping_date, opps.pilot_date) 
  END) AS avg_days_scoping_to_pilot_ltd,
  
  -- Average Days: Pilot to Proposal
  AVG(CASE 
    WHEN opps.proposal_date = dt.date_day 
    THEN DATEDIFF(DAY, opps.pilot_date, opps.proposal_date) 
  END) AS avg_days_pilot_to_proposal_daily,
  AVG(CASE 
    WHEN opps.proposal_date >= dt.month_start AND opps.proposal_date <= dt.date_day 
    THEN DATEDIFF(DAY, opps.pilot_date, opps.proposal_date) 
  END) AS avg_days_pilot_to_proposal_mtd,
  AVG(CASE 
    WHEN opps.proposal_date BETWEEN dt.quarter_start_date AND dt.quarter_end_date 
    THEN DATEDIFF(DAY, opps.pilot_date, opps.proposal_date) 
  END) AS avg_days_pilot_to_proposal_qtd,
  AVG(CASE 
    WHEN opps.proposal_date BETWEEN dt.year_start_date AND dt.year_end_date 
    THEN DATEDIFF(DAY, opps.pilot_date, opps.proposal_date) 
  END) AS avg_days_pilot_to_proposal_ytd,
  AVG(CASE 
    WHEN opps.proposal_date <= dt.date_day 
    THEN DATEDIFF(DAY, opps.pilot_date, opps.proposal_date) 
  END) AS avg_days_pilot_to_proposal_ltd,
  
  -- Average Days: Proposal to Negotiation
  AVG(CASE 
    WHEN opps.negotiation_date = dt.date_day 
    THEN DATEDIFF(DAY, opps.proposal_date, opps.negotiation_date) 
  END) AS avg_days_proposal_to_negotiation_daily,
  AVG(CASE 
    WHEN opps.negotiation_date >= dt.month_start AND opps.negotiation_date <= dt.date_day 
    THEN DATEDIFF(DAY, opps.proposal_date, opps.negotiation_date) 
  END) AS avg_days_proposal_to_negotiation_mtd,
  AVG(CASE 
    WHEN opps.negotiation_date BETWEEN dt.quarter_start_date AND dt.quarter_end_date 
    THEN DATEDIFF(DAY, opps.proposal_date, opps.negotiation_date) 
  END) AS avg_days_proposal_to_negotiation_qtd,
  AVG(CASE 
    WHEN opps.negotiation_date BETWEEN dt.year_start_date AND dt.year_end_date 
    THEN DATEDIFF(DAY, opps.proposal_date, opps.negotiation_date) 
  END) AS avg_days_proposal_to_negotiation_ytd,
  AVG(CASE 
    WHEN opps.negotiation_date <= dt.date_day 
    THEN DATEDIFF(DAY, opps.proposal_date, opps.negotiation_date) 
  END)

    -- Average Days: Proposal to Negotiation (continued)
  AS avg_days_proposal_to_negotiation_ltd,
  
  -- Average Days: Negotiation to Proposal Sent
  AVG(CASE 
    WHEN opps.proposal_sent_date = dt.date_day 
    THEN DATEDIFF(DAY, opps.negotiation_date, opps.proposal_sent_date) 
  END) AS avg_days_negotiation_to_proposal_sent_daily,
  AVG(CASE 
    WHEN opps.proposal_sent_date >= dt.month_start AND opps.proposal_sent_date <= dt.date_day 
    THEN DATEDIFF(DAY, opps.negotiation_date, opps.proposal_sent_date) 
  END) AS avg_days_negotiation_to_proposal_sent_mtd,
  AVG(CASE 
    WHEN opps.proposal_sent_date BETWEEN dt.quarter_start_date AND dt.quarter_end_date 
    THEN DATEDIFF(DAY, opps.negotiation_date, opps.proposal_sent_date) 
  END) AS avg_days_negotiation_to_proposal_sent_qtd,
  AVG(CASE 
    WHEN opps.proposal_sent_date BETWEEN dt.year_start_date AND dt.year_end_date 
    THEN DATEDIFF(DAY, opps.negotiation_date, opps.proposal_sent_date) 
  END) AS avg_days_negotiation_to_proposal_sent_ytd,
  AVG(CASE 
    WHEN opps.proposal_sent_date <= dt.date_day 
    THEN DATEDIFF(DAY, opps.negotiation_date, opps.proposal_sent_date) 
  END) AS avg_days_negotiation_to_proposal_sent_ltd,
  
  -- Average Days: Proposal Sent to Closed
  AVG(CASE 
    WHEN opps.close_date = dt.date_day 
    THEN DATEDIFF(DAY, opps.proposal_sent_date, opps.close_date) 
  END) AS avg_days_proposal_sent_to_closed_daily,
  AVG(CASE 
    WHEN opps.close_date >= dt.month_start AND opps.close_date <= dt.date_day 
    THEN DATEDIFF(DAY, opps.proposal_sent_date, opps.close_date) 
  END) AS avg_days_proposal_sent_to_closed_mtd,
  AVG(CASE 
    WHEN opps.close_date BETWEEN dt.quarter_start_date AND dt.quarter_end_date 
    THEN DATEDIFF(DAY, opps.proposal_sent_date, opps.close_date) 
  END) AS avg_days_proposal_sent_to_closed_qtd,
  AVG(CASE 
    WHEN opps.close_date BETWEEN dt.year_start_date AND dt.year_end_date 
    THEN DATEDIFF(DAY, opps.proposal_sent_date, opps.close_date) 
  END) AS avg_days_proposal_sent_to_closed_ytd,
  AVG(CASE 
    WHEN opps.close_date <= dt.date_day 
    THEN DATEDIFF(DAY, opps.proposal_sent_date, opps.close_date) 
  END) AS avg_days_proposal_sent_to_closed_ltd,
  
  -- Average Days: Created to Closed
  AVG(CASE 
    WHEN opps.close_date = dt.date_day 
    THEN DATEDIFF(DAY, opps.created_date, opps.close_date) 
  END) AS avg_days_created_to_closed_daily,
  AVG(CASE 
    WHEN opps.close_date >= dt.month_start AND opps.close_date <= dt.date_day 
    THEN DATEDIFF(DAY, opps.created_date, opps.close_date) 
  END) AS avg_days_created_to_closed_mtd,
  AVG(CASE 
    WHEN opps.close_date BETWEEN dt.quarter_start_date AND dt.quarter_end_date 
    THEN DATEDIFF(DAY, opps.created_date, opps.close_date) 
  END) AS avg_days_created_to_closed_qtd,
  AVG(CASE 
    WHEN opps.close_date BETWEEN dt.year_start_date AND dt.year_end_date 
    THEN DATEDIFF(DAY, opps.created_date, opps.close_date) 
  END) AS avg_days_created_to_closed_ytd,
  AVG(CASE 
    WHEN opps.close_date <= dt.date_day 
    THEN DATEDIFF(DAY, opps.created_date, opps.close_date) 
  END) AS avg_days_created_to_closed_ltd

FROM date_range dt
LEFT JOIN opportunity_metrics opps ON 1=1
GROUP BY dt.date_day, dt.DAY_OF_WEEK_NAME, opps.gtm_engineer
ORDER BY Dimension_Category, Dimension_Value, date_day DESC