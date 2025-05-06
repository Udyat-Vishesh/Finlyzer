import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { formatPercentage, formatRatio, getValueColorClass } from "@/lib/utils/finance";
import { AssetPerformance } from "@/lib/types";

interface AssetPerformanceTableProps {
  assetPerformance: AssetPerformance[];
}

export default function AssetPerformanceTable({ assetPerformance }: AssetPerformanceTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-neutral-50">Asset</TableHead>
            <TableHead className="bg-neutral-50 text-right">Weight</TableHead>
            <TableHead className="bg-neutral-50 text-right">Return</TableHead>
            <TableHead className="bg-neutral-50 text-right">Risk</TableHead>
            <TableHead className="bg-neutral-50 text-right">Sharpe</TableHead>
            <TableHead className="bg-neutral-50 text-right">Contribution</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assetPerformance.map((asset) => (
            <TableRow key={asset.symbol}>
              <TableCell className="whitespace-nowrap">
                <div className="font-medium text-gray-900">{asset.symbol}</div>
                <div className="text-sm text-gray-500">{asset.name}</div>
              </TableCell>
              <TableCell className="text-right whitespace-nowrap text-sm text-gray-500">
                {asset.weight}%
              </TableCell>
              <TableCell className={`text-right whitespace-nowrap text-sm ${getValueColorClass(asset.annualReturn)}`}>
                {formatPercentage(asset.annualReturn)}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap text-sm text-gray-500">
                {formatPercentage(asset.risk, false)}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap text-sm text-gray-500">
                {formatRatio(asset.sharpeRatio)}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap text-sm text-gray-500">
                {formatPercentage(asset.contribution, false)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
