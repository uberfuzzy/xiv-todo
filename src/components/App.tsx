import './App.css'
import CryptoJS from 'crypto-js';

import { Task } from '../types/Tasks';
import KanbanBoard from './Kanban';

const tasks: Task[] = [
  { id: "", title: 'Expert Roulette', reset: { period: 'daily', time: "1500" } },
  { id: "", title: 'Alliance Roulette', reset: { period: 'daily', time: "1500" } },
  { id: "", title: 'Raid Coin', reset: { period: 'weekly', day: 'tue', time: "0800" } },
  { id: "", title: 'Grand Company exports', reset: { period: 'daily', time: "2000" } },
  // { id: "", title: 'Task 5' }
];

const generateId = (task: Omit<Task, 'id'>): string => {
  const hash = CryptoJS.SHA256(JSON.stringify(task));
  return hash.toString(CryptoJS.enc.Hex);
};

tasks.forEach(task => {
  task.id = generateId(task);
  task.id_short = `${task.id.slice(0, 3)}…${task.id.slice(-4)}`;
});

const App = () => {

  return (
    <>
      <div className='header'>
        <h1>Todo<sup style={{ fontFamily: 'monospace' }}>XIV</sup></h1>
      </div>
      <div className='body'>
        <KanbanBoard tasks={tasks} />
      </div >
      <div className='footer'>
        this is the footer
      </div>
    </>

  );
};

export default App;