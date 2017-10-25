import { GoalTrafficLight } from './goal-misc';
import { History, HistoryDataPoint } from '../../misc/shapes/history';

export interface GoalHistoryDataPoint extends HistoryDataPoint {
  isInProgress?: boolean;              // If this is the most recent and is partway through the month. Setting this flag removes any guesswork needed.
  trafficLightStatus?: GoalTrafficLight;
}
