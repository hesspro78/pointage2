import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

export const useTimeTracking = (userId) => {
  const [currentStatus, setCurrentStatus] = useState(null); // { status: 'in'/'out', time_record_id: UUID }
  const [timeRecords, setTimeRecords] = useState([]);
  const [todayHours, setTodayHours] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTimeRecordsAndStatus = useCallback(async () => {
    if (!userId) {
      setTimeRecords([]);
      setCurrentStatus(null);
      setTodayHours(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Fetch all records for the user to calculate daily/weekly/monthly hours
      const { data: recordsData, error: recordsError } = await supabase
        .from('time_records')
        .select('*')
        .eq('user_id', userId)
        .order('clock_in', { ascending: false });

      if (recordsError) throw recordsError;
      setTimeRecords(recordsData || []);

      // Determine current clock-in status: check for the latest record without a clock_out
      const latestRecord = recordsData && recordsData.length > 0 ? recordsData[0] : null;
      if (latestRecord && !latestRecord.clock_out) {
        setCurrentStatus({ status: 'in', time_record_id: latestRecord.id, clock_in_time: latestRecord.clock_in });
      } else {
        setCurrentStatus({ status: 'out', time_record_id: null });
      }

      // Calculate today's hours
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const todayRecords = (recordsData || []).filter(record => 
        record.date === today // Assuming 'date' column stores YYYY-MM-DD
      );
      
      let totalMinutes = 0;
      todayRecords.forEach(record => {
        if (record.clock_out) {
          const clockIn = new Date(record.clock_in);
          const clockOut = new Date(record.clock_out);
          totalMinutes += (clockOut.getTime() - clockIn.getTime()) / (1000 * 60);
        }
      });
      setTodayHours(totalMinutes / 60);

    } catch (error) {
      console.error('Error fetching time records:', error);
      toast({ title: "Erreur", description: "Impossible de charger les pointages.", variant: "destructive" });
      // Fallback to local storage if needed, or clear
      setTimeRecords(JSON.parse(localStorage.getItem(`timeRecords_${userId}_fallback`)) || []);
      const localStatus = JSON.parse(localStorage.getItem(`status_${userId}_fallback`));
      if(localStatus) setCurrentStatus(localStatus); else setCurrentStatus({status: 'out', time_record_id: null});
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTimeRecordsAndStatus();
  }, [fetchTimeRecordsAndStatus]);

  const clockIn = async () => {
    if (!userId) return;
    if (currentStatus?.status === 'in') {
      toast({ title: "Erreur", description: "Vous êtes déjà pointé en entrée", variant: "destructive" });
      return;
    }
    setLoading(true);
    const now = new Date();
    try {
      const { data, error } = await supabase
        .from('time_records')
        .insert({
          user_id: userId,
          date: now.toISOString().split('T')[0],
          clock_in: now.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentStatus({ status: 'in', time_record_id: data.id, clock_in_time: data.clock_in });
      setTimeRecords(prev => [data, ...prev]); // Add to the beginning
      localStorage.setItem(`status_${userId}_fallback`, JSON.stringify({ status: 'in', time_record_id: data.id, clock_in_time: data.clock_in }));
      localStorage.setItem(`timeRecords_${userId}_fallback`, JSON.stringify([data, ...timeRecords]));


      toast({ title: "Pointage d'entrée", description: `Pointé à ${now.toLocaleTimeString()}` });
      if (Notification.permission === 'granted') {
        new Notification('Pointage d\'entrée', { body: `Pointé à ${now.toLocaleTimeString()}`, icon: '/default-logo.svg' });
      }
    } catch (error) {
      console.error('Error clocking in:', error);
      toast({ title: "Erreur", description: "Impossible de pointer en entrée.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const clockOut = async () => {
    if (!userId || currentStatus?.status !== 'in' || !currentStatus.time_record_id) {
      toast({ title: "Erreur", description: "Vous devez d'abord pointer en entrée.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const now = new Date();
    try {
      const { data, error } = await supabase
        .from('time_records')
        .update({ clock_out: now.toISOString() })
        .eq('id', currentStatus.time_record_id)
        .select()
        .single();

      if (error) throw error;

      setCurrentStatus({ status: 'out', time_record_id: null });
      // Update the specific record in timeRecords state and recalculate todayHours
      const updatedRecords = timeRecords.map(r => r.id === data.id ? data : r);
      setTimeRecords(updatedRecords);
      localStorage.setItem(`status_${userId}_fallback`, JSON.stringify({ status: 'out', time_record_id: null }));
      localStorage.setItem(`timeRecords_${userId}_fallback`, JSON.stringify(updatedRecords));

      const clockInTime = new Date(data.clock_in);
      const workedMinutes = (now.getTime() - clockInTime.getTime()) / (1000 * 60);
      const workedHours = Math.floor(workedMinutes / 60);
      const remainingMinutes = Math.floor(workedMinutes % 60);
      
      // Recalculate today's hours
      const today = new Date().toISOString().split('T')[0];
      const todayRecs = updatedRecords.filter(record => record.date === today);
      let totalMinutes = 0;
      todayRecs.forEach(record => {
        if (record.clock_out) {
          const ci = new Date(record.clock_in);
          const co = new Date(record.clock_out);
          totalMinutes += (co.getTime() - ci.getTime()) / (1000 * 60);
        }
      });
      setTodayHours(totalMinutes / 60);


      toast({ title: "Pointage de sortie", description: `Pointé à ${now.toLocaleTimeString()} - Temps travaillé: ${workedHours}h ${remainingMinutes}min` });
      if (Notification.permission === 'granted') {
        new Notification('Pointage de sortie', { body: `Pointé à ${now.toLocaleTimeString()} - Temps travaillé: ${workedHours}h ${remainingMinutes}min`, icon: '/default-logo.svg' });
      }
    } catch (error) {
      console.error('Error clocking out:', error);
      toast({ title: "Erreur", description: "Impossible de pointer en sortie.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  
  const getHoursForPeriod = (records, startDate, endDate) => {
    const periodRecords = records.filter(record => {
      const recordDate = new Date(record.date); // Assumes 'date' is YYYY-MM-DD
      return recordDate >= startDate && recordDate <= endDate;
    });

    let totalMinutes = 0;
    periodRecords.forEach(record => {
      if (record.clock_out) {
        const clockIn = new Date(record.clock_in);
        const clockOut = new Date(record.clock_out);
        totalMinutes += (clockOut.getTime() - clockIn.getTime()) / (1000 * 60);
      }
    });
    return totalMinutes / 60;
  };


  const getWeeklyHours = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // Sunday = 0, Monday = 1, ...
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Adjust to Monday as start of week
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23,59,59,999);

    return getHoursForPeriod(timeRecords, weekStart, weekEnd);
  };

  const getMonthlyHours = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
    monthEnd.setHours(23,59,59,999);
    
    return getHoursForPeriod(timeRecords, monthStart, monthEnd);
  };

  return {
    currentStatus,
    timeRecords,
    todayHours,
    loading,
    clockIn,
    clockOut,
    getWeeklyHours,
    getMonthlyHours,
    fetchTimeRecordsAndStatus,
  };
};
