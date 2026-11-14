import { FLIGHT_SCENARIOS } from '../constants/flightScenarios.js'
export function getScenario(name) { return FLIGHT_SCENARIOS[name] || FLIGHT_SCENARIOS.nominal }
