import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Calendar } from 'lucide-react';

const LeavesTab = ({ leaves, onExport }) => {
  return (
    <Card className="glass-effect border-white/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white">Gestion des Congés</CardTitle>
          <CardDescription className="text-gray-400">Tous les congés et absences</CardDescription>
        </div>
        <Button onClick={() => onExport('leaves')} className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />Exporter
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {leaves.map((leave) => (
            <div key={leave.id} className="employee-card p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{leave.employeeName}</h3>
                  <p className="text-sm text-gray-400">{leave.department}</p>
                  <p className="text-sm text-gray-300 mt-1">{leave.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold capitalize">{leave.type}</p>
                  <p className="text-sm text-gray-400">
                    Du {new Date(leave.startDate).toLocaleDateString('fr-FR')} au {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                  </p>
                  <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                    leave.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    leave.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {leave.status === 'approved' ? 'Approuvé' :
                     leave.status === 'rejected' ? 'Rejeté' : 'En attente'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeavesTab;