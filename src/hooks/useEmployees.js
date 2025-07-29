import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) {
        throw error;
      }
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({ title: "Erreur", description: "Impossible de charger les employés.", variant: "destructive" });
      setEmployees(JSON.parse(localStorage.getItem('employees_fallback')) || []); // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
    // Fallback to local storage employees if needed for initial data (or until Supabase is populated)
    // This logic can be removed once Supabase is the single source of truth
    if (employees.length === 0 && !loading) {
        const localEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
        if (localEmployees.length > 0) {
            // Potentially migrate these to Supabase if they don't exist
            // For now, just display them if Supabase is empty
            // setEmployees(localEmployees); 
            // console.warn("Displayed employees from local storage as Supabase was empty or loading failed.");
        }
    }
  }, [fetchEmployees, employees.length, loading]);

  const addEmployee = async (employeeData) => {
    setLoading(true);
    // Sign up the user in Supabase Auth first
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: employeeData.email,
      password: employeeData.password, // Ensure password is provided and strong
      options: {
        data: { 
          full_name: employeeData.name,
          user_role: employeeData.role || 'employee', // 'admin' or 'employee'
        }
      }
    });

    if (authError) {
      console.error('Error signing up employee:', authError);
      toast({ title: "Erreur d'inscription", description: authError.message, variant: "destructive" });
      setLoading(false);
      return null;
    }

    if (authData.user) {
      // Profile is created by trigger, update it with additional details
      const profileDataToUpdate = {
        username: employeeData.username || employeeData.email, // Use email as username if not provided
        full_name: employeeData.name,
        department: employeeData.department,
        position: employeeData.position,
        phone: employeeData.phone,
        hire_date: employeeData.hireDate,
        status: employeeData.status || 'active',
        role: employeeData.role || 'employee',
        // avatar_url can be added here if available
      };

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update(profileDataToUpdate)
        .eq('id', authData.user.id)
        .select()
        .single();
      
      if (profileError) {
        console.error('Error updating employee profile:', profileError);
        // Potentially delete the auth user if profile update fails critically
        // await supabase.auth.admin.deleteUser(authData.user.id); 
        toast({ title: "Erreur de profil", description: "Impossible de mettre à jour le profil de l'employé après l'inscription.", variant: "destructive" });
        setLoading(false);
        return null;
      }
      
      setEmployees(prev => [...prev, profileData]);
      toast({ title: "Succès", description: "Employé ajouté avec succès." });
      setLoading(false);
      return profileData;
    }
    setLoading(false);
    return null;
  };


  const updateEmployee = async (id, employeeData) => {
    setLoading(true);
    try {
      // Note: Supabase auth email/password changes are separate operations
      // Here we only update the 'profiles' table data
      const { data, error } = await supabase
        .from('profiles')
        .update({
          username: employeeData.username,
          full_name: employeeData.name,
          department: employeeData.department,
          position: employeeData.position,
          phone: employeeData.phone,
          hire_date: employeeData.hireDate,
          status: employeeData.status,
          role: employeeData.role,
          // avatar_url: employeeData.avatar_url (if applicable)
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setEmployees(prev => prev.map(emp => (emp.id === id ? data : emp)));
      localStorage.setItem('employees_fallback', JSON.stringify(employees.map(emp => (emp.id === id ? data : emp))));
      toast({ title: "Succès", description: "Informations de l'employé mises à jour." });
      return data;
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour l'employé.", variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteEmployee = async (id) => {
    setLoading(true);
    // First, delete from Supabase Auth (requires admin privileges for the client or use a server-side function)
    // This is a placeholder, as direct user deletion client-side with anon key is usually restricted.
    // Typically, this would be done via a Supabase Edge Function with service_role key.
    // For now, we'll proceed with profile deletion only and log a warning.
    console.warn(`Deletion of user ${id} from Supabase Auth needs to be handled with care, possibly via an Edge Function.`);
    // const { error: authDeleteError } = await supabase.auth.admin.deleteUser(id); // Requires service_role
    // if (authDeleteError) {
    //   console.error('Error deleting user from Supabase Auth:', authDeleteError);
    //   toast({ title: "Erreur de suppression Auth", description: authDeleteError.message, variant: "destructive" });
    //   // Decide if to proceed with profile deletion or stop
    // }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEmployees(prev => prev.filter(emp => emp.id !== id));
      localStorage.setItem('employees_fallback', JSON.stringify(employees.filter(emp => emp.id !== id)));
      // Remove associated data (time records, leaves) - cascade delete should handle this if set up in DB
      // localStorage.removeItem(`status_${id}`);
      // localStorage.removeItem(`timeRecords_${id}`);
      // localStorage.removeItem(`leaves_${id}`);
      toast({ title: "Succès", description: "Employé supprimé." });
    } catch (error) {
      console.error('Error deleting employee profile:', error);
      toast({ title: "Erreur", description: "Impossible de supprimer le profil de l'employé.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeById = (id) => {
    return employees.find(emp => emp.id === id);
  };

  const getAllTimeRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('time_records')
        .select(`
          *,
          profiles (
            full_name,
            department
          )
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      
      const formattedRecords = data.map(record => ({
        ...record,
        employeeId: record.user_id,
        employeeName: record.profiles.full_name,
        department: record.profiles.department
      }));
      
      return formattedRecords;
    } catch (error) {
      console.error('Error fetching all time records:', error);
      toast({ title: "Erreur", description: "Impossible de charger tous les pointages.", variant: "destructive" });
      return []; // Fallback to local storage method or empty
    } finally {
      setLoading(false);
    }
  };

  return {
    employees,
    loading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    getAllTimeRecords,
    fetchEmployees
  };
};
