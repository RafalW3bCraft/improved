import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Download, Info } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function ImportDictionary() {
  const { toast } = useToast();
  const [dataSource, setDataSource] = useState("https://raw.githubusercontent.com/open-dict-data/wikidict-es/refs/heads/master/data/en-es_wiki.txt");
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [bidirectional, setBidirectional] = useState(true);
  const [importJobId, setImportJobId] = useState<number | null>(null);

  // Query to check the latest import job status
  const importStatusQuery = useQuery({
    queryKey: ['/api/import', importJobId],
    enabled: importJobId !== null,
    refetchInterval: (data) => {
      // Polling interval based on job status
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false; // Stop polling
      }
      return 2000; // Poll every 2 seconds
    },
  });
  
  // Start import mutation
  const startImportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/import', {
        source: dataSource,
        replace: replaceExisting,
        bidirectional: bidirectional,
        status: 'pending'
      });
      return response.json();
    },
    onSuccess: (data) => {
      setImportJobId(data.id);
      toast({
        title: "Import Started",
        description: "Dictionary import process has started. This may take a few minutes.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: `Failed to start import: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Calculate progress percentage
  const progress = importStatusQuery.data?.processedEntries && importStatusQuery.data?.totalEntries
    ? Math.round((importStatusQuery.data.processedEntries / importStatusQuery.data.totalEntries) * 100)
    : 0;
  
  // Check for latest import job on mount
  useEffect(() => {
    const checkLatestJob = async () => {
      try {
        const response = await fetch('/api/import/latest');
        if (response.ok) {
          const data = await response.json();
          if (data && (data.status === 'pending' || data.status === 'in_progress')) {
            setImportJobId(data.id);
          }
        }
      } catch (error) {
        console.error('Failed to check latest import job', error);
      }
    };
    
    checkLatestJob();
  }, []);
  
  // Handle import completion
  useEffect(() => {
    if (importStatusQuery.data?.status === 'completed') {
      toast({
        title: "Import Completed",
        description: `Successfully imported ${importStatusQuery.data.processedEntries} dictionary entries.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dictionary'] });
    } else if (importStatusQuery.data?.status === 'failed') {
      toast({
        title: "Import Failed",
        description: importStatusQuery.data.error || "Failed to import dictionary data.",
        variant: "destructive",
      });
    }
  }, [importStatusQuery.data?.status, importStatusQuery.data?.processedEntries, importStatusQuery.data?.error, toast]);
  
  const handleStartImport = () => {
    if (!dataSource) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid data source URL.",
        variant: "destructive",
      });
      return;
    }
    
    startImportMutation.mutate();
  };
  
  const isImporting = importStatusQuery.data?.status === 'pending' || importStatusQuery.data?.status === 'in_progress';
  
  return (
    <Card className="max-w-3xl mx-auto">
      <CardContent className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Dictionary Import Tool</h2>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="datasource" className="block text-sm font-medium text-neutral-700">Data Source</Label>
            <div className="mt-1">
              <Input
                id="datasource"
                value={dataSource}
                onChange={(e) => setDataSource(e.target.value)}
                disabled={isImporting}
                className="w-full"
              />
            </div>
            <p className="mt-1 text-sm text-neutral-500">Enter the URL or file path of the dictionary data source.</p>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-neutral-700">Import Options</Label>
            <div className="mt-4 space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <Checkbox
                    id="replace"
                    checked={replaceExisting}
                    onCheckedChange={(checked) => setReplaceExisting(checked === true)}
                    disabled={isImporting}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <Label htmlFor="replace" className="font-medium text-neutral-700">Replace existing entries</Label>
                  <p className="text-neutral-500">Warning: This will delete all existing entries before importing.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <Checkbox
                    id="bidirectional"
                    checked={bidirectional}
                    onCheckedChange={(checked) => setBidirectional(checked === true)}
                    disabled={isImporting}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <Label htmlFor="bidirectional" className="font-medium text-neutral-700">Create bidirectional entries</Label>
                  <p className="text-neutral-500">Automatically create reverse entries (Spanish → English) for each entry.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <Button 
              onClick={handleStartImport} 
              disabled={isImporting || !dataSource || startImportMutation.isPending}
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Start Import
            </Button>
          </div>
          
          {/* Import Status */}
          {isImporting && (
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-blue-800">Import in Progress</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Downloading and processing the dictionary data. This may take several minutes.</p>
                  </div>
                  <div className="mt-3">
                    <Progress value={progress} className="w-full h-2" />
                    <p className="mt-1 text-xs text-blue-700">
                      {progress}% complete - {importStatusQuery.data?.processedEntries?.toLocaleString()} entries processed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Import complete status */}
          {importStatusQuery.data?.status === 'completed' && (
            <div className="mt-6 p-4 bg-green-50 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-green-800">Import Complete</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Successfully imported {importStatusQuery.data.processedEntries.toLocaleString()} dictionary entries.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Import failed status */}
          {importStatusQuery.data?.status === 'failed' && (
            <div className="mt-6 p-4 bg-red-50 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">Import Failed</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{importStatusQuery.data.error || 'An error occurred during the import process.'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
