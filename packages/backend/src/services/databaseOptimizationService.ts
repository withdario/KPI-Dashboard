import { PrismaClient } from '@prisma/client';
import DatabaseMonitoringService from './databaseMonitoringService';
import PerformanceMonitoringService from './performanceMonitoringService';

export interface QueryAnalysis {
  id: string;
  query: string;
  executionTime: number;
  frequency: number;
  tableScans: boolean;
  indexUsage: string[];
  optimizationScore: number;
  recommendations: string[];
  estimatedImprovement: number;
}

export interface IndexRecommendation {
  id: string;
  table: string;
  columns: string[];
  type: 'single' | 'composite' | 'partial' | 'covering';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedImprovement: number;
  creationSQL: string;
  status: 'pending' | 'implementing' | 'completed' | 'failed';
  implementedAt?: Date;
  performanceImpact?: number;
}

export interface QueryOptimization {
  id: string;
  originalQuery: string;
  optimizedQuery: string;
  optimizationType: 'rewrite' | 'parameterization' | 'subquery_elimination' | 'join_optimization';
  estimatedImprovement: number;
  status: 'pending' | 'implementing' | 'completed' | 'failed';
  implementedAt?: Date;
  performanceImpact?: number;
}

export interface CacheStrategy {
  id: string;
  target: 'query_results' | 'api_responses' | 'static_data' | 'session_data';
  strategy: 'ttl' | 'lru' | 'write_through' | 'write_behind';
  ttl: number; // seconds
  maxSize: number; // MB
  invalidationRules: string[];
  status: 'pending' | 'implementing' | 'completed' | 'failed';
  implementedAt?: Date;
  hitRate?: number;
}

export class DatabaseOptimizationService {
  private prisma: PrismaClient;
  private databaseService: DatabaseMonitoringService;
  private performanceService: PerformanceMonitoringService;
  private queryAnalyses: QueryAnalysis[] = [];
  private indexRecommendations: IndexRecommendation[] = [];
  private queryOptimizations: QueryOptimization[] = [];
  private cacheStrategies: CacheStrategy[] = [];

  constructor(
    prisma: PrismaClient,
    databaseService: DatabaseMonitoringService,
    performanceService: PerformanceMonitoringService
  ) {
    this.prisma = prisma;
    this.databaseService = databaseService;
    this.performanceService = performanceService;
  }

  // Analyze database queries for optimization opportunities
  async analyzeQueries(): Promise<QueryAnalysis[]> {
    const slowQueries = await this.databaseService.getSlowQueries();
    const queryPatterns = await this.databaseService.getQueryPatterns();
    
    const analyses: QueryAnalysis[] = [];
    
    // Analyze slow queries
    for (const query of slowQueries) {
      const analysis = this.analyzeQuery(query);
      if (analysis) {
        analyses.push(analysis);
      }
    }
    
    // Analyze query patterns for frequency-based optimizations
    for (const pattern of queryPatterns) {
      const analysis = this.analyzeQueryPattern(pattern);
      if (analysis) {
        analyses.push(analysis);
      }
    }
    
    // Sort by optimization score (highest first)
    analyses.sort((a, b) => b.optimizationScore - a.optimizationScore);
    
    this.queryAnalyses = analyses;
    return analyses;
  }

  private analyzeQuery(query: any): QueryAnalysis | null {
    if (!query.query || !query.executionTime) return null;
    
    const sql = query.query.toLowerCase();
    const executionTime = query.executionTime;
    
    // Analyze query characteristics
    const tableScans = this.detectTableScans(sql);
    const indexUsage = this.detectIndexUsage(sql);
    const optimizationScore = this.calculateOptimizationScore(sql, executionTime, tableScans);
    const recommendations = this.generateQueryRecommendations(sql, tableScans, indexUsage);
    const estimatedImprovement = this.estimateQueryImprovement(executionTime, optimizationScore);
    
    return {
      id: this.generateId(),
      query: query.query,
      executionTime,
      frequency: query.frequency || 1,
      tableScans,
      indexUsage,
      optimizationScore,
      recommendations,
      estimatedImprovement
    };
  }

