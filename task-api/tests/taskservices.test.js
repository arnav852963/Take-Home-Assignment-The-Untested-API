const taskService = require('../src/services/taskService');

const isIsoString = (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value));

describe('taskService', () => {



  beforeEach(() => {


	taskService._reset();

  });




  test('create() creates a task with defaults and required fields', () => {


	const task = taskService.create({ title: 'Test task' });

	expect(task).toEqual(


	  expect.objectContaining({

		id: expect.any(String),
		title: 'Test task',
		description: '',
		status: 'todo',
		priority: 'medium',
		dueDate: null,
		assignee: null,
		completedAt: null,
		createdAt: expect.any(String)


	  })

	);

	expect(isIsoString(task.createdAt)).toBe(true);
  });

	test('assignTask() stores a trimmed assignee and returns updated task', () => {
		const t1 = taskService.create({ title: 'A' });
		const updated = taskService.assignTask(t1.id, '  Alice  ');
		expect(updated).toEqual(
			expect.objectContaining({
				id: t1.id,
				assignee: 'Alice',
			})
		);

		expect(taskService.findById(t1.id)).toEqual(updated);
	});

  test('getAll() returns a copy of tasks', () => {




	const t1 = taskService.create({ title: 'A' });

	const t2 = taskService.create({ title: 'B' });

	const all = taskService.getAll();

	expect(all.map((t) => t.id)).toEqual([t1.id, t2.id]);

	all.pop();


	expect(taskService.getAll().length).toBe(2);



  });

  test('findById() returns the task when it exists and undefined when it does not', () => {


	const t1 = taskService.create({ title: 'A' });


	expect(taskService.findById(t1.id)).toEqual(t1);

	expect(taskService.findById('missing')).toBeUndefined();


  });

  test('update() updates fields and returns updated task', () => {


	const t1 = taskService.create({ title: 'A', priority: 'low' });



	const updated = taskService.update(t1.id, { title: 'A2', priority: 'high', dueDate: '2030-01-01T00:00:00.000Z' });



	expect(updated).toEqual(


	  expect.objectContaining({

		id: t1.id,
		title: 'A2',
		priority: 'high',
		dueDate: '2030-01-01T00:00:00.000Z'


	  })
	);


	expect(taskService.findById(t1.id)).toEqual(updated);
  });

  test('update() returns null when task does not exist', () => {


	expect(taskService.update('missing', { title: 'X' })).toBeNull();

  });

  test('remove() deletes a task and returns true; returns false if id does not exist', () => {

	const t1 = taskService.create({ title: 'A' });


	const t2 = taskService.create({ title: 'B' });

	expect(taskService.remove(t1.id)).toBe(true);


	expect(taskService.getAll().map((t) => t.id)).toEqual([t2.id]);

	expect(taskService.remove('missing')).toBe(false);

  });

  test('completeTask() marks task as done and sets completedAt', () => {


	const t1 = taskService.create({ title: 'A', priority: 'high' });


	const completed = taskService.completeTask(t1.id);

	expect(completed).toEqual(

	  expect.objectContaining({

		id: t1.id,
		status: 'done',
		completedAt: expect.any(String)

	  })
	);
	expect(isIsoString(completed.completedAt)).toBe(true);


	expect(taskService.findById(t1.id)).toEqual(completed);


  });



  test('completeTask() returns null when task does not exist', () => {



	expect(taskService.completeTask('missing')).toBeNull();


  });

  test('getByStatus() returns tasks matching a status', () => {


	const t1 = taskService.create({ title: 'A', status: 'todo' });

	const t2 = taskService.create({ title: 'B', status: 'in_progress' });

	const t3 = taskService.create({ title: 'C', status: 'done' });

	expect(taskService.getByStatus('todo').map((t) => t.id)).toEqual([t1.id]);


	expect(taskService.getByStatus('in_progress').map((t) => t.id)).toEqual([t2.id]);

	expect(taskService.getByStatus('done').map((t) => t.id)).toEqual([t3.id]);
  });

  test('getPaginated() returns a slice for page/limit', () => {

	const ids = [];

	for (let i = 0; i < 25; i++) ids.push(taskService.create({ title: `T${i}` }).id);


	const page1 = taskService.getPaginated(1, 10);

	const page2 = taskService.getPaginated(2, 10);

	expect(page1.length).toBe(10);

	expect(page2.length).toBe(10);

	expect(page1.map((t) => t.id)).toEqual(ids.slice(0, 10));
	expect(page2.map((t) => t.id)).toEqual(ids.slice(10, 20));

	const page3 = taskService.getPaginated(3, 10);
	expect(page3.length).toBe(5);
	expect(page3.map((t) => t.id)).toEqual(ids.slice(20, 25));
  });

  test('getStats() returns counts by status and overdue count', () => {


	const now = Date.now();

	const past = new Date(now - 60_000).toISOString();

	const future = new Date(now + 60_000).toISOString();



	taskService.create({ title: 'A', status: 'todo', dueDate: past });


	taskService.create({ title: 'B', status: 'todo', dueDate: future });


	taskService.create({ title: 'C', status: 'in_progress', dueDate: past });
	taskService.create({ title: 'D', status: 'done', dueDate: past });

	const stats = taskService.getStats();

	expect(stats).toEqual(


	  expect.objectContaining({
		todo: 2,
		in_progress: 1,
		done: 1,
		overdue: 2


	  })


	);


  });


});
