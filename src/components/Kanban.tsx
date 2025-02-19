import React, { useState } from 'react';
import './Kanban.css';
import { Task } from '../types/Tasks';

interface KanbanBoardProps {
  tasks: Task[];
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks: initialTasks }) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [relativeNow, setRelNow] = useState(new Date);

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  return (
    <div className='kanban-board' data-set='stuff'>
      <button onClick={() => setRelNow(new Date())}>update Now</button>
      <fieldset className='container' data-state='todo'>
        <legend>Todo</legend>
        <div className='container-cards'>
          {tasks.map((task) => {
            if (task?.completedAt) {
              return null;
            }
            return (
              <KanbanCard key={task.id} task={task} onUpdate={handleTaskUpdate} relativeNow={relativeNow} />
            );
          })}
        </div>
      </fieldset>
      <fieldset className='container' data-state='done'>
        <legend>Done</legend>
        <div className='container-cards'>
          {tasks.map((task) => {
            if (!task?.completedAt || task?.completedAt == null) {
              return null;
            }
            return (
              <KanbanCard key={task.id} task={task} onUpdate={handleTaskUpdate} relativeNow={relativeNow} />
            );
          })}
        </div>
      </fieldset>
    </div>
  );
};

export default KanbanBoard;

interface KanbanCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  relativeNow: Date;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, onUpdate, relativeNow }) => {
  const isDone = task?.completedAt instanceof Date;

  const handleCompleteToggleButtonClick = () => {
    const updatedTask = {
      ...task,
      completedAt: isDone ? undefined : new Date(),
    };
    // TODO, use the .reset data to calculate this properly
    if (updatedTask.completedAt instanceof Date) {
      const resetAt = new Date(updatedTask.completedAt);

      if (task.reset) {
        // not all resets are always "the next day",
        // we can check this by looking at task.reset.period.
        // for items marked as 'daily', use the next day (or same day, based on time)
        // for items marked as 'weekly', find the next day that is that day stored in the .day value (which is 3 letter version of the day)

        const resetHour = parseInt(task.reset!.time.substring(0, 2), 10);
        const resetMinute = parseInt(task.reset!.time.substring(2, 4), 10);
        resetAt.setUTCHours(resetHour, resetMinute, 0, 0);

        if (task.reset!.period === 'daily') {
          if (relativeNow.getUTCHours() < resetHour || (relativeNow.getUTCHours() === resetHour && relativeNow.getUTCMinutes() < resetMinute)) {
            resetAt.setUTCDate(updatedTask.completedAt.getUTCDate());
          } else {
            resetAt.setUTCDate(updatedTask.completedAt.getUTCDate() + 1);
          }
        } else if (task.reset!.period === 'weekly') {
          const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
          const currentDayIndex = relativeNow.getUTCDay();
          const resetDayIndex = daysOfWeek.indexOf(task.reset!.day!);
          let daysUntilReset = resetDayIndex - currentDayIndex;

          if (daysUntilReset < 0 || (daysUntilReset === 0 && (relativeNow.getUTCHours() > resetHour || (relativeNow.getUTCHours() === resetHour && relativeNow.getUTCMinutes() >= resetMinute)))) {
            daysUntilReset += 7;
          }

          resetAt.setUTCDate(updatedTask.completedAt.getUTCDate() + daysUntilReset);
        }
      }

      updatedTask.resetAt = resetAt;
    } else {
      updatedTask.resetAt = undefined;
    }
    onUpdate(updatedTask);
  };

  return (
    <div className='kanban-card' key={task.id} data-id={task.id}>
      <div className='card-title'>{task.title}</div>
      <div className='task-id'>{task.id_short}</div>
      <pre>{JSON.stringify(task, (key, value) => {
        if (['id', 'id_short', 'title'].includes(key)) {
          return undefined;
        }
        // eslint-disable-next-line
        return value;
      }, 2)}</pre>
      <hr />
      {isDone ? (
        <>
          <div className='completed'>
            Completed: <span className='timestamp'>{task.completedAt!.toString()}</span><br />
            Reset At: <span className='timestamp'>{task.resetAt!.toString()}</span><br />
            Reset in: <span className='timestamp'>{calculateRelativeTime(task.resetAt!, relativeNow)}</span>
          </div>
          <button onClick={handleCompleteToggleButtonClick}>un-do</button>
        </>
      ) : (
        <button onClick={handleCompleteToggleButtonClick}>mark as done</button>
      )}
    </div>
  );
};

interface CalculateRelativeTimeProps {
  resetAt: Date;
  relativeNow?: Date;
}

function calculateRelativeTime(
  resetAt: CalculateRelativeTimeProps['resetAt'],
  relativeNow: CalculateRelativeTimeProps['relativeNow'] = new Date()
): string {
  const now = relativeNow;
  const diff = resetAt.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) {
    return `${days} days, ${hours} h, ${minutes} m`;
  } else {
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    } else {
      if (minutes === 0) {
        return "<1m";
      } else {
        return `${minutes} m`;
      }
    }
  }
}