  private analyzeQueryPattern(pattern: any): QueryAnalysis | null {
    if (!pattern.query || !pattern.avgExecutionTime) return null;
    
    const sql = pattern.query.toLowerCase();
    const executionTime = pattern.avgExecutionTime;
    const frequency = pattern.count || 1;
    
    // Analyze pattern characteristics
    const tableScans = this.detectTableScans(sql);
    const indexUsage = this.detectIndexUsage(sql);
    const optimizationScore = this.calculateOptimizationScore(sql, executionTime, tableScans, frequency);
    const recommendations = this.generateQueryRecommendations(sql, tableScans, indexUsage);
    const estimatedImprovement = this.estimateQueryImprovement(executionTime, optimizationScore, frequency);
    
    return {
      id: this.generateId(),
      query: pattern.query,
      executionTime,
      frequency,
      tableScans,
      indexUsage,
      optimizationScore,
      recommendations,
      estimatedImprovement
    };
  }

  private detectTableScans(sql: string): boolean {
    // Detect potential table scans
    const tableScanIndicators = [
      'where column like \'%value%\'', // Leading wildcard
      'where column != value', // Inequality on non-indexed columns
      'where function(column)', // Function on column
      'where column + 1 = value', // Expression on column
      'order by column', // Order by without index
      'group by column' // Group by without index
    ];
    
    return tableScanIndicators.some(indicator => sql.includes(indicator));
  }

  private detectIndexUsage(sql: string): string[] {
    const indexes: string[] = [];
    
    // Detect potential index usage
    if (sql.includes('where id =')) indexes.push('primary_key');
    if (sql.includes('where email =')) indexes.push('email_index');
    if (sql.includes('where created_at >')) indexes.push('created_at_index');
    if (sql.includes('where status =')) indexes.push('status_index');
    if (sql.includes('where user_id =')) indexes.push('user_id_index');
    
    return indexes;
  }

  private calculateOptimizationScore(sql: string, executionTime: number, tableScans: boolean, frequency: number = 1): number {
    let score = 0;
    
    // Base score on execution time
    if (executionTime > 1000) score += 40; // Critical
    else if (executionTime > 500) score += 30; // High
    else if (executionTime > 100) score += 20; // Medium
    else if (executionTime > 50) score += 10; // Low
    
    // Penalize table scans
    if (tableScans) score += 25;
    
    // Bonus for high frequency queries
    if (frequency > 100) score += 15;
    else if (frequency > 50) score += 10;
    else if (frequency > 10) score += 5;
    
    // Penalize complex queries
    if (sql.includes('select *')) score += 10;
    if (sql.includes('distinct')) score += 5;
    if (sql.includes('union')) score += 5;
    if (sql.includes('subquery')) score += 10;
    
    return Math.min(score, 100); // Cap at 100
  }

  private generateQueryRecommendations(sql: string, tableScans: boolean, indexUsage: string[]): string[] {
    const recommendations: string[] = [];
    
    if (tableScans) {
      recommendations.push('Add appropriate indexes to eliminate table scans');
      recommendations.push('Rewrite query to use indexed columns in WHERE clause');
    }
    
    if (sql.includes('select *')) {
      recommendations.push('Replace SELECT * with specific column names');
      recommendations.push('Consider covering indexes for frequently accessed columns');
    }
    
    if (sql.includes('like \'%value%\'') || sql.includes('like \'%value\'')) {
      recommendations.push('Avoid leading wildcards in LIKE clauses');
      recommendations.push('Consider full-text search for text-based queries');
    }
    
    if (sql.includes('distinct')) {
      recommendations.push('Evaluate if DISTINCT is necessary');
      recommendations.push('Consider using GROUP BY instead if appropriate');
    }
    
    if (sql.includes('order by') && !indexUsage.length) {
      recommendations.push('Add indexes for ORDER BY columns');
      recommendations.push('Consider composite indexes for WHERE + ORDER BY');
    }
    
    if (sql.includes('group by') && !indexUsage.length) {
      recommendations.push('Add indexes for GROUP BY columns');
      recommendations.push('Consider composite indexes for WHERE + GROUP BY');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Query appears to be well-optimized');
    }
    
    return recommendations;
  }

  private estimateQueryImprovement(executionTime: number, optimizationScore: number, frequency: number = 1): number {
    // Estimate improvement based on score and frequency
    let improvement = 0;
    
    if (optimizationScore >= 80) improvement = 70; // Critical optimizations
    else if (optimizationScore >= 60) improvement = 50; // High optimizations
    else if (optimizationScore >= 40) improvement = 30; // Medium optimizations
    else if (optimizationScore >= 20) improvement = 15; // Low optimizations
    
    // Adjust for frequency
    if (frequency > 100) improvement *= 1.2;
    else if (frequency > 50) improvement *= 1.1;
    
    return Math.min(improvement, 90); // Cap at 90%
  }

