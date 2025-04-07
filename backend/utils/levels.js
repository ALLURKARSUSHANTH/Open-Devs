const LEVEL_THRESHOLDS = {
    beginner: 0,
    intermediate: 1000,
    advanced: 5000,
    expert: 15000,
    master: 30000
  };
  
  const POINT_RULES = {
    postCreated: 50,
    postLiked: 5,
    commentAdded: 10,
    connectionMade: 30,
    dailyLogin: 20,
    skillVerified: 100,
    menteeAccepted: 75,
    mentorRating: 20
  };
  
  const getCurrentLevel = (points) => {
    if (points >= LEVEL_THRESHOLDS.master) return 'master';
    if (points >= LEVEL_THRESHOLDS.expert) return 'expert';
    if (points >= LEVEL_THRESHOLDS.advanced) return 'advanced';
    if (points >= LEVEL_THRESHOLDS.intermediate) return 'intermediate';
    return 'beginner';
  };
  
  module.exports = {
    LEVEL_THRESHOLDS,
    POINT_RULES,
    getCurrentLevel
  };