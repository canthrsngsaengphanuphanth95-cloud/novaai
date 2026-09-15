/**
 * Skill Usage Analytics and Statistics
 * Track and analyze skill usage patterns
 */

export interface UsageMetrics {
  skillId: string;
  skillName: string;
  usageCount: number;
  lastUsedAt: string;
  firstUsedAt: string;
  averageUsagePerDay: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface SkillAnalytics {
  totalUsage: number;
  averageUsagePerSkill: number;
  mostUsedSkills: UsageMetrics[];
  leastUsedSkills: UsageMetrics[];
  recentlyUsed: UsageMetrics[];
  usageByCategory: Record<string, number>;
  usageByTag: Record<string, number>;
  usageTrend: { date: string; count: number }[];
}

export interface SkillUsageRecord {
  skillId: string;
  timestamp: string;
  context?: string;
  result?: string;
}

const USAGE_STORAGE_KEY = 'novaai-skill-usage';

/**
 * Record skill usage
 */
export function recordSkillUsage(
  skillId: string,
  context?: string,
  result?: string
): SkillUsageRecord {
  const record: SkillUsageRecord = {
    skillId,
    timestamp: new Date().toISOString(),
    context,
    result,
  };

  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem(USAGE_STORAGE_KEY) || '[]');
      existing.push(record);
      // Keep only last 1000 records to avoid storage issues
      const limited = existing.slice(-1000);
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(limited));
    } catch (error) {
      console.error('Failed to record skill usage:', error);
    }
  }

  return record;
}

/**
 * Get usage records for a skill
 */
export function getSkillUsageRecords(skillId: string): SkillUsageRecord[] {
  if (typeof window === 'undefined') return [];

  try {
    const records = JSON.parse(localStorage.getItem(USAGE_STORAGE_KEY) || '[]');
    return records.filter((r: SkillUsageRecord) => r.skillId === skillId);
  } catch (error) {
    console.error('Failed to get usage records:', error);
    return [];
  }
}

/**
 * Calculate usage metrics for a skill
 */
export function calculateSkillMetrics(
  skillId: string,
  skillName: string,
  records: SkillUsageRecord[]
): UsageMetrics {
  const skillRecords = records.filter((r) => r.skillId === skillId);

  if (skillRecords.length === 0) {
    return {
      skillId,
      skillName,
      usageCount: 0,
      lastUsedAt: '',
      firstUsedAt: '',
      averageUsagePerDay: 0,
      trend: 'stable',
    };
  }

  const sortedByDate = [...skillRecords].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const lastUsedAt = sortedByDate[0].timestamp;
  const firstUsedAt = sortedByDate[sortedByDate.length - 1].timestamp;

  const daysDifference =
    (new Date(lastUsedAt).getTime() - new Date(firstUsedAt).getTime()) / (1000 * 60 * 60 * 24) + 1;

  const averageUsagePerDay = skillRecords.length / Math.max(daysDifference, 1);

  // Calculate trend
  const midpoint = Math.floor(skillRecords.length / 2);
  const firstHalf = skillRecords.slice(0, midpoint).length;
  const secondHalf = skillRecords.slice(midpoint).length;
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';

  if (secondHalf > firstHalf * 1.2) {
    trend = 'increasing';
  } else if (secondHalf < firstHalf * 0.8) {
    trend = 'decreasing';
  }

  return {
    skillId,
    skillName,
    usageCount: skillRecords.length,
    lastUsedAt,
    firstUsedAt,
    averageUsagePerDay,
    trend,
  };
}

/**
 * Get usage metrics for multiple skills
 */
export function getSkillMetrics(
  skillsMap: Map<string, string>, // skillId -> skillName
  records?: SkillUsageRecord[]
): UsageMetrics[] {
  if (typeof window === 'undefined') return [];

  try {
    const usageRecords = records || JSON.parse(localStorage.getItem(USAGE_STORAGE_KEY) || '[]');
    const metrics: UsageMetrics[] = [];

    skillsMap.forEach((skillName, skillId) => {
      const metric = calculateSkillMetrics(skillId, skillName, usageRecords);
      metrics.push(metric);
    });

    return metrics.sort((a, b) => b.usageCount - a.usageCount);
  } catch (error) {
    console.error('Failed to get skill metrics:', error);
    return [];
  }
}

/**
 * Calculate analytics for all skills
 */
