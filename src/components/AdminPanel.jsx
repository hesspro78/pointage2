import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEmployees } from '@/hooks/useEmployees';
import { useLeaves } from '@/hooks/useLeaves';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminStatsCards from '@/components/admin/AdminStatsCards';
import EmployeeManagementTab from '@/components/admin/EmployeeManagementTab';
import TimeRecordsTab from '@/components/admin/TimeRecordsTab';
import LeavesTab from '@/components/admin/LeavesTab';
import StatisticsTab from '@/components/admin/StatisticsTab';
import AppSettingsTab from '@/components/admin/AppSettingsTab'; 
import { Users, Clock, Calendar, BarChart3, Settings as SettingsIcon } from 'lucide-react';

const AdminPanel = ({ onLogout }) => {
  const { user } = useAuth();
  const { employees, addEmployee, updateEmployee, deleteEmployee, getAllTimeRecords } = useEmployees();
  const { getAllLeaves } = useLeaves();

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
    toast({ title: "Déconnexion réussie", description: "Vous avez été déconnecté." });
  };

  const allTimeRecords = getAllTimeRecords();
  const allLeavesData = getAllLeaves();

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const totalLeaves = allLeavesData.length;
  const dailyTimeRecordsCount = allTimeRecords.filter(record => 
    new Date(record.date).toDateString() === new Date().toDateString()
  ).length;

  const departmentStats = employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {});
  const departmentChartData = Object.entries(departmentStats).map(([dept, count]) => ({ name: dept, value: count }));

  const getWeeklyHoursByDepartment = () => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const departmentHours = {};
    allTimeRecords.forEach(record => {
      const recordDate = new Date(record.date);
      if (recordDate >= weekStart && record.clockOut) {
        const hours = (new Date(record.clockOut) - new Date(record.clockIn)) / (1000 * 60 * 60);
        departmentHours[record.department] = (departmentHours[record.department] || 0) + hours;
      }
    });
    return Object.entries(departmentHours).map(([dept, hours]) => ({ department: dept, hours: Math.round(hours * 100) / 100 }));
  };
  const weeklyHoursData = getWeeklyHoursByDepartment();

  const exportData = (type) => {
    let data, filename;
    if (type === 'employees') { data = employees; filename = 'employes.json'; }
    else if (type === 'timeRecords') { data = allTimeRecords; filename = 'pointages.json'; }
    else if (type === 'leaves') { data = allLeavesData; filename = 'conges.json'; }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast({ title: "Export réussi", description: `Données exportées vers ${filename}` });
  };

  const handleDeleteEmployee = (employeeId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      deleteEmployee(employeeId);
      toast({ title: "Succès", description: "Employé supprimé avec succès" });
    }
  };

  if (!user) {
    return null; 
  }

  return (
    <div className="min-h-screen admin-panel p-4">
      <div className="max-w-7xl mx-auto">
        <AdminHeader onLogout={handleLogoutClick} />
        <AdminStatsCards 
          totalEmployees={totalEmployees}
          activeEmployees={activeEmployees}
          totalLeaves={totalLeaves}
          dailyTimeRecordsCount={dailyTimeRecordsCount}
        />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Tabs defaultValue="employees" className="space-y-6">
            <TabsList className="bg-white/10 border-white/20">
              <TabsTrigger value="employees" className="data-[state=active]:bg-white/20"><Users className="w-4 h-4 mr-2" />Employés</TabsTrigger>
              <TabsTrigger value="timeRecords" className="data-[state=active]:bg-white/20"><Clock className="w-4 h-4 mr-2" />Pointages</TabsTrigger>
              <TabsTrigger value="leaves" className="data-[state=active]:bg-white/20"><Calendar className="w-4 h-4 mr-2" />Congés</TabsTrigger>
              <TabsTrigger value="statistics" className="data-[state=active]:bg-white/20"><BarChart3 className="w-4 h-4 mr-2" />Statistiques</TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-white/20"><SettingsIcon className="w-4 h-4 mr-2" />Paramètres</TabsTrigger>
            </TabsList>
            <TabsContent value="employees">
              <EmployeeManagementTab 
                employees={employees} 
                onAddEmployee={addEmployee} 
                onUpdateEmployee={updateEmployee} 
                onDeleteEmployee={handleDeleteEmployee} 
              />
            </TabsContent>
            <TabsContent value="timeRecords">
              <TimeRecordsTab timeRecords={allTimeRecords} onExport={exportData} />
            </TabsContent>
            <TabsContent value="leaves">
              <LeavesTab leaves={allLeavesData} onExport={exportData} />
            </TabsContent>
            <TabsContent value="statistics">
              <StatisticsTab departmentChartData={departmentChartData} weeklyHoursData={weeklyHoursData} />
            </TabsContent>
            <TabsContent value="settings">
              <AppSettingsTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPanel;