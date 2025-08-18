// workflows/fallbackUtils.js

export function generateContextualFallback(objective, context) {
  const fallback = [];

  if (objective.toLowerCase().includes("market")) {
    fallback.push({
      id: 1,
      title: "Which market segment should we target?",
      description: "Define ideal regional or customer verticals.",
      options: ["Enterprise", "SMB", "Mixed"]
    });
  }

  fallback.push({
    id: 2,
    title: "What resource allocation model should we use?",
    description: "Budget, people, and technology spread.",
    options: ["Lean startup", "Heavy upfront", "Hybrid"]
  });

  fallback.push({
    id: 3,
    title: "What timeline should we commit to?",
    description: "Aggressive vs conservative deployment plans.",
    options: ["3 months", "6 months", "Flexible"]
  });

  return fallback;
}