export function calculateAnalytics(
  skillsMap: Map<string, { name: string; category: string; tags: string[] }>,
  records?: SkillUsageRecord[]
): SkillAnalytics {
  if (typeof window === 'undefined') {
    return {
      totalUsage: 0,
      averageUsagePerSkill: 0,
      mostUsedSkills: [],
      leastUsedSkills: [],
      recentlyUsed: [],
      usageByCategory: {},
      usageByTag: {},
      usageTrend: [],
    };
  }

  try {
    const usageRecords = records || JSON.parse(localStorage.getItem(USAGE_STORAGE_KEY) || '[]');

    // Get metrics for all skills
    const nameMap = new Map(
      Array.from(skillsMap.entries()).map(([id, data]) => [id, data.name])
    );
    const allMetrics = getSkillMetrics(nameMap, usageRecords);

    const totalUsage = usageRecords.length;
    const averageUsagePerSkill = allMetrics.length > 0 ? totalUsage / allMetrics.length : 0;

    // Most and least used
    const mostUsedSkills = allMetrics.filter((m) => m.usageCount > 0).slice(0, 10);
    const leastUsedSkills = allMetrics
      .filter((m) => m.usageCount > 0)
      .reverse()
      .slice(0, 10);

    // Recently used
    const recentlyUsed = allMetrics
      .filter((m) => m.lastUsedAt)
      .sort(
        (a, b) =>
          new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime()
      )
      .slice(0, 10);

    // Usage by category
    const usageByCategory: Record<string, number> = {};
    const usageByTag: Record<string, number> = {};

    skillsMap.forEach((data, skillId) => {
      const count = usageRecords.filter((r) => r.skillId === skillId).length;

      usageByCategory[data.category] = (usageByCategory[data.category] || 0) + count;

      data.tags.forEach((tag) => {
        usageByTag[tag] = (usageByTag[tag] || 0) + count;
      });
    });

    // Usage trend (last 30 days)
    const usageTrend: { date: string; count: number }[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      const count = usageRecords.filter((r) => r.timestamp.startsWith(dateString)).length;

      usageTrend.push({ date: dateString, count });
    }

    return {
      totalUsage,
      averageUsagePerSkill,
      mostUsedSkills,
      leastUsedSkills,
      recentlyUsed,
      usageByCategory,
      usageByTag,
      usageTrend,
    };
  } catch (error) {
    console.error('Failed to calculate analytics:', error);
    return {
      totalUsage: 0,
      averageUsagePerSkill: 0,
      mostUsedSkills: [],
      leastUsedSkills: [],
      recentlyUsed: [],
      usageByCategory: {},
      usageByTag: {},
      usageTrend: [],
    };
  }
}

/**
 * Clear usage history
 */
export function clearUsageHistory(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(USAGE_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear usage history:', error);
    }
  }
}

/**
 * Export usage data
 */
export function exportUsageData(): string {
  if (typeof window === 'undefined') return '{}';

  try {
    const records = JSON.parse(localStorage.getItem(USAGE_STORAGE_KEY) || '[]');
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        totalRecords: records.length,
        records,
      },
      null,
      2
    );
  } catch (error) {
    console.error('Failed to export usage data:', error);
    return '{}';
  }
}

/**
 * Get skills that haven't been used
 */
export function getUnusedSkills(
  allSkillIds: string[],
  records: SkillUsageRecord[]
): string[] {
  const usedSkillIds = new Set(records.map((r) => r.skillId));
  return allSkillIds.filter((id) => !usedSkillIds.has(id));
}

/**
 * Suggest skills to focus on based on usage patterns
 */
export function getSuggestionBasedOnUsage(analytics: SkillAnalytics): string[] {
  const suggestions: string[] = [];

  // Suggest reviewing unused skills
  if (analytics.leastUsedSkills.length > 0) {
    suggestions.push('Review and improve your least-used skills');
  }

  // Suggest focusing on declining skills
  const decliningSkills = analytics.mostUsedSkills
    .filter((m) => m.trend === 'decreasing')
    .slice(0, 3);

  if (decliningSkills.length > 0) {
    suggestions.push(`Focus on maintaining your skills: ${decliningSkills.map((s) => s.skillName).join(', ')}`);
  }

  // Suggest reinforcing trending skills
  const trendingSkills = analytics.mostUsedSkills
    .filter((m) => m.trend === 'increasing')
    .slice(0, 3);

  if (trendingSkills.length > 0) {
    suggestions.push(`Your trending skills: ${trendingSkills.map((s) => s.skillName).join(', ')}`);
  }

  return suggestions;
}
