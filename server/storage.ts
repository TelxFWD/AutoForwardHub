import { 
  users, pairs, sessions, blocklists, messageMappings, activities, systemStats,
  type User, type InsertUser, type Pair, type InsertPair, 
  type Session, type InsertSession, type Blocklist, type InsertBlocklist,
  type Activity, type InsertActivity, type SystemStats
} from "@shared/schema";
import { db } from "./db";
import { eq, isNull, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Pairs
  getAllPairs(): Promise<Pair[]>;
  getPair(id: number): Promise<Pair | undefined>;
  createPair(pair: InsertPair): Promise<Pair>;
  updatePair(id: number, updates: Partial<Pair>): Promise<Pair | undefined>;
  deletePair(id: number): Promise<boolean>;

  // Sessions
  getAllSessions(): Promise<Session[]>;
  getSession(id: number): Promise<Session | undefined>;
  getSessionByName(name: string): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, updates: Partial<Session>): Promise<Session | undefined>;
  deleteSession(id: number): Promise<boolean>;

  // Blocklists
  getAllBlocklists(): Promise<Blocklist[]>;
  getBlocklistsByType(type: string): Promise<Blocklist[]>;
  getGlobalBlocklists(): Promise<Blocklist[]>;
  getPairBlocklists(pairId: number): Promise<Blocklist[]>;
  createBlocklist(blocklist: InsertBlocklist): Promise<Blocklist>;
  deleteBlocklist(id: number): Promise<boolean>;

  // Activities
  getRecentActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // System Stats
  getSystemStats(): Promise<SystemStats | undefined>;
  updateSystemStats(stats: Partial<SystemStats>): Promise<SystemStats>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Pairs
  async getAllPairs(): Promise<Pair[]> {
    return await db.select().from(pairs);
  }

  async getPair(id: number): Promise<Pair | undefined> {
    const [pair] = await db.select().from(pairs).where(eq(pairs.id, id));
    return pair || undefined;
  }

  async createPair(insertPair: InsertPair): Promise<Pair> {
    const [pair] = await db
      .insert(pairs)
      .values(insertPair)
      .returning();
    
    await this.updateSystemStatsFromData();
    return pair;
  }

  async updatePair(id: number, updates: Partial<Pair>): Promise<Pair | undefined> {
    const [pair] = await db
      .update(pairs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pairs.id, id))
      .returning();
    
    if (pair) {
      await this.updateSystemStatsFromData();
    }
    return pair || undefined;
  }

  async deletePair(id: number): Promise<boolean> {
    const result = await db.delete(pairs).where(eq(pairs.id, id));
    const deleted = (result.rowCount ?? 0) > 0;
    
    if (deleted) {
      await this.updateSystemStatsFromData();
    }
    return deleted;
  }

  // Sessions
  async getAllSessions(): Promise<Session[]> {
    return await db.select().from(sessions);
  }

  async getSession(id: number): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session || undefined;
  }

  async getSessionByName(name: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.name, name));
    return session || undefined;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values(insertSession)
      .returning();
    
    await this.updateSystemStatsFromData();
    return session;
  }

  async updateSession(id: number, updates: Partial<Session>): Promise<Session | undefined> {
    const [session] = await db
      .update(sessions)
      .set(updates)
      .where(eq(sessions.id, id))
      .returning();
    
    if (session) {
      await this.updateSystemStatsFromData();
    }
    return session || undefined;
  }

  async deleteSession(id: number): Promise<boolean> {
    const result = await db.delete(sessions).where(eq(sessions.id, id));
    const deleted = (result.rowCount ?? 0) > 0;
    
    if (deleted) {
      await this.updateSystemStatsFromData();
    }
    return deleted;
  }

  // Blocklists
  async getAllBlocklists(): Promise<Blocklist[]> {
    return await db.select().from(blocklists);
  }

  async getBlocklistsByType(type: string): Promise<Blocklist[]> {
    return await db.select().from(blocklists).where(eq(blocklists.type, type));
  }

  async getGlobalBlocklists(): Promise<Blocklist[]> {
    return await db.select().from(blocklists).where(isNull(blocklists.pairId));
  }

  async getPairBlocklists(pairId: number): Promise<Blocklist[]> {
    return await db.select().from(blocklists).where(eq(blocklists.pairId, pairId));
  }

  async createBlocklist(insertBlocklist: InsertBlocklist): Promise<Blocklist> {
    const [blocklist] = await db
      .insert(blocklists)
      .values(insertBlocklist)
      .returning();
    return blocklist;
  }

  async deleteBlocklist(id: number): Promise<boolean> {
    const result = await db.delete(blocklists).where(eq(blocklists.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Activities
  async getRecentActivities(limit: number = 50): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();
    return activity;
  }

  // System Stats
  async getSystemStats(): Promise<SystemStats | undefined> {
    const [stats] = await db.select().from(systemStats).limit(1);
    if (!stats) {
      // Create initial stats if none exist
      return await this.updateSystemStatsFromData();
    }
    return stats;
  }

  async updateSystemStats(stats: Partial<SystemStats>): Promise<SystemStats> {
    const existing = await db.select().from(systemStats).limit(1);
    
    if (existing.length === 0) {
      const [newStats] = await db
        .insert(systemStats)
        .values({ ...stats, lastUpdated: new Date() })
        .returning();
      return newStats;
    } else {
      const [updatedStats] = await db
        .update(systemStats)
        .set({ ...stats, lastUpdated: new Date() })
        .where(eq(systemStats.id, existing[0].id))
        .returning();
      return updatedStats;
    }
  }

  private async updateSystemStatsFromData(): Promise<SystemStats> {
    const allPairs = await db.select().from(pairs);
    const allSessions = await db.select().from(sessions);
    
    const activePairs = allPairs.filter(p => p.status === "active").length;
    const totalMessages = allPairs.reduce((sum, p) => sum + (p.messageCount || 0), 0);
    const blockedMessages = allPairs.reduce((sum, p) => sum + (p.blockedCount || 0), 0);
    const activeSessions = allSessions.filter(s => s.status === "active").length;

    return await this.updateSystemStats({
      activePairs,
      totalMessages,
      blockedMessages,
      activeSessions,
    });
  }
}

export const storage = new DatabaseStorage();
