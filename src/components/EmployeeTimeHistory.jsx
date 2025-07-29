import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { Calendar, Clock, Search, Download } from 'lucide-react';

const EmployeeTimeHistory = ({ userId }) => {
  const { timeRecords } = useTimeTracking(userId);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredRecords, setFilteredRecords] = useState(timeRecords);

  React.useEffect(() => {
    setFilteredRecords(timeRecords);
  }, [timeRecords]);

  const handleFilter = () => {
    if (!startDate && !endDate) {
      setFilteredRecords(timeRecords);
      return;
    }

    const filtered = timeRecords.filter(record => {
      const recordDate = new Date(record.date);
      const start = startDate ? new Date(startDate) : new Date('1900-01-01');
      const end = endDate ? new Date(endDate) : new Date('2100-12-31');
      
      return recordDate >= start && recordDate <= end;
    });

    setFilteredRecords(filtered);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Entrée', 'Sortie', 'Durée (heures)'],
      ...filteredRecords.map(record => [
        new Date(record.date).toLocaleDateString('fr-FR'),
        new Date(record.clockIn).toLocaleTimeString(),
        record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : 'Non pointé',
        record.clockOut ? 
          ((new Date(record.clockOut) - new Date(record.clockIn)) / (1000 * 60 * 60)).toFixed(2) : 
          '0'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historique_pointage_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateTotalHours = () => {
    return filteredRecords.reduce((total, record) => {
      if (record.clockOut) {
        const hours = (new Date(record.clockOut) - new Date(record.clockIn)) / (1000 * 60 * 60);
        return total + hours;
      }
      return total;
    }, 0);
  };

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}min`;
  };

  return (
    <Card className="glass-effect border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Historique des Pointages
        </CardTitle>
        <CardDescription className="text-gray-400">
          Consultez votre historique de pointage et filtrez par période
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-gray-200">Date de début</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-gray-200">Date de fin</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          <Button onClick={handleFilter} className="bg-blue-600 hover:bg-blue-700">
            <Search className="w-4 h-4 mr-2" />
            Filtrer
          </Button>
          <Button onClick={exportToCSV} variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stats-card p-4 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{filteredRecords.length}</p>
              <p className="text-sm text-gray-400">Jours travaillés</p>
            </div>
          </div>
          <div className="stats-card p-4 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{formatDuration(calculateTotalHours())}</p>
              <p className="text-sm text-gray-400">Total heures</p>
            </div>
          </div>
          <div className="stats-card p-4 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {filteredRecords.length > 0 ? formatDuration(calculateTotalHours() / filteredRecords.length) : '0h 0min'}
              </p>
              <p className="text-sm text-gray-400">Moyenne/jour</p>
            </div>
          </div>
        </div>

        {/* Records List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Aucun pointage trouvé pour cette période</p>
            </div>
          ) : (
            filteredRecords
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((record) => (
                <div key={record.id} className="employee-card p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {new Date(record.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                        <span>Entrée: {new Date(record.clockIn).toLocaleTimeString()}</span>
                        {record.clockOut ? (
                          <span>Sortie: {new Date(record.clockOut).toLocaleTimeString()}</span>
                        ) : (
                          <span className="text-yellow-400">En cours...</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {record.clockOut ? (
                        <div>
                          <p className="text-lg font-semibold text-green-400">
                            {formatDuration((new Date(record.clockOut) - new Date(record.clockIn)) / (1000 * 60 * 60))}
                          </p>
                          <p className="text-xs text-gray-400">Temps travaillé</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg font-semibold text-yellow-400">En cours</p>
                          <p className="text-xs text-gray-400">Session active</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeTimeHistory;