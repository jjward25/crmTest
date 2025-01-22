import React, { useState, useEffect } from 'react';
import { Treemap, Tooltip, Cell, ResponsiveContainer } from 'recharts';

type Stage = 'Prospect' | 'Qualified' | 'Customer';
type Bucket = '<100' | '<300' | '<1000' | '1000+';

interface DataEntry {
  name: string;
  size: number;
  bucket: Bucket;
  stage: Stage;
}

const data: DataEntry[] = [
  { name: "Bucket: <100, Stage: Prospect", size: 100, bucket: "<100", stage: "Prospect" },
  { name: "Bucket: <100, Stage: Qualified", size: 60, bucket: "<100", stage: "Qualified" },
  { name: "Bucket: <100, Stage: Customer", size: 40, bucket: "<100", stage: "Customer" },
  { name: "Bucket: <300, Stage: Prospect", size: 150, bucket: "<300", stage: "Prospect" },
  { name: "Bucket: <300, Stage: Qualified", size: 120, bucket: "<300", stage: "Qualified" },
  { name: "Bucket: <300, Stage: Customer", size: 90, bucket: "<300", stage: "Customer" },
  { name: "Bucket: <1000, Stage: Prospect", size: 200, bucket: "<1000", stage: "Prospect" },
  { name: "Bucket: <1000, Stage: Qualified", size: 180, bucket: "<1000", stage: "Qualified" },
  { name: "Bucket: <1000, Stage: Customer", size: 120, bucket: "<1000", stage: "Customer" },
  { name: "Bucket: 1000+, Stage: Prospect", size: 250, bucket: "1000+", stage: "Prospect" },
  { name: "Bucket: 1000+, Stage: Qualified", size: 220, bucket: "1000+", stage: "Qualified" },
  { name: "Bucket: 1000+, Stage: Customer", size: 300, bucket: "1000+", stage: "Customer" },
];

const COLORS: Record<Bucket, Record<Stage, string>> = {
  '<100': { Prospect: '#F39C12', Qualified: '#3498DB', Customer: '#2ECC71' },
  '<300': { Prospect: '#8E44AD', Qualified: '#1ABC9C', Customer: '#E74C3C' },
  '<1000': { Prospect: '#F39C12', Qualified: '#9B59B6', Customer: '#2ECC71' },
  '1000+': { Prospect: '#E67E22', Qualified: '#3498DB', Customer: '#1ABC9C' },
};

const CustomCell: React.FC<any> = ({ x, y, width, height, value, index, payload }) => {
  const entry = payload[index];
  const bucket = entry.bucket as Bucket;
  const stage = entry.stage as Stage;

  return (
    <g>
      <Cell
        key={index}
        fill={COLORS[bucket][stage]} // Use bucket and stage for color
        strokeWidth={1}
        stroke="#fff"
      />
      <text
        x={x + width / 2}
        y={y + height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#fff"
        fontSize={12}
      >
        {entry.name}
      </text>
    </g>
  );
};

const TreemapComponent: React.FC = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This ensures that the component is only rendered on the client side
    setIsClient(true);
  }, []);

  if (!isClient) return null; // Skip rendering during SSR

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
        Account Distribution by Employee Size and Stage
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <Treemap
          data={data}
          dataKey="size"
          stroke="#fff"
          aspectRatio={1.5}
          content={<CustomCell />} // Use CustomCell for custom rendering
        >
          <Tooltip
            content={(props) => {
              const { active, payload } = props;
              if (active && payload && payload.length) {
                const { name, size, bucket, stage } = payload[0].payload;
                return (
                  <div className="bg-white p-2 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold">{name}</h3>
                    <p>Size: {size}</p>
                    <p>Bucket: {bucket}</p>
                    <p>Stage: {stage}</p>
                  </div>
                );
              }
              return null;
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};

export default TreemapComponent;
