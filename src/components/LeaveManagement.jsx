import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { useLeaves } from '@/hooks/useLeaves';
import { Calendar, Plus, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

const LeaveManagement = ({ userId }) => {
  const { leaves, addLeave, updateLeave, deleteLeave } = useLeaves(userId);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [newLeave, setNewLeave] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const handleAddLeave = (e) => {
    e.preventDefault();
    
    if (!newLeave.type || !newLeave.startDate || !newLeave.endDate || !newLeave.reason) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    const startDate = new Date(newLeave.startDate);
    const endDate = new Date(newLeave.endDate);
    
    if (endDate < startDate) {
      toast({
        title: "Erreur",
        description: "La date de fin doit être postérieure à la date de début",
        variant: "destructive"
      });
      return;
    }

    addLeave(newLeave);
    toast({
      title: "Succès",
      description: "Demande de congé ajoutée avec succès",
    });
    
    setIsAddDialogOpen(false);
    setNewLeave({
      type: '',
      startDate: '',
      endDate: '',
      reason: ''
    });
  };

  const handleEditLeave = (e) => {
    e.preventDefault();
    
    updateLeave(selectedLeave.id, selectedLeave);
    toast({
      title: "Succès",
      description: "Congé modifié avec succès",
    });
    
    setIsEditDialogOpen(false);
    setSelectedLeave(null);
  };

  const handleDeleteLeave = (leaveId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce congé ?')) {
      deleteLeave(leaveId);
      toast({
        title: "Succès",
        description: "Congé supprimé avec succès",
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      default:
        return 'En attente';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'vacation':
        return 'bg-blue-500/20 text-blue-400';
      case 'sick':
        return 'bg-red-500/20 text-red-400';
      case 'personal':
        return 'bg-purple-500/20 text-purple-400';
      case 'maternity':
        return 'bg-pink-500/20 text-pink-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getLeaveTypeText = (type) => {
    switch (type) {
      case 'vacation':
        return 'Vacances';
      case 'sick':
        return 'Maladie';
      case 'personal':
        return 'Personnel';
      case 'maternity':
        return 'Maternité';
      default:
        return type;
    }
  };

  return (
    <Card className="glass-effect border-white/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Gestion des Congés
          </CardTitle>
          <CardDescription className="text-gray-400">
            Gérez vos demandes de congés et absences
          </CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle demande
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-effect border-white/20">
            <DialogHeader>
              <DialogTitle className="gradient-text">Nouvelle demande de congé</DialogTitle>
              <DialogDescription className="text-gray-300">
                Remplissez les détails de votre demande de congé
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddLeave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-gray-200">Type de congé</Label>
                <Select onValueChange={(value) => setNewLeave({...newLeave, type: value})}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Vacances</SelectItem>
                    <SelectItem value="sick">Maladie</SelectItem>
                    <SelectItem value="personal">Personnel</SelectItem>
                    <SelectItem value="maternity">Maternité</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-gray-200">Date de début</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-gray-200">Date de fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-gray-200">Motif</Label>
                <Input
                  id="reason"
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Décrivez le motif de votre demande"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Soumettre
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {leaves.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Aucune demande de congé</p>
            <p className="text-sm text-gray-500 mt-2">Cliquez sur "Nouvelle demande" pour commencer</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaves
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((leave) => (
                <div key={leave.id} className="employee-card p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getLeaveTypeColor(leave.type)}`}>
                          {getLeaveTypeText(leave.type)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(leave.status)}`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(leave.status)}
                            {getStatusText(leave.status)}
                          </span>
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1">{leave.reason}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>
                          Du {new Date(leave.startDate).toLocaleDateString('fr-FR')} au {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                        </span>
                        <span>
                          {calculateDays(leave.startDate, leave.endDate)} jour{calculateDays(leave.startDate, leave.endDate) > 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Demandé le {new Date(leave.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedLeave(leave);
                          setIsEditDialogOpen(true);
                        }}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteLeave(leave.id)}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="glass-effect border-white/20">
            <DialogHeader>
              <DialogTitle className="gradient-text">Modifier la demande de congé</DialogTitle>
              <DialogDescription className="text-gray-300">
                Modifiez les détails de votre demande
              </DialogDescription>
            </DialogHeader>
            {selectedLeave && (
              <form onSubmit={handleEditLeave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editType" className="text-gray-200">Type de congé</Label>
                  <Select 
                    value={selectedLeave.type}
                    onValueChange={(value) => setSelectedLeave({...selectedLeave, type: value})}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacation">Vacances</SelectItem>
                      <SelectItem value="sick">Maladie</SelectItem>
                      <SelectItem value="personal">Personnel</SelectItem>
                      <SelectItem value="maternity">Maternité</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editStartDate" className="text-gray-200">Date de début</Label>
                    <Input
                      id="editStartDate"
                      type="date"
                      value={selectedLeave.startDate}
                      onChange={(e) => setSelectedLeave({...selectedLeave, startDate: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editEndDate" className="text-gray-200">Date de fin</Label>
                    <Input
                      id="editEndDate"
                      type="date"
                      value={selectedLeave.endDate}
                      onChange={(e) => setSelectedLeave({...selectedLeave, endDate: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editReason" className="text-gray-200">Motif</Label>
                  <Input
                    id="editReason"
                    value={selectedLeave.reason}
                    onChange={(e) => setSelectedLeave({...selectedLeave, reason: e.target.value})}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Sauvegarder
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default LeaveManagement;