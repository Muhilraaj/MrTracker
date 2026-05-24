import moment from 'moment';
import type { Action } from '../types/types';

const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;

const getDateFromObjectId = (id: string): string | null => {
  if (!OBJECT_ID_PATTERN.test(id)) {
    return null;
  }
  const timestamp = parseInt(id.substring(0, 8), 16) * 1000;
  return moment.utc(timestamp).format('YYYY-MM-DD');
};

/** First date the action should appear in trackers. */
export const getActionActiveFromDateKey = (action: Action): string => {
  if (action.activeFromDate) {
    return moment.utc(action.activeFromDate).format('YYYY-MM-DD');
  }
  if (action.createdDate) {
    return moment.utc(action.createdDate).format('YYYY-MM-DD');
  }
  return getDateFromObjectId(action.id) ?? '1970-01-01';
};

export const isActionVisibleOnDate = (action: Action, dateKey: string): boolean =>
  getActionActiveFromDateKey(action) <= dateKey;

export const formatActiveFromDateForRequest = (action: Action): string =>
  getActionActiveFromDateKey(action);

/** Status value for calendar cells before the action is active. */
export const ACTION_NOT_APPLICABLE_STATUS = 0;
