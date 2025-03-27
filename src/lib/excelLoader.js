import * as XLSX from "xlsx";

export async function fetchExcel(filePath) {
  const response = await fetch(filePath);
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  // Convert each sheet to JSON
  const accounts = XLSX.utils.sheet_to_json(workbook.Sheets["Accounts"]);
  const contacts = XLSX.utils.sheet_to_json(workbook.Sheets["Contacts"]);
  const campaigns = XLSX.utils.sheet_to_json(workbook.Sheets["Campaigns"]);

  return { accounts, contacts, campaigns };
}

// Function to join data
export function joinData({ accounts, contacts, campaigns }) {
  // Join Accounts & Contacts on Account ID or Account Name
  const contactsWithAccounts = contacts.map(contact => ({
    ...contact,
    account: accounts.find(
      acc => acc["Account ID"] === contact["Account ID"] || acc["Account Name"] === contact["Account Name"]
    ),
  }));

  // Join Contacts & Campaigns on Contact Name
  const campaignsWithContacts = campaigns.map(campaign => ({
    ...campaign,
    contact: contactsWithAccounts.find(contact => contact["Contact Name"] === campaign["Contact Name"]),
  }));

  return { accounts, contacts: contactsWithAccounts, campaigns: campaignsWithContacts };
}
