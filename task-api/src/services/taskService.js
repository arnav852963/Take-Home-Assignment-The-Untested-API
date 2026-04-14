const { v4: uuidv4 } = require('uuid');

let tasks = [];

const getAll = () => [...tasks];

const findById = (id) => tasks.find((t) => t.id === id);

const getByStatus = (status) => tasks.filter((t) => t.status.includes(status));

const getPaginated = (page, limit) => {


  const pageNum = Number.isFinite(page) ? page : parseInt(page, 10); // just validating that its number if not , then parsing it to number



  const limitNum = Number.isFinite(limit) ? limit : parseInt(limit, 10);// same with limit

  const safePage = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1; //if page is not valid or not an expected value , redirecting it to page default 1


  const safeLimit = Number.isFinite(limitNum) && limitNum > 0 ? limitNum : 10; // similarly with limit , if its not valid or not an expected value , redirecting it to default 10

  const offset = (safePage - 1) * safeLimit; // fixed this , before it was (page - 1) * limit which is wrong because page and limit can be non number or invalid , so we need to use the safePage and safeLimit instead


  return tasks.slice(offset, offset + safeLimit);

};

const getStats = () => {


  const now = new Date();


  const counts = { todo: 0, in_progress: 0, done: 0 };


  let overdue = 0;

  tasks.forEach((t) => {

    if (counts[t.status] !== undefined) counts[t.status]++;

    if (t.dueDate && t.status !== 'done' && new Date(t.dueDate) < now) {

      overdue++;

    }


  });

  return { ...counts, overdue };



};

const create = ({ title, description = '', status = 'todo', priority = 'medium', dueDate = null, assignee = null }) => {


  const task = {


    id: uuidv4(),
    title,
    description,
    status,
    priority,
    dueDate,
    assignee,
    completedAt: null,
    createdAt: new Date().toISOString()


  };


  tasks.push(task);


  return task;


};

const update = (id, fields) => {


  const index = tasks.findIndex((t) => t.id === id);


  if (index === -1) return null;

  const updated = { ...tasks[index], ...fields };


  tasks[index] = updated;


  return updated;
};

const remove = (id) => {


  const index = tasks.findIndex((t) => t.id === id);


  if (index === -1) return false;



  tasks.splice(index, 1);


  return true;




};

const completeTask = (id) => {


  const task = findById(id);


  if (!task) return null;

  const updated = {

    ...task,
    priority: 'medium',
    status: 'done',
    completedAt: new Date().toISOString()


  };

  const index = tasks.findIndex((t) => t.id === id);


  tasks[index] = updated;


  return updated;



};

const assignTask = (id, assignee) => {


  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) return null;

  const trimmed = typeof assignee === 'string' ? assignee.trim() : assignee;


  const updated = { ...tasks[index], assignee: trimmed };


  tasks[index] = updated;
  return updated;


};

const _reset = () => {

  tasks = [];
};

module.exports = {
  getAll,
  findById,
  getByStatus,
  getPaginated,
  getStats,
  create,
  update,
  remove,
  completeTask,
  assignTask,
  _reset,
};
