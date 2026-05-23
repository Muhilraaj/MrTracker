import { useMemo, useState } from 'react';
import moment from 'moment';
import { useGetActionsQuery } from '../stores/api/action';
import { useGetEventsQuery } from '../stores/api/event';

export interface MonthlyRow {
  actionId: string;
  prompt: string;
  sequence: number;
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

  const { data: actions, isLoading: isLoadingActions } = useGetActionsQuery({ active: true });
  const { data: events, isLoading: isLoadingEvents } = useGetEventsQuery({
    startDate: monthStart.toISOString(),
    endDate: monthEnd.toISOString(),
  });

  const rows = useMemo<MonthlyRow[]>(() => {
    if (!actions) return [];

    return actions.map((action) => {
      const cells: Record<string, number> = {};
      for (const dateKey of dateKeys) {
        const dayEvents = events?.[dateKey] ?? [];
        const match = dayEvents.find((event) => event.actionId === action.id);
        cells[dateKey] = match?.status ?? 20;
      }
      return {
        actionId: action.id,
        prompt: action.prompt,
        sequence: action.sequence,
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
