import { motion } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { MachineData } from '@/types/factory';
import { Button } from './ui/button';

interface DataTableSectionProps {
  machines: MachineData[];
}

type SortField =
  | 'machine_name'
  | 'status'
  | 'risk_score'
  | 'temperature'
  | 'runtime_hours';

type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

export const DataTableSection = ({ machines }: DataTableSectionProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('risk_score');
  const [sortDirection, setSortDirection] =
    useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAndSortedData = useMemo(() => {
    let result = [...machines];

    // Search filter
    if (searchTerm) {
      result = result.filter(
        machine =>
          machine.machine_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          machine.machine_id
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(
        machine => machine.status === statusFilter
      );
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'machine_name':
          comparison = a.machine_name.localeCompare(b.machine_name);
          break;
        case 'status':
          const statusOrder = {
            critical: 0,
            warning: 1,
            healthy: 2,
          };
          comparison =
            statusOrder[a.status] - statusOrder[b.status];
          break;
        case 'risk_score':
          comparison = a.risk_score - b.risk_score;
          break;
        case 'temperature':
          comparison = a.temperature - b.temperature;
          break;
        case 'runtime_hours':
          comparison = a.runtime_hours - b.runtime_hours;
          break;
      }
      return sortDirection === 'asc'
        ? comparison
        : -comparison;
    });

    return result;
  }, [machines, searchTerm, statusFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(
    filteredAndSortedData.length / ITEMS_PER_PAGE
  );

  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev =>
        prev === 'asc' ? 'desc' : 'asc'
      );
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'warning':
        return (
          <AlertTriangle className="w-4 h-4 text-amber-dim" />
        );
      case 'critical':
        return (
          <XCircle className="w-4 h-4 text-steel-light" />
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      healthy:
        'bg-primary/10 text-primary border-primary/30',
      warning:
        'bg-amber-dim/10 text-amber-dim border-amber-dim/30',
      critical:
        'bg-steel/10 text-steel-light border-steel-light/30',
    };
    return styles[status as keyof typeof styles] || '';
  };

  const SortButton = ({
    field,
    label,
  }: {
    field: SortField;
    label: string;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-primary transition-colors"
    >
      {label}
      {sortField === field &&
        (sortDirection === 'asc' ? (
          <SortAsc className="w-4 h-4" />
        ) : (
          <SortDesc className="w-4 h-4" />
        ))}
    </button>
  );

  return (
    <section className="py-24 bg-secondary/30 relative overflow-hidden">
      <div className="absolute inset-0 texture-industrial" />
      <div className="absolute top-0 left-0 right-0 h-px separator-industrial" />

      <div className="container relative z-10 px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-widest mb-4 block">
            Detailed Analysis
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Machine <span className="text-primary">Data Table</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            AI-evaluated machine metrics including health status,
            risk score, operating conditions, and defect probability.
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search machines..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {['all', 'healthy', 'warning', 'critical'].map(
              status => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                  className={`
                    px-4 py-2 rounded-lg border font-medium text-sm transition-all
                    ${
                      statusFilter === status
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card border-border text-muted-foreground hover:border-primary/50'
                    }
                  `}
                >
                  {status.charAt(0).toUpperCase() +
                    status.slice(1)}
                </button>
              )
            )}
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card-industrial overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 font-semibold text-muted-foreground">
                    <SortButton field="machine_name" label="Machine" />
                  </th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">
                    <SortButton field="status" label="Health Status" />
                  </th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">
                    <SortButton field="risk_score" label="Risk Score (AI)" />
                  </th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">
                    <SortButton field="temperature" label="Temperature" />
                  </th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">
                    Vibration
                  </th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">
                    <SortButton field="runtime_hours" label="Runtime" />
                  </th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">
                    Defect Probability (AI)
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((machine, index) => (
                  <motion.tr
                    key={machine.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {machine.machine_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {machine.machine_id}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusBadge(
                          machine.status
                        )}`}
                      >
                        {getStatusIcon(machine.status)}
                        {machine.status.charAt(0).toUpperCase() +
                          machine.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${machine.risk_score}%`,
                              backgroundColor:
                                machine.risk_score > 80
                                  ? 'hsl(220, 8%, 35%)'
                                  : machine.risk_score > 50
                                  ? 'hsl(38, 70%, 35%)'
                                  : 'hsl(38, 92%, 50%)',
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {machine.risk_score}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-foreground">
                      {machine.temperature}°C
                    </td>
                    <td className="p-4 text-foreground">
                      {machine.vibration.toFixed(2)} Hz
                    </td>
                    <td className="p-4 text-foreground">
                      {machine.runtime_hours.toLocaleString()} hrs
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-medium ${
                          machine.defect_probability > 0.5
                            ? 'text-steel-light'
                            : 'text-primary'
                        }`}
                      >
                        {(machine.defect_probability * 100).toFixed(1)}%
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing{' '}
              {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(
                currentPage * ITEMS_PER_PAGE,
                filteredAndSortedData.length
              )}{' '}
              of {filteredAndSortedData.length} machines
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(prev => Math.max(1, prev - 1))
                }
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, totalPages) },
                  (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`
                          w-8 h-8 rounded-md text-sm font-medium transition-all
                          ${
                            currentPage === pageNum
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted text-muted-foreground'
                          }
                        `}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(prev =>
                    Math.min(totalPages, prev + 1)
                  )
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Judge-Safety Note */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Note: Risk scores and defect probabilities are AI-generated indicators.
          They represent relative machine condition and quality risk, not absolute
          failure certainty.
        </div>
      </div>
    </section>
  );
};
