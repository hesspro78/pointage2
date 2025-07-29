import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Clock } from 'lucide-react';

const TimeRecordsTab = ({ timeRecords, onExport }) => {
  return (
    <Card className="glass-effect border-white/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white">Historique des Pointages</CardTitle>
          <CardDescription className="text-gray-400">Tous les pointages des employés</CardDescription>
        </div>
        <Button onClick={() => onExport('timeRecords')} className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />Exporter
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {timeRecords.map((record) => (
            <div key={record.id} className="employee-card p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{record.employeeName}</h3>
                  <p className="text-sm text-gray-400">{record.department}</p>
                </div>
                <div className="text-right">
                  <p className="text-white">{new Date(record.date).toLocaleDateString('fr-FR')}</p>
                  <div className="text-sm text-gray-400">
                    <span>Entrée: {new Date(record.clockIn).toLocaleTimeString()}</span>
                    {record.clockOut && (<span className="ml-4">Sortie: {new Date(record.clockOut).toLocaleTimeString()}</span>)}
                  </div>
                  {record.clockOut && (
                    <p className="text-green-400 text-sm">
                      Durée: {Math.floor((new Date(record.clockOut) - new Date(record.clockIn)) / (1000 * 60 * 60))}h {Math.floor(((new Date(record.clockOut) - new Date(record.clockIn)) % (1000 * 60 * 60)) / (1000 * 60))}min
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeRecordsTab;