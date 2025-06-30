import { 
  users, pairs, sessions, blocklists, messageMappings, activities, systemStats,
  type User, type InsertUser, type Pair, type InsertPair, 
  type Session, type InsertSession, type Blocklist, type InsertBlocklist,
  type Activity, type InsertActivity, type SystemStats
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private pairs: Map<number, Pair>;
  private sessions: Map<number, Session>;
  private blocklists: Map<number, Blocklist>;
  private activities: Map<number, Activity>;
  private systemStats: SystemStats;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.pairs = new Map();
    this.sessions = new Map();
    this.blocklists = new Map();
    this.activities = new Map();
    this.currentId = 1;
    
    // Initialize with default system stats
    this.systemStats = {
      id: 1,
      activePairs: 0,
      totalMessages: 0,
      blockedMessages: 0,
      activeSessions: 0,
      lastUpdated: new Date(),
    };

    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add sample sessions
    const session1: Session = {
      id: this.currentId++,
      name: "gold_session_1",
      phone: "+91xxxxxxxxxx",
      sessionFile: "gold_session_1.session",
      status: "active",
      lastActive: new Date(),
      createdAt: new Date(),
    };
    this.sessions.set(session1.id, session1);

    const session2: Session = {
      id: this.currentId++,
      name: "gold_session_2",
      phone: "+44xxxxxxxxxx",
      sessionFile: "gold_session_2.session", 
      status: "active",
      lastActive: new Date(),
      createdAt: new Date(),
    };
    this.sessions.set(session2.id, session2);

    // Add sample pairs
    const pair1: Pair = {
      id: this.currentId++,
      name: "GBPUSD",
      sourceChannel: "@vip_source_channel",
      discordWebhook: "https://discord.com/api/webhooks/123456789/abcdef",
      destinationChannel: "@client_channel",
      botToken: "123456:ABCDEF...",
      session: "gold_session_1",
      status: "active",
      enableAI: true,
      messageCount: 247,
      blockedCount: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.pairs.set(pair1.id, pair1);

    const pair2: Pair = {
      id: this.currentId++,
      name: "XAUUSD",
      sourceChannel: "@gold_signals_vip",
      discordWebhook: "https://discord.com/api/webhooks/987654321/fedcba",
      destinationChannel: "@gold_public",
      botToken: "654321:FEDCBA...",
      session: "gold_session_2",
      status: "paused",
      enableAI: false,
      messageCount: 189,
      blockedCount: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.pairs.set(pair2.id, pair2);

    // Add sample blocklists
    const blocklist1: Blocklist = {
      id: this.currentId++,
      type: "trap_pattern",
      value: "/ *",
      pairId: null, // Global
      isActive: true,
      createdAt: new Date(),
    };
    this.blocklists.set(blocklist1.id, blocklist1);

    const blocklist2: Blocklist = {
      id: this.currentId++,
      type: "word",
      value: "scam",
      pairId: null, // Global
      isActive: true,
      createdAt: new Date(),
    };
    this.blocklists.set(blocklist2.id, blocklist2);

    // Add sample activities
    const activity1: Activity = {
      id: this.currentId++,
      type: "message_forwarded",
      message: "Message forwarded: GBPUSD signal",
      details: "From @vip_source_channel → #trading-signals → @client_channel",
      pairId: pair1.id,
      sessionId: session1.id,
      severity: "success",
      createdAt: new Date(),
    };
    this.activities.set(activity1.id, activity1);

    const activity2: Activity = {
      id: this.currentId++,
      type: "trap_detected",
      message: "Trap detected and blocked",
      details: "XAUUSD pair - Message contained \"/ *\" pattern",
      pairId: pair2.id,
      sessionId: session2.id,
      severity: "warning",
      createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    };
    this.activities.set(activity2.id, activity2);

    // Update system stats
    this.systemStats = {
      id: 1,
      activePairs: Array.from(this.pairs.values()).filter(p => p.status === "active").length,
      totalMessages: Array.from(this.pairs.values()).reduce((sum, p) => sum + (p.messageCount || 0), 0),
      blockedMessages: Array.from(this.pairs.values()).reduce((sum, p) => sum + (p.blockedCount || 0), 0),
      activeSessions: Array.from(this.sessions.values()).filter(s => s.status === "active").length,
      lastUpdated: new Date(),
    };
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Pairs
  async getAllPairs(): Promise<Pair[]> {
    return Array.from(this.pairs.values());
  }

  async getPair(id: number): Promise<Pair | undefined> {
    return this.pairs.get(id);
  }

  async createPair(insertPair: InsertPair): Promise<Pair> {
    const id = this.currentId++;
    const pair: Pair = {
      ...insertPair,
      id,
      status: insertPair.status || "active",
      enableAI: insertPair.enableAI || false,
      messageCount: 0,
      blockedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.pairs.set(id, pair);
    await this.updateSystemStatsFromData();
    return pair;
  }

  async updatePair(id: number, updates: Partial<Pair>): Promise<Pair | undefined> {
    const pair = this.pairs.get(id);
    if (!pair) return undefined;
    
    const updatedPair = { ...pair, ...updates, updatedAt: new Date() };
    this.pairs.set(id, updatedPair);
    await this.updateSystemStatsFromData();
    return updatedPair;
  }

  async deletePair(id: number): Promise<boolean> {
    const deleted = this.pairs.delete(id);
    if (deleted) {
      await this.updateSystemStatsFromData();
    }
    return deleted;
  }

  // Sessions
  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }

  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async getSessionByName(name: string): Promise<Session | undefined> {
    return Array.from(this.sessions.values()).find(session => session.name === name);
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.currentId++;
    const session: Session = {
      ...insertSession,
      id,
      status: insertSession.status || "active",
      lastActive: new Date(),
      createdAt: new Date(),
    };
    this.sessions.set(id, session);
    await this.updateSystemStatsFromData();
    return session;
  }

  async updateSession(id: number, updates: Partial<Session>): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.sessions.set(id, updatedSession);
    await this.updateSystemStatsFromData();
    return updatedSession;
  }

  async deleteSession(id: number): Promise<boolean> {
    const deleted = this.sessions.delete(id);
    if (deleted) {
      await this.updateSystemStatsFromData();
    }
    return deleted;
  }

  // Blocklists
  async getAllBlocklists(): Promise<Blocklist[]> {
    return Array.from(this.blocklists.values());
  }

  async getBlocklistsByType(type: string): Promise<Blocklist[]> {
    return Array.from(this.blocklists.values()).filter(b => b.type === type);
  }

  async getGlobalBlocklists(): Promise<Blocklist[]> {
    return Array.from(this.blocklists.values()).filter(b => b.pairId === null);
  }

  async getPairBlocklists(pairId: number): Promise<Blocklist[]> {
    return Array.from(this.blocklists.values()).filter(b => b.pairId === pairId);
  }

  async createBlocklist(insertBlocklist: InsertBlocklist): Promise<Blocklist> {
    const id = this.currentId++;
    const blocklist: Blocklist = {
      ...insertBlocklist,
      id,
      pairId: insertBlocklist.pairId ?? null,
      isActive: insertBlocklist.isActive ?? true,
      createdAt: new Date(),
    };
    this.blocklists.set(id, blocklist);
    return blocklist;
  }

  async deleteBlocklist(id: number): Promise<boolean> {
    return this.blocklists.delete(id);
  }

  // Activities
  async getRecentActivities(limit: number = 50): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentId++;
    const activity: Activity = {
      ...insertActivity,
      id,
      pairId: insertActivity.pairId ?? null,
      sessionId: insertActivity.sessionId ?? null,
      details: insertActivity.details ?? null,
      severity: insertActivity.severity || "info",
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }

  // System Stats
  async getSystemStats(): Promise<SystemStats | undefined> {
    return this.systemStats;
  }

  async updateSystemStats(stats: Partial<SystemStats>): Promise<SystemStats> {
    this.systemStats = { ...this.systemStats, ...stats, lastUpdated: new Date() };
    return this.systemStats;
  }

  private async updateSystemStatsFromData(): Promise<void> {
    const activePairs = Array.from(this.pairs.values()).filter(p => p.status === "active").length;
    const totalMessages = Array.from(this.pairs.values()).reduce((sum, p) => sum + (p.messageCount || 0), 0);
    const blockedMessages = Array.from(this.pairs.values()).reduce((sum, p) => sum + (p.blockedCount || 0), 0);
    const activeSessions = Array.from(this.sessions.values()).filter(s => s.status === "active").length;

    this.systemStats = {
      ...this.systemStats,
      activePairs,
      totalMessages,
      blockedMessages,
      activeSessions,
      lastUpdated: new Date(),
    };
  }
}

export const storage = new MemStorage();
