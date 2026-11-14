/**
 * Gravitational physics acceleration constants
 */
export function getGravitationalField(environmentMode) {
  switch (environmentMode) {
    case 'lunar_base':
      return { g: 0.166, label: 'Lunar Surface (0.166G)' }
    case 'mars_eva':
      return { g: 0.38, label: 'Mars Surface (0.38G)' }
    case 'spacecraft':
    default:
      return { g: 0.0, label: 'Deep Space Transit (0.0G)' }
  }
}
