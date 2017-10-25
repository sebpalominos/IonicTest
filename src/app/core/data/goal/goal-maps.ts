import { GoalResponseValues } from './goal-response';
import { GoalProsePrompt } from '../../../screens/goal-centre/shared/goal-prose-prompt.model';
import { GoalAction, GoalCallToAction } from '../../../screens/goal-centre/shared/goal-action.model';
import { GoalType } from '../../../screens/goal-centre/shared/goal-type.model';

// Used as the map for a 'continuous' scenario i.e. post
// then retrieve another goal straight away
export type GoalProseContinuation = {
  complete: boolean;
  next: GoalProsePrompt;
};

export type GoalActionCollection = {
  progress: GoalResponseValues.OverallProgress;
  callToAction: GoalCallToAction;
  actions: GoalAction[];
  typeHeader?: GoalType;
};
