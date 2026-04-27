const Issue = require('../models/Issues') ;

exports.getScore = async (department) =>{
  const total    = await Issue.countDocuments({ department });
  const resolved = await Issue.countDocuments({ department, status: 'Resolved' });

  const avgResult = await Issue.aggregate([
    { $match: { department, status: 'Resolved', resolvedAt: { $exists: true } } },
    { $project: {
        days: { $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 86400000] }
    }},
    { $group: { _id: null, avg: { $avg: '$days' } } }
  ]);

  if (total === 0) return 0;

  const resolutionRate = (resolved / total) * 100;
  const avgDays        = avgResult[0]?.avg ?? 30;
  const speedScore     = Math.max(0, 100 - (avgDays * 5));

  // 70% weight on resolution rate, 30% on speed
  return Math.round((resolutionRate * 0.7) + (speedScore * 0.3));
}