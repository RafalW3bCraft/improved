import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDictionaryEntrySchema, insertImportJobSchema } from "@shared/schema";
import { ZodError } from "zod";
import { logSystemEvent } from "./db";
import fetch from "node-fetch";
import { learningRouter } from "./learning-routes";
import { llmRouter } from "./llm-routes";
import { culturalContextRouter } from "./cultural-context-routes";
import { curriculumRouter } from "./curriculum-routes";

// Function to parse the dictionary data
async function parseDictionaryData(data: string, bidirectional: boolean): Promise<any[]> {
  const lines = data.split('\n').filter(line => line.trim() !== '');
  const entries: any[] = [];
  
  for (const line of lines) {
    // Skip comment lines
    if (line.startsWith('#')) continue;
    
    // Format is typically: word \t translation
    const parts = line.split('\t');
    if (parts.length >= 2) {
      const sourceWord = parts[0].trim();
      const translation = parts[1].trim();
      
      // Skip if either part is empty
      if (!sourceWord || !translation) continue;
      
      // Create English to Spanish entry
      entries.push({
        sourceWord,
        translation,
        sourceLanguage: 'en',
        targetLanguage: 'es',
        examples: []
      });
      
      // If bidirectional, create Spanish to English entry
      if (bidirectional) {
        entries.push({
          sourceWord: translation,
          translation: sourceWord,
          sourceLanguage: 'es',
          targetLanguage: 'en',
          examples: []
        });
      }
    }
  }
  
  return entries;
}

// Function to process an import job
async function processImportJob(jobId: number) {
  try {
    // Get the job
    const job = await storage.getImportJob(jobId);
    if (!job) {
      await logSystemEvent('error', `Import job ${jobId} not found`);
      return;
    }
    
    // Update job status to in progress
    await storage.updateImportJob(jobId, { status: 'in_progress' });
    await logSystemEvent('info', `Import process started for ${job.source}`);
    
    // If replace is true, delete all existing entries
    if (job.replace) {
      const deleted = await storage.deleteAllDictionaryEntries();
      await logSystemEvent('info', `Deleted ${deleted} existing dictionary entries`);
    }
    
    // Fetch the data
    const response = await fetch(job.source);
    const data = await response.text();
    
    await logSystemEvent('info', `Downloaded ${(data.length / 1024).toFixed(1)}KB of dictionary data`);
    
    // Parse the data
    const entries = await parseDictionaryData(data, job.bidirectional);
    
    // Update job with total entries count
    await storage.updateImportJob(jobId, { 
      totalEntries: entries.length,
      processedEntries: 0
    });
    
    // Process in batches to avoid memory issues
    const batchSize = 1000;
    let processedCount = 0;
    
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      await storage.createManyDictionaryEntries(batch);
      
      processedCount += batch.length;
      
      // Log progress for every 10000 entries
      if (processedCount % 10000 === 0 || processedCount === entries.length) {
        await logSystemEvent('info', `Processed ${processedCount} dictionary entries`);
      }
      
      // Update job progress
      await storage.updateImportJob(jobId, { processedEntries: processedCount });
    }
    
    // Count entries by direction
    const counts = await storage.countDictionaryEntries();
    
    // Update job to completed
    await storage.updateImportJob(jobId, { 
      status: 'completed',
      completedAt: new Date()
    });
    
    await logSystemEvent('info', `Import completed: ${counts.enToEs} English-Spanish entries and ${counts.esToEn} Spanish-English entries`);
    
  } catch (error) {
    await logSystemEvent('error', `Import job ${jobId} failed: ${error}`);
    await storage.updateImportJob(jobId, { 
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
      completedAt: new Date()
    });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiPrefix = '/api';
  
  // Basic error handler for routes
  const handleError = (res: Response, error: any) => {
    console.error('API Error:', error);
    
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    const status = error.status || 500;
    const message = error.message || 'Internal Server Error';
    
    res.status(status).json({ message });
  };
  
  // Database status endpoint
  app.get(`${apiPrefix}/status`, async (req: Request, res: Response) => {
    try {
      // Check if database is connected by performing a simple query
      const counts = await storage.countDictionaryEntries();
      
      res.json({ 
        status: 'connected',
        connectionString: process.env.DATABASE_URL?.replace(/:[^:]*@/, ':***@'),
        stats: counts
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'disconnected',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Dictionary entries endpoints
  app.get(`${apiPrefix}/dictionary`, async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filter = req.query.filter as string;
      
      const result = await storage.getDictionaryEntries(page, limit, filter);
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.get(`${apiPrefix}/dictionary/search`, async (req: Request, res: Response) => {
    try {
      const term = req.query.term as string;
      const sourceLang = req.query.sourceLang as string || 'en';
      const targetLang = req.query.targetLang as string || 'es';
      
      if (!term) {
        return res.status(400).json({ message: 'Search term is required' });
      }
      
      const results = await storage.searchDictionary(term, sourceLang, targetLang);
      res.json(results);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.post(`${apiPrefix}/dictionary`, async (req: Request, res: Response) => {
    try {
      const entryData = insertDictionaryEntrySchema.parse(req.body);
      const entry = await storage.createDictionaryEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.put(`${apiPrefix}/dictionary/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertDictionaryEntrySchema.partial().parse(req.body);
      const updated = await storage.updateDictionaryEntry(id, updates);
      
      if (!updated) {
        return res.status(404).json({ message: 'Entry not found' });
      }
      
      res.json(updated);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.delete(`${apiPrefix}/dictionary/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDictionaryEntry(id);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Entry not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Import job endpoints
  app.post(`${apiPrefix}/import`, async (req: Request, res: Response) => {
    try {
      const jobData = insertImportJobSchema.parse(req.body);
      const job = await storage.createImportJob({
        ...jobData,
        status: 'pending'
      });
      
      // Start processing the import job asynchronously
      processImportJob(job.id).catch(error => {
        console.error('Error processing import job:', error);
      });
      
      res.status(201).json(job);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.get(`${apiPrefix}/import/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getImportJob(id);
      
      if (!job) {
        return res.status(404).json({ message: 'Import job not found' });
      }
      
      res.json(job);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.get(`${apiPrefix}/import/latest`, async (req: Request, res: Response) => {
    try {
      const job = await storage.getLatestImportJob();
      
      if (!job) {
        return res.status(404).json({ message: 'No import jobs found' });
      }
      
      res.json(job);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // System logs endpoint
  app.get(`${apiPrefix}/logs`, async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getSystemLogs(limit);
      res.json(logs);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Register learning routes
  app.use(`${apiPrefix}/learning`, learningRouter);
  
  // Register LLM routes
  app.use(`${apiPrefix}/llm`, llmRouter);
  
  // Register Cultural Context routes
  app.use(`${apiPrefix}/cultural-context`, culturalContextRouter);
  
  // Register Curriculum routes
  app.use(`${apiPrefix}/curriculum`, curriculumRouter);
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
