import { getScenario } from './scenarioEngine.js'
if (!getScenario('nominal')) throw new Error('Failed')
console.log('Scenario engine test passed')
