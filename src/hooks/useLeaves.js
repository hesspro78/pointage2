import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

export const useLeaves = (userId) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = useCallback(async () => {
    if (!userId) {
      setLeaves([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeaves(data || []);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast({ title: "Erreur", description: "Impossible de charger les demandes de congé.", variant: "destructive" });
      setLeaves(JSON.parse(localStorage.getItem(`leaves_${userId}_fallback`)) || []); // Fallback
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const addLeave = async (leaveData) => {
    if (!userId) {
      toast({ title: "Erreur", description: "ID utilisateur non défini.", variant: "destructive" });
      return null;
    }
    setLoading(true);
    try {
      const newLeave = {
        ...leaveData,
        user_id: userId,
        status: 'pending', // Default status
      };
      const { data, error } = await supabase
        .from('leave_requests')
        .insert(newLeave)
        .select()
        .single();

      if (error) throw error;
      
      setLeaves(prev => [data, ...prev]);
      localStorage.setItem(`leaves_${userId}_fallback`, JSON.stringify([data, ...leaves]));
      toast({ title: "Succès", description: "Demande de congé ajoutée." });
      return data;
    } catch (error) {
      console.error('Error adding leave:', error);
      toast({ title: "Erreur", description: "Impossible d'ajouter la demande de congé.", variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateLeave = async (id, leaveData) => {
    // Note: `id` here is the leave_request id, not user_id
    setLoading(true);
    try {
      // Only admin should be able to change status, user can perhaps cancel/edit reason
      // Add RLS policies in Supabase to enforce this
      const { data, error } = await supabase
        .from('leave_requests')
        .update(leaveData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setLeaves(prev => prev.map(leave => (leave.id === id ? data : leave)));
      localStorage.setItem(`leaves_${userId}_fallback`, JSON.stringify(leaves.map(leave => (leave.id === id ? data : leave))));
      toast({ title: "Succès", description: "Demande de congé mise à jour." });
      return data;
    } catch (error) {
      console.error('Error updating leave:', error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour la demande de congé.", variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteLeave = async (id) => {
    // Note: `id` here is the leave_request id
    setLoading(true);
    try {
      const { error } = await supabase
        .from('leave_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLeaves(prev => prev.filter(leave => leave.id !== id));
      localStorage.setItem(`leaves_${userId}_fallback`, JSON.stringify(leaves.filter(leave => leave.id !== id)));
      toast({ title: "Succès", description: "Demande de congé supprimée." });
    } catch (error) {
      console.error('Error deleting leave:', error);
      toast({ title: "Erreur", description: "Impossible de supprimer la demande de congé.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getAllLeaves = async () => { // For admin view
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          profiles (
            full_name,
            department
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedLeaves = data.map(leave => ({
        ...leave,
        employeeId: leave.user_id,
        employeeName: leave.profiles.full_name,
        department: leave.profiles.department
      }));
      
      return formattedLeaves;
    } catch (error) {
      console.error('Error fetching all leaves:', error);
      toast({ title: "Erreur", description: "Impossible de charger toutes les demandes de congé.", variant: "destructive" });
      return []; // Fallback or empty
    } finally {
      setLoading(false);
    }
  };

  return {
    leaves,
    loading,
    addLeave,
    updateLeave,
    deleteLeave,
    getAllLeaves,
    fetchLeaves
  };
};