  // Generate index recommendations based on query analysis
  async generateIndexRecommendations(): Promise<IndexRecommendation[]> {
    const analyses = this.queryAnalyses.length > 0 ? this.queryAnalyses : await this.analyzeQueries();
    const recommendations: IndexRecommendation[] = [];
    
    for (const analysis of analyses) {
      if (analysis.tableScans || analysis.optimizationScore > 50) {
        const indexRecs = this.generateIndexesForQuery(analysis);
        recommendations.push(...indexRecs);
      }
    }
    
    // Remove duplicates and sort by priority
    const uniqueRecommendations = this.deduplicateIndexRecommendations(recommendations);
    uniqueRecommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    this.indexRecommendations = uniqueRecommendations;
    return uniqueRecommendations;
  }

  private generateIndexesForQuery(analysis: QueryAnalysis): IndexRecommendation[] {
    const recommendations: IndexRecommendation[] = [];
    const sql = analysis.query.toLowerCase();
    
    // Extract table and column information from query
    const tableMatch = sql.match(/from\s+(\w+)/);
    const whereMatch = sql.match(/where\s+([^order\s]+)/);
    
    if (tableMatch && whereMatch) {
      const table = tableMatch[1];
      const whereClause = whereMatch[1];
      
      // Extract columns from WHERE clause
      const columns = this.extractColumnsFromWhereClause(whereClause);
      
      if (columns.length > 0) {
        // Single column index
        if (columns.length === 1) {
          recommendations.push({
            id: this.generateId(),
            table,
            columns: [columns[0]],
            type: 'single',
            priority: analysis.optimizationScore > 70 ? 'critical' : 'high',
            estimatedImprovement: analysis.estimatedImprovement,
            creationSQL: `CREATE INDEX idx_${table}_${columns[0]} ON ${table}(${columns[0]});`,
            status: 'pending'
          });
        }
        
        // Composite index for multiple columns
        if (columns.length > 1) {
          recommendations.push({
            id: this.generateId(),
            table,
            columns,
            type: 'composite',
            priority: analysis.optimizationScore > 70 ? 'critical' : 'high',
            estimatedImprovement: analysis.estimatedImprovement,
            creationSQL: `CREATE INDEX idx_${table}_${columns.join('_')} ON ${table}(${columns.join(', ')});`,
            status: 'pending'
          });
        }
        
        // Covering index if SELECT * is used
        if (sql.includes('select *')) {
          const coveringColumns = [...columns, 'id']; // Include primary key
          recommendations.push({
            id: this.generateId(),
            table,
            columns: coveringColumns,
            type: 'covering',
            priority: 'medium',
            estimatedImprovement: analysis.estimatedImprovement * 0.8,
            creationSQL: `CREATE INDEX idx_${table}_covering_${columns.join('_')} ON ${table}(${coveringColumns.join(', ')});`,
            status: 'pending'
          });
        }
      }
    }
    
    return recommendations;
  }

  private extractColumnsFromWhereClause(whereClause: string): string[] {
    const columns: string[] = [];
    
    // Extract column names from WHERE clause
    const columnMatches = whereClause.match(/(\w+)\s*[=<>!]/g);
    if (columnMatches) {
      for (const match of columnMatches) {
        const column = match.replace(/[=<>!].*/, '').trim();
        if (column && !columns.includes(column)) {
          columns.push(column);
        }
      }
    }
    
    return columns;
  }

