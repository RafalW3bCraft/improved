import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";
import { systemLogs } from '@shared/schema';
import ws from 'ws';
import { eq } from 'drizzle-orm';

// Configure WebSocket for Neon database
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a connection pool
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create a drizzle instance
export const db = drizzle(pool, { schema });

/**
 * Log system events to the database
 * @param level The log level (info, warning, error)
 * @param message The log message
 * @returns The created log entry
 */
export async function logSystemEvent(
  level: 'info' | 'warning' | 'error',
  message: string
): Promise<{ id: number; timestamp: Date }> {
  try {
    const [log] = await db
      .insert(systemLogs)
      .values({
        level,
        message,
        timestamp: new Date()
      })
      .returning({ id: systemLogs.id, timestamp: systemLogs.timestamp });
    
    return log;
  } catch (error) {
    // If we can't log to the database, log to console
    console.error('Failed to log system event to database:', error);
    console.log(`SYSTEM ${level.toUpperCase()}: ${message}`);
    
    // Return a dummy log entry
    return {
      id: -1,
      timestamp: new Date()
    };
  }
}