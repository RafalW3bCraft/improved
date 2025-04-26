import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Book, ArrowRight, ArrowLeft, RefreshCcw, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Dashboard() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [entriesFilter, setEntriesFilter] = useState("all");
  
  // Fetch database status
  const statusQuery = useQuery({
    queryKey: ['/api/status'],
    retry: 3,
    retryDelay: 1000,
  });
  
  // Fetch dictionary entries
  const entriesQuery = useQuery({
    queryKey: ['/api/dictionary', page, entriesFilter !== 'all' ? entriesFilter : undefined],
    retry: 1,
  });
  
  // Fetch system logs
  const logsQuery = useQuery({
    queryKey: ['/api/logs'],
    retry: 1,
  });
  
  const refreshData = () => {
    statusQuery.refetch();
    entriesQuery.refetch();
    logsQuery.refetch();
    
    toast({
      title: "Data refreshed",
      description: "The dashboard data has been refreshed.",
    });
  };
  
  // Calculate total pages for pagination
  const totalEntries = entriesQuery.data?.total || 0;
  const limit = 5; // Same as backend
  const totalPages = Math.ceil(totalEntries / limit);
  
  const isLoading = statusQuery.isLoading || entriesQuery.isLoading || logsQuery.isLoading;
  
  return (
    <div>
      {/* Database Connection Status */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-neutral-800">Database Connection</h2>
            <Badge variant={statusQuery.data?.status === 'connected' ? 'success' : 'destructive'}>
              {statusQuery.data?.status === 'connected' ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          <div className="mt-4 text-sm text-neutral-600">
            <p>
              <span className="font-medium">Connection String:</span> {statusQuery.data?.connectionString || 'Loading...'}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              {statusQuery.data?.status === 'connected' ? (
                <>
                  <span className="inline-flex items-center text-xs text-neutral-500">
                    <span className="text-green-500 mr-1">✓</span>
                    Authentication Successful
                  </span>
                  <span className="inline-flex items-center text-xs text-neutral-500">
                    <span className="text-green-500 mr-1">✓</span>
                    Database Found
                  </span>
                  <span className="inline-flex items-center text-xs text-neutral-500">
                    <span className="text-green-500 mr-1">✓</span>
                    Tables Initialized
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center text-xs text-neutral-500">
                  {statusQuery.isLoading ? 'Checking connection...' : statusQuery.error ? 'Connection error' : 'Not connected'}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Database Stats */}
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Entries */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <Book className="h-5 w-5 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-500 truncate">
                    Total Dictionary Entries
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-neutral-900">
                      {isLoading ? 'Loading...' : statusQuery.data?.stats?.total.toLocaleString() || '0'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* English-Spanish Entries */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <ArrowRight className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-500 truncate">
                    English to Spanish
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-neutral-900">
                      {isLoading ? 'Loading...' : statusQuery.data?.stats?.enToEs.toLocaleString() || '0'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Spanish-English Entries */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <ArrowLeft className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-500 truncate">
                    Spanish to English
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-neutral-900">
                      {isLoading ? 'Loading...' : statusQuery.data?.stats?.esToEn.toLocaleString() || '0'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Dictionary Data and Import Tool */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sample Data */}
        <Card>
          <div className="px-4 py-5 border-b border-neutral-200 sm:px-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-neutral-800">Dictionary Sample Data</h3>
              <div className="flex items-center space-x-2">
                <Select 
                  value={entriesFilter} 
                  onValueChange={(value) => {
                    setEntriesFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All entries</SelectItem>
                    <SelectItem value="en-es">English to Spanish</SelectItem>
                    <SelectItem value="es-en">Spanish to English</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={refreshData}
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="px-4 py-3 sm:px-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Source Term</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Translation</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Language</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white">
                  {entriesQuery.isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-sm text-neutral-500">Loading data...</td>
                    </tr>
                  ) : entriesQuery.error ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-sm text-red-500">Error loading data</td>
                    </tr>
                  ) : entriesQuery.data?.entries.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-sm text-neutral-500">No dictionary entries found</td>
                    </tr>
                  ) : (
                    entriesQuery.data?.entries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-500">{entry.id}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-neutral-800">{entry.sourceWord}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-600">{entry.translation}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-500">
                          {entry.sourceLanguage} → {entry.targetLanguage}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="py-2 flex items-center justify-between">
              <div className="text-xs text-neutral-500">
                {entriesQuery.data ? `Showing ${entriesQuery.data.entries.length} of ${entriesQuery.data.total.toLocaleString()} entries` : 'Loading...'}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-neutral-600">
                  Page {page} of {totalPages || 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Import Tool Shortcut */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-neutral-800 mb-4">Dictionary Import Tool</h3>
            <p className="text-sm text-neutral-600 mb-6">
              Import dictionary data from external sources to build your Spanish-English dictionary database.
            </p>
            
            <div className="bg-blue-50 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Default Data Source</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p className="truncate">https://raw.githubusercontent.com/open-dict-data/wikidict-es/refs/heads/master/data/en-es_wiki.txt</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Link href="/import">
              <Button className="w-full">
                Go to Import Tool
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      {/* System Logs */}
      <Card className="mt-6">
        <div className="px-4 py-5 border-b border-neutral-200 sm:px-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-neutral-800">System Logs</h3>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </div>
        
        <div className="px-4 py-3 sm:px-6 bg-neutral-50 text-sm font-mono text-neutral-800 overflow-x-auto" style={{ maxHeight: '240px' }}>
          {logsQuery.isLoading ? (
            <div className="p-4 text-center">Loading logs...</div>
          ) : logsQuery.error ? (
            <div className="p-4 text-center text-red-500">Error loading logs</div>
          ) : !logsQuery.data || logsQuery.data.length === 0 ? (
            <div className="p-4 text-center">No system logs found</div>
          ) : (
            <div className="space-y-1">
              {logsQuery.data.map((log) => (
                <p 
                  key={log.id} 
                  className={`border-l-4 pl-2 ${
                    log.level === 'info' ? 'border-green-400' : 
                    log.level === 'warn' ? 'border-yellow-400' : 
                    'border-red-400'
                  }`}
                >
                  [{new Date(log.timestamp).toLocaleString()}] {log.level.toUpperCase()}: {log.message}
                </p>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
