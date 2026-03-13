/** Epley formula: estimated 1RM = weight × (1 + reps/30) */
export function estimatedOneRepMax(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  return weight * (1 + reps / 30)
}

/** Round to nearest increment (default 2.5 lbs) */
export function roundToIncrement(weight: number, increment: number = 2.5): number {
  return Math.round(weight / increment) * increment
}
