import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { UserPlus, Edit, Trash2, Building, Mail, Phone } from 'lucide-react';

const EmployeeManagementTab = ({ employees, onAddEmployee, onUpdateEmployee, onDeleteEmployee }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '', username: '', password: '', email: '',
    department: '', position: '', phone: '', hireDate: ''
  });

  const handleAddEmployeeSubmit = (e) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.username || !newEmployee.password) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires", variant: "destructive" });
      return;
    }
    if (employees.find(emp => emp.username === newEmployee.username)) {
      toast({ title: "Erreur", description: "Ce nom d'utilisateur existe déjà", variant: "destructive" });
      return;
    }
    onAddEmployee(newEmployee);
    toast({ title: "Succès", description: "Employé ajouté avec succès" });
    setIsAddDialogOpen(false);
    setNewEmployee({ name: '', username: '', password: '', email: '', department: '', position: '', phone: '', hireDate: '' });
  };

  const handleEditEmployeeSubmit = (e) => {
    e.preventDefault();
    onUpdateEmployee(selectedEmployee.id, selectedEmployee);
    toast({ title: "Succès", description: "Employé modifié avec succès" });
    setIsEditDialogOpen(false);
    setSelectedEmployee(null);
  };

  return (
    <Card className="glass-effect border-white/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white">Gestion des Employés</CardTitle>
          <CardDescription className="text-gray-400">Gérer les employés et leurs informations</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700"><UserPlus className="w-4 h-4 mr-2" />Ajouter Employé</Button>
          </DialogTrigger>
          <DialogContent className="glass-effect border-white/20 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="gradient-text">Ajouter un nouvel employé</DialogTitle>
              <DialogDescription className="text-gray-300">Remplissez les informations de l'employé</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEmployeeSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-200">Nom complet *</Label>
                  <Input id="name" value={newEmployee.name} onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})} className="bg-white/10 border-white/20 text-white" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-200">Nom d'utilisateur *</Label>
                  <Input id="username" value={newEmployee.username} onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})} className="bg-white/10 border-white/20 text-white" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-200">Mot de passe *</Label>
                  <Input id="password" type="password" value={newEmployee.password} onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})} className="bg-white/10 border-white/20 text-white" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200">Email</Label>
                  <Input id="email" type="email" value={newEmployee.email} onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})} className="bg-white/10 border-white/20 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-gray-200">Département</Label>
                  <Select onValueChange={(value) => setNewEmployee({...newEmployee, department: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue placeholder="Sélectionner un département" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Enseignement">Enseignement</SelectItem>
                      <SelectItem value="Administration">Administration</SelectItem>
                      <SelectItem value="Technique">Technique</SelectItem>
                      <SelectItem value="Direction">Direction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position" className="text-gray-200">Poste</Label>
                  <Input id="position" value={newEmployee.position} onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})} className="bg-white/10 border-white/20 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-200">Téléphone</Label>
                  <Input id="phone" value={newEmployee.phone} onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})} className="bg-white/10 border-white/20 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hireDate" className="text-gray-200">Date d'embauche</Label>
                  <Input id="hireDate" type="date" value={newEmployee.hireDate} onChange={(e) => setNewEmployee({...newEmployee, hireDate: e.target.value})} className="bg-white/10 border-white/20 text-white" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">Ajouter</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {employees.map((employee) => (
            <div key={employee.id} className="employee-card p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{employee.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{employee.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1"><Building className="w-4 h-4" />{employee.department}</span>
                      <span>{employee.position}</span>
                      {employee.email && (<span className="flex items-center gap-1"><Mail className="w-4 h-4" />{employee.email}</span>)}
                      {employee.phone && (<span className="flex items-center gap-1"><Phone className="w-4 h-4" />{employee.phone}</span>)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setSelectedEmployee(employee); setIsEditDialogOpen(true); }} className="border-white/20 text-white hover:bg-white/10"><Edit className="w-4 h-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => onDeleteEmployee(employee.id)} className="border-red-500/50 text-red-400 hover:bg-red-500/20"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-effect border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="gradient-text">Modifier l'employé</DialogTitle>
            <DialogDescription className="text-gray-300">Modifiez les informations de l'employé</DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <form onSubmit={handleEditEmployeeSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editName" className="text-gray-200">Nom complet</Label>
                  <Input id="editName" value={selectedEmployee.name} onChange={(e) => setSelectedEmployee({...selectedEmployee, name: e.target.value})} className="bg-white/10 border-white/20 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editUsername" className="text-gray-200">Nom d'utilisateur</Label>
                  <Input id="editUsername" value={selectedEmployee.username} onChange={(e) => setSelectedEmployee({...selectedEmployee, username: e.target.value})} className="bg-white/10 border-white/20 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editEmail" className="text-gray-200">Email</Label>
                  <Input id="editEmail" type="email" value={selectedEmployee.email || ''} onChange={(e) => setSelectedEmployee({...selectedEmployee, email: e.target.value})} className="bg-white/10 border-white/20 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editDepartment" className="text-gray-200">Département</Label>
                  <Select value={selectedEmployee.department} onValueChange={(value) => setSelectedEmployee({...selectedEmployee, department: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Enseignement">Enseignement</SelectItem>
                      <SelectItem value="Administration">Administration</SelectItem>
                      <SelectItem value="Technique">Technique</SelectItem>
                      <SelectItem value="Direction">Direction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPosition" className="text-gray-200">Poste</Label>
                  <Input id="editPosition" value={selectedEmployee.position || ''} onChange={(e) => setSelectedEmployee({...selectedEmployee, position: e.target.value})} className="bg-white/10 border-white/20 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPhone" className="text-gray-200">Téléphone</Label>
                  <Input id="editPhone" value={selectedEmployee.phone || ''} onChange={(e) => setSelectedEmployee({...selectedEmployee, phone: e.target.value})} className="bg-white/10 border-white/20 text-white" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Sauvegarder</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EmployeeManagementTab;