import { useMemo, useState } from 'react';
import moment from 'moment';
import { useGetActionsQuery } from '../stores/api/action';
import { useGetEventsQuery } from '../stores/api/event';
import {
  ACTION_NOT_APPLICABLE_STATUS,
  getActionActiveFromDateKey,
  isActionVisibleOnDate,
} from '../utils/actionDate';

export interface MonthlyRow {
  actionId: string;
  prompt: string;
  sequence: number;
  priority: boolean;
  active: boolean;
  cells: Record<string, number>;
}

export const useMonthlyEventGrid = () => {
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(new Date());

  const monthKey = moment(selectedMonth ?? new Date()).format('YYYY-MM');

  const monthStart = moment.utc(monthKey, 'YYYY-MM').startOf('month');

  const monthEnd = monthStart.clone().endOf('month');

  const dateKeys = useMemo(() => {
    const start = moment.utc(monthKey, 'YYYY-MM').startOf('month');
    return Array.from({ length: start.daysInMonth() }, (_, i) =>
      start.clone().add(i, 'days').format('YYYY-MM-DD')
    );
  }, [monthKey]);

  const { data: actions, isLoading: isLoadingActions } = useGetActionsQuery();
  const { data: events, isLoading: isLoadingEvents } = useGetEventsQuery({
    startDate: monthStart.toISOString(),
    endDate: monthEnd.toISOString(),
  });

  const rows = useMemo<MonthlyRow[]>(() => {
    if (!actions || dateKeys.length === 0) return [];

    const monthEndKey = dateKeys[dateKeys.length - 1];

    const actionHasEventInMonth = (actionId: string) =>
      dateKeys.some((dateKey) =>
        (events?.[dateKey] ?? []).some((event) => event.actionId === actionId)
      );

    const visibleActions = actions.filter((action) => {
      if (getActionActiveFromDateKey(action) > monthEndKey) {
        return false;
      }
      if (action.active) {
        return true;
      }
      return actionHasEventInMonth(action.id);
    });

    return visibleActions
      .sort((a, b) => {
        const priorityDiff = Number(b.priority ?? false) - Number(a.priority ?? false);
        if (priorityDiff !== 0) return priorityDiff;
        return a.sequence - b.sequence;
      })
      .map((action) => {
      const cells: Record<string, number> = {};
      for (const dateKey of dateKeys) {
        if (!isActionVisibleOnDate(action, dateKey)) {
          cells[dateKey] = ACTION_NOT_APPLICABLE_STATUS;
          continue;
        }
        const dayEvents = events?.[dateKey] ?? [];
        const match = dayEvents.find((event) => event.actionId === action.id);
        cells[dateKey] = match?.status ?? 20;
      }
      return {
        actionId: action.id,
        prompt: action.prompt,
        sequence: action.sequence,
        priority: action.priority ?? false,
        active: action.active ?? true,
        cells,
      };
    });
  }, [actions, events, dateKeys]);

  const goToPreviousMonth = () => {
    setSelectedMonth(monthStart.clone().subtract(1, 'month').toDate());
  };

  const goToNextMonth = () => {
    setSelectedMonth(monthStart.clone().add(1, 'month').toDate());
  };

  return {
    selectedMonth,
    setSelectedMonth,
    monthStart,
    monthEnd,
    dateKeys,
    rows,
    isLoading: isLoadingActions || isLoadingEvents,
    goToPreviousMonth,
    goToNextMonth,
  };
};
