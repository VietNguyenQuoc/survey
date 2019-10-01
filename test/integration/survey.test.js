let server;
const request = require('supertest');
const mongoose = require('mongoose');
const { User } = require('../../models/user');
const { Survey } = require('../../models/survey');
const { Submission } = require('../../models/submission');

describe('/api/survey', () => {
  const admin = new User({
    email: "123@gmail.com",
    password: "11111111",
    isAdmin: true
  });
  const tokenAdmin = admin.generateAuthToken();

  const user = new User({
    email: "456@gmail.com",
    password: "11111111"
  });

  let tokenUser = user.generateAuthToken();

  beforeEach(async () => {
    server = require('../../index').server;
  });

  afterEach(async () => {
    await Survey.deleteMany({});
    await Submission.deleteMany({});
    await server.close();
  });

  describe('GET /', () => {
    it('should return 200', async () => {
      const res = await request(server)
        .get('/api/survey')
        .set("x-auth-token", tokenAdmin);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /:id', () => {
    let id;

    const exec = () => {
      return request(server)
        .get(`/api/survey/${id}`)
        .set("x-auth-token", tokenAdmin);
    }

    it('should return 404 if survey is not found.', async () => {
      id = new mongoose.Types.ObjectId();
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 200 if survey is found and returned.', async () => {
      const survey = new Survey({
        eventCode: "111111",
        startTime: Date.now(),
        endTime: Date.now()
      });
      await survey.save();

      id = survey._id;
      const res = await exec();

      expect(res.status).toBe(200);
    });

  });

  describe('GET /participant/:eventCode', () => {
    let eventCode;

    const exec = () => {
      return request(server)
        .get(`/api/survey/participant/${eventCode}`)
        .set("x-auth-token", tokenUser);
    }
    it('should return 404 if survey is not found.', async () => {
      eventCode = '111111';
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.text).toMatch('not found');
    });

    it('should return 400 if survey is not running.', async () => {
      eventCode = '111111';

      const survey = new Survey({
        eventCode,
        startTime: Date.now() + 1000000, /* 1000 second from now */
        endTime: Date.now() + 2000000
      });
      await survey.save();

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 200 if survey is running and survey is returned.', async () => {
      eventCode = '111111';

      const survey = new Survey({
        eventCode,
        startTime: Date.now() - 1000000,
        endTime: Date.now() + 1000000
      });
      await survey.save();

      const res = await exec();

      expect(res.status).toBe(200);
    });

  });

  describe('POST /', () => {
    let body;

    const exec = () => {
      return request(server)
        .post(`/api/survey`)
        .set("x-auth-token", tokenAdmin)
        .send(body);
    }

    it('should return 400 if questions are not inputted', async () => {
      body = {
        startTime: Date.now(),
        endTime: Date.now()
      }

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.text).toMatch('required');
    });

    it('should return 400 if questions less than 1 item', async () => {
      body = {
        questions: [],
        startTime: Date.now(),
        endTime: Date.now()
      }

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.text).toMatch('1');
    });

    it('should return 400 if questions are more than 20 items.', async () => {
      body = {
        questions: Array(21).fill('a'),
        startTime: Date.now(),
        endTime: Date.now()
      }

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.text).toMatch('20');
    });

    it('should return 400 if startTime is not inputted.', async () => {
      body = {
        questions: Array(2).fill('a'),
        endTime: Date.now()
      }

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.text).toMatch('required');
    });

    it('should return 400 if endTime is not inputted.', async () => {
      body = {
        questions: Array(2).fill('a'),
        startTime: Date.now()
      }

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.text).toMatch('required');
    });

    it('should return 200 if sumitted survey is valid.', async () => {
      body = {
        questions: [
          {
            question: 'a',
            answers: [
              { desc: 'a', score: 1 }
            ]
          }
        ],
        startTime: Date.now(),
        endTime: Date.now()
      }

      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('questions');
    });
  });

  describe('POST /submit', () => {
    let body;

    const exec = () => {
      return request(server)
        .post(`/api/survey/submit`)
        .set("x-auth-token", tokenUser)
        .send(body);
    }

    it('should return 400 if userId is not inputed', async () => {
      body = {
        eventCode: '111111',
        answer: [new mongoose.Types.ObjectId()]
      }

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.text).toMatch('required');
    });

    it('should return 400 if userId is not valid ObjectId', async () => {
      body = {
        userId: '1',
        eventCode: '111111',
        answer: [new mongoose.Types.ObjectId()]
      }

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.text).toMatch('id');
    });

    it('should return 400 if eventCode is not inputed.', async () => {
      body = {
        userId: new mongoose.Types.ObjectId(),
        answer: [new mongoose.Types.ObjectId()]
      }

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.text).toMatch('required');

    });

    it('should return 400 if eventCode is not 6 characters.', async () => {
      body = {
        userId: new mongoose.Types.ObjectId(),
        answer: [new mongoose.Types.ObjectId()],
        eventCode: '1'
      }

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.text).toMatch('6');

    });

    it('should return 400 if answer consists at least 1 non-ObjectId item', async () => {
      body = {
        userId: new mongoose.Types.ObjectId(),
        answer: [new mongoose.Types.ObjectId(), '1'],
        eventCode: '111111'
      }

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.text).toMatch('id');
    });

    it('should return 400 if answer consists at least 1 non-ObjectId item', async () => {
      body = {
        userId: new mongoose.Types.ObjectId(),
        answer: [new mongoose.Types.ObjectId(), '1'],
        eventCode: '111111'
      }

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.text).toMatch('id');
    });

    it('should return 400 when the survey is not running.', async () => {
      const survey = new Survey({
        eventCode: '111111',
        startTime: Date.now() + 1000000,
        endTime: Date.now() + 2000000
      });

      await survey.save();

      body = {
        userId: new mongoose.Types.ObjectId(),
        answer: [new mongoose.Types.ObjectId()],
        eventCode: '111111'
      }

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 200 when the survey is running and submission returned.', async () => {
      const survey = new Survey({
        eventCode: '111111',
        questions: [
          {
            question: 'a',
            answers: [{ desc: 'a', score: 1 }]
          }
        ],
        startTime: Date.now() - 1000000,
        endTime: Date.now() + 1000000
      });

      await survey.save();

      body = {
        userId: new mongoose.Types.ObjectId(),
        answer: [survey.questions[0].answers[0]._id.toString()],
        eventCode: '111111'
      }

      const res = await exec();

      expect(res.status).toBe(200);
    });
  });

  describe('PUT /:id', () => {
    let id;
    let body;

    const exec = () => {
      return request(server)
        .put(`/api/survey/${id}`)
        .set("x-auth-token", tokenAdmin)
        .send(body);
    }

    it('should return 404 if the survey is not found.', async () => {
      const survey = new Survey({
        eventCode: "111111",
        startTime: Date.now(),
        endTime: Date.now()
      });

      await survey.save();
      id = new mongoose.Types.ObjectId();
      body = {
        questions: [
          {
            question: 'a',
            answers: [
              { desc: 'a', score: 1 }
            ]
          }
        ],
        startTime: Date.now(),
        endTime: Date.now()
      }

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 400 if the survey is started.', async () => {
      const survey = new Survey({
        eventCode: "111111",
        startTime: Date.now() - 1000000,
        endTime: Date.now() + 1000000
      });

      await survey.save();

      id = survey._id;

      body = {
        questions: [
          {
            question: 'a',
            answers: [
              { desc: 'a', score: 1 }
            ]
          }
        ],
        startTime: Date.now(),
        endTime: Date.now()
      }

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.text).toMatch('started')
    });

    it('should return 200 if the update is valid.', async () => {
      const survey = new Survey({
        eventCode: "111111",
        startTime: Date.now() + 1000000,
        endTime: Date.now() + 2000000
      });

      await survey.save();

      id = survey._id;

      body = {
        questions: [
          {
            question: 'a',
            answers: [
              { desc: 'a', score: 1 }
            ]
          }
        ],
        startTime: Date.now(),
        endTime: Date.now()
      }

      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('questions');
    });
  });

  describe('DEL /:id', () => {
    let id;

    const exec = () => {
      return request(server)
        .delete(`/api/survey/${id}`)
        .set("x-auth-token", tokenAdmin);
    };

    it('should return 404 when the survey is not found.', async () => {
      const survey = new Survey({
        eventCode: "111111",
        startTime: Date.now(),
        endTime: Date.now()
      });

      await survey.save();

      id = new mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 400 when the survey is started.', async () => {
      const survey = new Survey({
        eventCode: "111111",
        startTime: Date.now() - 1000000,
        endTime: Date.now() + 1000000
      });

      await survey.save();

      id = survey._id;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 200 when the delete request is valid.', async () => {
      const survey = new Survey({
        eventCode: "111111",
        startTime: Date.now() + 1000000,
        endTime: Date.now() + 2000000
      });

      await survey.save();

      id = survey._id;

      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('eventCode')
    });
  });
});