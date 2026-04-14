const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('Task API', () => {


  beforeEach(() => {


    taskService._reset();


  });

  test('GET /tasks returns an empty list initially', async () => {


    const res = await request(app).get('/tasks');

    expect(res.status).toBe(200);

    expect(res.body).toEqual([]);


  });

  test('POST /tasks creates a task and returns it', async () => {


    const res = await request(app)


      .post('/tasks')


      .send({ title: 'My Task', description: 'Desc', priority: 'high' });



    expect(res.status).toBe(201);


    expect(res.body).toEqual(


      expect.objectContaining({


        id: expect.any(String),
        title: 'My Task',
        description: 'Desc',
        status: 'todo',
        priority: 'high',
        dueDate: null,
		assignee: null,
        completedAt: null,
        createdAt: expect.any(String)


      })


    );


  });

  test('POST /tasks returns 400 for invalid payload', async () => {


    const res = await request(app).post('/tasks').send({ title: '   ' });


    expect(res.status).toBe(400);


    expect(res.body).toEqual(


      expect.objectContaining({


        error: expect.any(String)



      })


    );


  });

  test('GET /tasks?status=todo filters by status', async () => {


    const t1 = await request(app).post('/tasks').send({ title: 'A', status: 'todo' });


    const t2 = await request(app).post('/tasks').send({ title: 'B', status: 'in_progress' });

    expect(t1.status).toBeDefined();


    expect(t2.status).toBeDefined();

    const res = await request(app).get('/tasks').query({ status: 'todo' });


    expect(res.status).toBe(200);



    expect(res.body.map((t) => t.title)).toEqual(['A']);


  });

  test('GET /tasks?page=1&limit=10 returns a paginated list', async () => {


    for (let i = 0; i < 25; i++) {


      await request(app).post('/tasks').send({ title: `T${i}` });

    }


    const res = await request(app).get('/tasks').query({ page: 1, limit: 10 });


    expect(res.status).toBe(200);


    expect(Array.isArray(res.body)).toBe(true);


    expect(res.body.length).toBe(10);

    expect(res.body.map((t) => t.title)).toEqual(Array.from({ length: 10 }, (_, i) => `T${i}`));

    const res2 = await request(app).get('/tasks').query({ page: 2, limit: 10 });
    expect(res2.status).toBe(200);
    expect(res2.body.length).toBe(10);
    expect(res2.body.map((t) => t.title)).toEqual(Array.from({ length: 10 }, (_, i) => `T${i + 10}`));





  });

  test('PUT /tasks/:id updates a task', async () => {



    const created = await request(app).post('/tasks').send({ title: 'To update', priority: 'low' });

    const id = created.body.id;

    const res = await request(app).put(`/tasks/${id}`).send({ title: 'Updated', priority: 'high' });


    expect(res.status).toBe(200);

    expect(res.body).toEqual(

      expect.objectContaining({

        id,
        title: 'Updated',
        priority: 'high'


      })


    );

  });

  test('PUT /tasks/:id returns 404 when task does not exist', async () => {


    const res = await request(app).put('/tasks/missing').send({ title: 'Updated' });


    expect(res.status).toBe(404);


    expect(res.body).toEqual({ error: 'Task not found' });




  });



  test('DELETE /tasks/:id deletes a task', async () => {



    const created = await request(app).post('/tasks').send({ title: 'To delete' });

    const id = created.body.id;

    const delRes = await request(app).delete(`/tasks/${id}`);


    expect(delRes.status).toBe(204);

    const listRes = await request(app).get('/tasks');


    expect(listRes.status).toBe(200);


    expect(listRes.body).toEqual([]);


  });

  test('DELETE /tasks/:id returns 404 when task does not exist', async () => {


    const res = await request(app).delete('/tasks/missing');


    expect(res.status).toBe(404);


    expect(res.body).toEqual({ error: 'Task not found' });


  });

  test('PATCH /tasks/:id/complete marks a task as complete', async () => {



    const created = await request(app).post('/tasks').send({ title: 'To complete', priority: 'high' });


    const id = created.body.id;

    const res = await request(app).patch(`/tasks/${id}/complete`);



    expect(res.status).toBe(200);



    expect(res.body).toEqual(

      expect.objectContaining({

        id,
        status: 'done',
        completedAt: expect.any(String)



      })


    );



  });

  test('PATCH /tasks/:id/complete returns 404 when task does not exist', async () => {


    const res = await request(app).patch('/tasks/missing/complete');


    expect(res.status).toBe(404);


    expect(res.body).toEqual({ error: 'Task not found' });


  });

  test('PATCH /tasks/:id/assign assigns a task to a person and returns updated task', async () => {
    const created = await request(app).post('/tasks').send({ title: 'To assign' });
    const id = created.body.id;

    const res = await request(app).patch(`/tasks/${id}/assign`).send({ assignee: 'Alice' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        id,
        assignee: 'Alice',
      })
    );
  });

  test('PATCH /tasks/:id/assign returns 400 for empty assignee', async () => {
    const created = await request(app).post('/tasks').send({ title: 'To assign' });
    const id = created.body.id;

    const res = await request(app).patch(`/tasks/${id}/assign`).send({ assignee: '   ' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: expect.any(String),
      })
    );
  });

  test('PATCH /tasks/:id/assign returns 404 when task does not exist', async () => {
    const res = await request(app).patch('/tasks/missing/assign').send({ assignee: 'Alice' });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Task not found' });
  });

  test('PATCH /tasks/:id/assign allows re-assigning (overwrites assignee)', async () => {
    const created = await request(app).post('/tasks').send({ title: 'To assign' });
    const id = created.body.id;

    await request(app).patch(`/tasks/${id}/assign`).send({ assignee: 'Alice' });
    const res = await request(app).patch(`/tasks/${id}/assign`).send({ assignee: 'Bob' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        id,
        assignee: 'Bob',
      })
    );
  });

  test('GET /tasks/stats returns counts by status and overdue count', async () => {


    const past = new Date(Date.now() - 60_000).toISOString();


    const future = new Date(Date.now() + 60_000).toISOString();



    await request(app).post('/tasks').send({ title: 'A', status: 'todo', dueDate: past });


    await request(app).post('/tasks').send({ title: 'B', status: 'todo', dueDate: future });


    await request(app).post('/tasks').send({ title: 'C', status: 'in_progress', dueDate: past });


    await request(app).post('/tasks').send({ title: 'D', status: 'done', dueDate: past });

    const res = await request(app).get('/tasks/stats');


    expect(res.status).toBe(200);


    expect(res.body).toEqual(


      expect.objectContaining({

        todo: expect.any(Number),
        in_progress: expect.any(Number),
        done: expect.any(Number),
        overdue: expect.any(Number)



      })


    );

  });


});

