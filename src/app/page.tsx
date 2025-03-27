import CRM from "../crmComponents/crm/CRM";
import Dashboard from "../crmComponents/dashboard/dashboard";

export default function Home() {
  return (
    <main className="flex flex-col h-screen w-full font-[family-name:var(--font-geist-sans)] bg-primary-4 px-4 overflow-auto">
        <div className="h-auto w-full">
          <Dashboard />
          <CRM />
        </div>
      </main> 

  );
}
