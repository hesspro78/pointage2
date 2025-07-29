import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, Calendar, Clock } from 'lucide-react';

const AdminStatsCards = ({ totalEmployees, activeEmployees, totalLeaves, dailyTimeRecordsCount }) => {
  const stats = [
    { label: "Total Employés", value: totalEmployees, icon: Users, color: "blue" },
    { label: "Employés Actifs", value: activeEmployees, icon: TrendingUp, color: "green" },
    { label: "Total Congés", value: totalLeaves, icon: Calendar, color: "purple" },
    { label: "Pointages Aujourd'hui", value: dailyTimeRecordsCount, icon: Clock, color: "orange" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
    >
      {stats.map((stat, index) => (
        <Card key={index} className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-${stat.color}-500/20 rounded-full flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
              <div>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
};

export default AdminStatsCards;