  private deduplicateIndexRecommendations(recommendations: IndexRecommendation[]): IndexRecommendation[] {
    const unique: IndexRecommendation[] = [];
    const seen = new Set<string>();
    
    for (const rec of recommendations) {
      const key = `${rec.table}_${rec.columns.join('_')}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(rec);
      }
    }
    
    return unique;
  }

  // Generate query optimization recommendations
  async generateQueryOptimizations(): Promise<QueryOptimization[]> {
    const analyses = this.queryAnalyses.length > 0 ? this.queryAnalyses : await this.analyzeQueries();
    const optimizations: QueryOptimization[] = [];
    
    for (const analysis of analyses) {
      if (analysis.optimizationScore > 30) {
        const optimization = this.optimizeQuery(analysis);
        if (optimization) {
          optimizations.push(optimization);
        }
      }
    }
    
    // Sort by estimated improvement
    optimizations.sort((a, b) => b.estimatedImprovement - a.estimatedImprovement);
    
    this.queryOptimizations = optimizations;
    return optimizations;
  }

  private optimizeQuery(analysis: QueryAnalysis): QueryOptimization | null {
    const sql = analysis.query.toLowerCase();
    let optimizedQuery = analysis.query;
    let optimizationType: QueryOptimization['optimizationType'] = 'rewrite';
    let estimatedImprovement = analysis.estimatedImprovement;
    
    // Apply various optimization techniques
    if (sql.includes('select *')) {
      optimizedQuery = this.optimizeSelectStar(analysis.query);
      optimizationType = 'rewrite';
      estimatedImprovement += 10;
    }
    
    if (sql.includes('like \'%value%\'') || sql.includes('like \'%value\'')) {
      optimizedQuery = this.optimizeLikeClause(analysis.query);
      optimizationType = 'rewrite';
      estimatedImprovement += 15;
    }
    
    if (sql.includes('distinct')) {
      optimizedQuery = this.optimizeDistinct(analysis.query);
      optimizationType = 'rewrite';
      estimatedImprovement += 20;
    }
    
    if (sql.includes('subquery')) {
      optimizedQuery = this.optimizeSubqueries(analysis.query);
      optimizationType = 'subquery_elimination';
      estimatedImprovement += 25;
    }
    
    // Only return if there's a meaningful optimization
    if (optimizedQuery !== analysis.query) {
      return {
        id: this.generateId(),
        originalQuery: analysis.query,
        optimizedQuery,
        optimizationType,
        estimatedImprovement: Math.min(estimatedImprovement, 90),
        status: 'pending'
      };
    }
    
    return null;
  }

  private optimizeSelectStar(originalQuery: string): string {
    // Replace SELECT * with specific columns
    // This is a simplified example - in practice, you'd analyze the table schema
    return originalQuery.replace(/select \*/i, 'SELECT id, name, email, created_at');
  }

  private optimizeLikeClause(originalQuery: string): string {
    // Replace leading wildcards with more efficient patterns
    return originalQuery.replace(/like '%([^']+)'/gi, 'LIKE \'$1%\'');
  }

  private optimizeDistinct(originalQuery: string): string {
    // Replace DISTINCT with GROUP BY when appropriate
    return originalQuery.replace(/distinct/i, 'GROUP BY');
  }

  private optimizeSubqueries(originalQuery: string): string {
    // Replace subqueries with JOINs when possible
    // This is a simplified example
    return originalQuery.replace(/where id in \(select user_id from orders\)/gi, 
      'JOIN orders ON users.id = orders.user_id');
  }

  // Generate caching strategies
  async generateCacheStrategies(): Promise<CacheStrategy[]> {
    const analyses = this.queryAnalyses.length > 0 ? this.queryAnalyses : await this.analyzeQueries();
    const strategies: CacheStrategy[] = [];
    
    // Query result caching for slow, frequent queries
    const slowFrequentQueries = analyses.filter(a => a.executionTime > 100 && a.frequency > 10);
    if (slowFrequentQueries.length > 0) {
      strategies.push({
        id: this.generateId(),
        target: 'query_results',
        strategy: 'ttl',
        ttl: 300, // 5 minutes
        maxSize: 100, // 100 MB
        invalidationRules: ['on_table_update', 'on_schema_change'],
        status: 'pending'
      });
    }
    
    // API response caching for read-heavy endpoints
    strategies.push({
      id: this.generateId(),
      target: 'api_responses',
      strategy: 'ttl',
      ttl: 60, // 1 minute
      maxSize: 50, // 50 MB
      invalidationRules: ['on_data_change', 'on_user_action'],
      status: 'pending'
    });
    
    // Static data caching for reference data
    strategies.push({
      id: this.generateId(),
      target: 'static_data',
      strategy: 'ttl',
      ttl: 3600, // 1 hour
      maxSize: 25, // 25 MB
      invalidationRules: ['on_schedule', 'on_admin_action'],
      status: 'pending'
    });
    
    // Session data caching
    strategies.push({
      id: this.generateId(),
      target: 'session_data',
      strategy: 'lru',
      ttl: 1800, // 30 minutes
      maxSize: 75, // 75 MB
      invalidationRules: ['on_logout', 'on_timeout'],
      status: 'pending'
    });
    
    this.cacheStrategies = strategies;
    return strategies;
  }

  // Execute index creation
  async executeIndexCreation(indexId: string): Promise<boolean> {
    const recommendation = this.indexRecommendations.find(r => r.id === indexId);
    if (!recommendation || recommendation.status !== 'pending') {
      throw new Error('Invalid index recommendation or already processed');
    }
    
    try {
      recommendation.status = 'implementing';
      
      // Execute the CREATE INDEX statement
      await this.prisma.$executeRawUnsafe(recommendation.creationSQL);
      
      // Update status
      recommendation.status = 'completed';
      recommendation.implementedAt = new Date();
      
      // Measure performance impact
      const beforeMetrics = await this.measureQueryPerformance(recommendation);
      const afterMetrics = await this.measureQueryPerformance(recommendation);
      
      recommendation.performanceImpact = ((beforeMetrics - afterMetrics) / beforeMetrics) * 100;
      
      return true;
    } catch (error) {
      recommendation.status = 'failed';
      throw error;
    }
  }

  private async measureQueryPerformance(recommendation: IndexRecommendation): Promise<number> {
    // Simulate performance measurement
    // In practice, you'd run the actual queries and measure execution time
    return Math.random() * 100 + 50; // 50-150ms
  }

  // Get optimization status
  getOptimizationStatus(): Record<string, any> {
    const pendingIndexes = this.indexRecommendations.filter(r => r.status === 'pending');
    const completedIndexes = this.indexRecommendations.filter(r => r.status === 'completed');
    const failedIndexes = this.indexRecommendations.filter(r => r.status === 'failed');
    
    const pendingQueries = this.queryOptimizations.filter(q => q.status === 'pending');
    const completedQueries = this.queryOptimizations.filter(q => q.status === 'completed');
    const failedQueries = this.queryOptimizations.filter(q => q.status === 'failed');
    
    const pendingCaches = this.cacheStrategies.filter(c => c.status === 'pending');
    const completedCaches = this.cacheStrategies.filter(c => c.status === 'completed');
    const failedCaches = this.cacheStrategies.filter(c => c.status === 'failed');
    
    return {
      summary: {
        totalOptimizations: this.indexRecommendations.length + this.queryOptimizations.length + this.cacheStrategies.length,
        pending: pendingIndexes.length + pendingQueries.length + pendingCaches.length,
        completed: completedIndexes.length + completedQueries.length + completedCaches.length,
        failed: failedIndexes.length + failedQueries.length + failedCaches.length,
        successRate: this.calculateSuccessRate()
      },
      breakdown: {
        indexes: {
          total: this.indexRecommendations.length,
          pending: pendingIndexes.length,
          completed: completedIndexes.length,
          failed: failedIndexes.length
        },
        queries: {
          total: this.queryOptimizations.length,
          pending: pendingQueries.length,
          completed: completedQueries.length,
          failed: failedQueries.length
        },
        caching: {
          total: this.cacheStrategies.length,
          pending: pendingCaches.length,
          completed: completedCaches.length,
          failed: failedCaches.length
        }
      },
      recentAnalyses: this.queryAnalyses.slice(-5),
      topRecommendations: this.indexRecommendations
        .filter(r => r.status === 'pending')
        .sort((a, b) => b.priority.localeCompare(a.priority))
        .slice(-5)
    };
  }

  private calculateSuccessRate(): number {
    const total = this.indexRecommendations.length + this.queryOptimizations.length + this.cacheStrategies.length;
    const completed = this.indexRecommendations.filter(r => r.status === 'completed').length +
                     this.queryOptimizations.filter(q => q.status === 'completed').length +
                     this.cacheStrategies.filter(c => c.status === 'completed').length;
    
    return total > 0 ? (completed / total) * 100 : 100;
  }

  // Get all data
  getQueryAnalyses(): QueryAnalysis[] {
    return this.queryAnalyses;
  }

  getIndexRecommendations(): IndexRecommendation[] {
    return this.indexRecommendations;
  }

  getQueryOptimizations(): QueryOptimization[] {
    return this.queryOptimizations;
  }

  getCacheStrategies(): CacheStrategy[] {
    return this.cacheStrategies;
  }

  // Generate unique ID
  private generateId(): string {
    return `db_opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default DatabaseOptimizationService;
