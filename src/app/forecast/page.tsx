import LeadGen from "@/forecastComponents/leadGenTop/LeadGen";
import Sales from "@/forecastComponents/sales/sales";
import Retention from "@/forecastComponents/retention/retention";
import Executive from "@/forecastComponents/executive/executive";

export default function Forecast() {
  return (
    <main className="flex flex-col h-screen w-full font-[family-name:var(--font-geist-sans)] bg-primary-4 px-4 overflow-auto">
        
        <div className="flex flex-col w-full h-full p-4 md:p-8">

          {/**Funnel Summary*/}
          <div className="h-auto w-full flex flex-col gap-8 mb-8">
            
            {/** Lead Gen */}
            <LeadGen/>

            {/** Qualification & Conversion */}
            <Sales/>            

            {/** Wins & ICPs */}
            <Retention/>

          </div>

          <Executive/>

        </div>
      </main> 

  );
}
