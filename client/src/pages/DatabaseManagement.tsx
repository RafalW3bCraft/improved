import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus, Search, RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function DatabaseManagement() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editingEntry, setEditingEntry] = useState<any>(null);
  
  // Fetch dictionary entries
  const entriesQuery = useQuery({
    queryKey: ['/api/dictionary', page, filter !== 'all' ? filter : undefined],
    retry: 1,
  });
  
  // Delete entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/dictionary/${id}`);
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Entry Deleted",
        description: "Dictionary entry has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dictionary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/status'] });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: `Failed to delete entry: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Update entry mutation
  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await apiRequest('PUT', `/api/dictionary/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Entry Updated",
        description: "Dictionary entry has been updated successfully.",
      });
      setEditingEntry(null);
      queryClient.invalidateQueries({ queryKey: ['/api/dictionary'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: `Failed to update entry: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Create entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/dictionary', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Entry Created",
        description: "New dictionary entry has been created successfully.",
      });
      setEditingEntry(null);
      queryClient.invalidateQueries({ queryKey: ['/api/dictionary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/status'] });
    },
    onError: (error) => {
      toast({
        title: "Create Failed",
        description: `Failed to create entry: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle edit dialog
  const handleEditClick = (entry: any) => {
    setEditingEntry({...entry});
  };
  
  // Handle create dialog
  const handleCreateClick = () => {
    setEditingEntry({
      id: null,
      sourceWord: "",
      translation: "",
      sourceLanguage: "en",
      targetLanguage: "es",
      examples: []
    });
  };
  
  // Handle save changes
  const handleSaveChanges = () => {
    if (!editingEntry) return;
    
    const data = {
      sourceWord: editingEntry.sourceWord,
      translation: editingEntry.translation,
      sourceLanguage: editingEntry.sourceLanguage,
      targetLanguage: editingEntry.targetLanguage,
      examples: editingEntry.examples
    };
    
    if (editingEntry.id) {
      updateEntryMutation.mutate({ id: editingEntry.id, data });
    } else {
      createEntryMutation.mutate(data);
    }
  };
  
  // Handle delete entry
  const handleDeleteEntry = (id: number) => {
    deleteEntryMutation.mutate(id);
  };
  
  // Calculate total pages for pagination
  const totalEntries = entriesQuery.data?.total || 0;
  const limit = 10; // Same as backend
  const totalPages = Math.ceil(totalEntries / limit);
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-semibold">Database Management</h2>
          <Button onClick={handleCreateClick} className="mt-2 sm:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-neutral-400" />
            </div>
            <Input
              placeholder="Search entries..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entries</SelectItem>
                <SelectItem value="en-es">English to Spanish</SelectItem>
                <SelectItem value="es-en">Spanish to English</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" onClick={() => entriesQuery.refetch()}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Source Word</TableHead>
                <TableHead>Translation</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entriesQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">Loading entries...</TableCell>
                </TableRow>
              ) : entriesQuery.error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-red-500">Error loading entries</TableCell>
                </TableRow>
              ) : entriesQuery.data?.entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">No entries found</TableCell>
                </TableRow>
              ) : (
                entriesQuery.data?.entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.id}</TableCell>
                    <TableCell>{entry.sourceWord}</TableCell>
                    <TableCell>{entry.translation}</TableCell>
                    <TableCell>{entry.sourceLanguage} → {entry.targetLanguage}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(entry)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the entry "{entry.sourceWord} → {entry.translation}"
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteEntry(entry.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-neutral-500">
            Showing {entriesQuery.data?.entries.length || 0} of {totalEntries} entries
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
        
        {/* Edit/Create Entry Dialog */}
        <Dialog open={editingEntry !== null} onOpenChange={(open) => !open && setEditingEntry(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEntry?.id ? 'Edit Entry' : 'Create New Entry'}</DialogTitle>
              <DialogDescription>
                {editingEntry?.id 
                  ? 'Edit the dictionary entry details below.' 
                  : 'Add a new dictionary entry with the details below.'}
              </DialogDescription>
            </DialogHeader>
            
            {editingEntry && (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Source Language</Label>
                    <Select 
                      value={editingEntry.sourceLanguage} 
                      onValueChange={(value) => setEditingEntry({...editingEntry, sourceLanguage: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Target Language</Label>
                    <Select 
                      value={editingEntry.targetLanguage} 
                      onValueChange={(value) => setEditingEntry({...editingEntry, targetLanguage: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Source Word</Label>
                  <Input 
                    value={editingEntry.sourceWord} 
                    onChange={(e) => setEditingEntry({...editingEntry, sourceWord: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Translation</Label>
                  <Input 
                    value={editingEntry.translation} 
                    onChange={(e) => setEditingEntry({...editingEntry, translation: e.target.value})}
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingEntry(null)}>Cancel</Button>
              <Button onClick={handleSaveChanges} disabled={updateEntryMutation.isPending || createEntryMutation.isPending}>
                {editingEntry?.id ? 'Save Changes' : 'Create Entry'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// Label component to avoid circular imports
function Label({ className, children, ...props }: React.HTMLAttributes<HTMLLabelElement>) {
  return <label className={`block ${className}`} {...props}>{children}</label>;
}
