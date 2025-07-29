import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { useLeaves } from '@/hooks/useLeaves';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Calendar, 
  BarChart3, 
  User, 
  Settings,
  Briefcase,
  TrendingUp,
  Timer,
  Coffee
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import EmployeeTimeHistory from '@/components/EmployeeTimeHistory';
import LeaveManagement from '@/components/LeaveManagement';

const Dashboard = ({ onLogout }) => {
  const { user } = useAuth();
  const { appName, logoUrl } = useAppSettings();
  const { 
    currentStatus, 
    todayHours, 
    clockIn, 
    clockOut, 
    getWeeklyHours, 
    getMonthlyHours,
    timeRecords 
  } = useTimeTracking(user?.id);
  const { leaves } = useLeaves(user?.id);
  const [currentTime, setCurrentTime] = useState(new Date());

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
    toast({ title: "Déconnexion réussie", description: "Vous avez été déconnecté." });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => clearInterval(timer);
  }, []);

  const weeklyHours = getWeeklyHours();
  const monthlyHours = getMonthlyHours();

  const getChartData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();
      
      const dayRecords = timeRecords.filter(record => 
        new Date(record.date).toDateString() === dateString
      );
      
      let totalMinutes = 0;
      dayRecords.forEach(record => {
        if (record.clockOut) {
          const clockInDate = new Date(record.clockIn);
          const clockOutDate = new Date(record.clockOut);
          totalMinutes += (clockOutDate - clockInDate) / (1000 * 60);
        }
      });
      
      data.push({
        day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        hours: Math.round((totalMinutes / 60) * 100) / 100
      });
    }
    
    return data;
  };

  const chartData = getChartData();

  const formatTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}min`;
  };

  const getStatusColor = () => {
    if (!currentStatus) return 'text-gray-400';
    return currentStatus.status === 'in' ? 'text-green-400' : 'text-red-400';
  };

  const getStatusText = () => {
    if (!currentStatus) return 'Non pointé';
    const time = new Date(currentStatus.time).toLocaleTimeString();
    return currentStatus.status === 'in' 
      ? `Pointé en entrée à ${time}` 
      : `Pointé en sortie à ${time}`;
  };

  if (!user) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex items-center gap-4">
            {logoUrl === "/default-logo.svg" ? (
              <Briefcase className="w-10 h-10 text-blue-400" />
            ) : (
              <img-replace src={logoUrl} alt={`${appName} logo`} className="w-10 h-10 object-contain" />
            )}
            <div>
              <h1 className="text-4xl font-bold gradient-text">
                {appName}
              </h1>
              <p className="text-gray-300 mt-1">
                Bienvenue, {user?.name} • {user?.department}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="time-display text-2xl text-white">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-sm text-gray-400">
                {currentTime.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            
            <Button
              onClick={handleLogoutClick}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <Card className="glass-effect border-white/20 stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Statut actuel</h3>
                    <p className={`text-sm ${getStatusColor()}`}>
                      {getStatusText()}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={clockIn}
                    disabled={currentStatus?.status === 'in'}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrée
                  </Button>
                  <Button
                    onClick={clockOut}
                    disabled={currentStatus?.status !== 'in'}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sortie
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Timer className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Aujourd'hui</p>
                  <p className="text-2xl font-bold text-white">{formatTime(todayHours)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Cette semaine</p>
                  <p className="text-2xl font-bold text-white">{formatTime(weeklyHours)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Ce mois</p>
                  <p className="text-2xl font-bold text-white">{formatTime(monthlyHours)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <Coffee className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Congés pris</p>
                  <p className="text-2xl font-bold text-white">{leaves.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="charts" className="space-y-6">
            <TabsList className="bg-white/10 border-white/20">
              <TabsTrigger value="charts" className="data-[state=active]:bg-white/20">
                <BarChart3 className="w-4 h-4 mr-2" />
                Statistiques
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-white/20">
                <Clock className="w-4 h-4 mr-2" />
                Historique
              </TabsTrigger>
              <TabsTrigger value="leaves" className="data-[state=active]:bg-white/20">
                <Calendar className="w-4 h-4 mr-2" />
                Congés
              </TabsTrigger>
            </TabsList>

            <TabsContent value="charts">
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Heures travaillées - 7 derniers jours</CardTitle>
                  <CardDescription className="text-gray-400">
                    Évolution de vos heures de travail quotidiennes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="day" 
                          stroke="rgba(255,255,255,0.7)"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="rgba(255,255,255,0.7)"
                          fontSize={12}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                          formatter={(value) => [`${value}h`, 'Heures']}
                        />
                        <Bar 
                          dataKey="hours" 
                          fill="url(#gradient)"
                          radius={[4, 4, 0, 0]}
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#60a5fa" />
                            <stop offset="100%" stopColor="#a78bfa" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <EmployeeTimeHistory userId={user?.id} />
            </TabsContent>

            <TabsContent value="leaves">
              <LeaveManagement userId={user?.id} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;