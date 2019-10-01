const { Survey } = require('../../models/survey');

describe('test the model of the Survey schema', () => {
  beforeEach(async () => {
    server = require('../../index').server;
  });

  afterEach(async () => {
    await Survey.deleteMany({});
    await server.close();
  });

  describe('STATIC: Survey.isRunning()', () => {
    it('should return false when the current time is out of the survey timeframe.', async () => {
      const eventCode = '111111';
      const survey = new Survey({
        eventCode,
        questions: [],
        startTime: Date.now() + 1000000,
        endTime: Date.now() + 2000000
      });

      await survey.save();

      const isRunning = await Survey.isRunning(eventCode);
      expect(isRunning).toBeFalsy();
    });

    it('should return true when the current time is within timeframe.', async () => {
      const eventCode = '111111';
      const survey = new Survey({
        eventCode,
        questions: [],
        startTime: Date.now() - 1000000,
        endTime: Date.now() + 1000000
      });

      await survey.save();

      const isRunning = await Survey.isRunning(eventCode);
      expect(isRunning).toBeTruthy();
    });
  });

  describe('STATIC: Survey.isStarted', () => {
    it('should return false when the current time is before the start time.', async () => {
      const eventCode = '111111';
      const survey = new Survey({
        eventCode,
        questions: [],
        startTime: Date.now() + 1000000,
        endTime: Date.now() + 2000000
      });

      await survey.save();

      const isRunning = await Survey.isRunning(eventCode);
      expect(isRunning).toBeFalsy();
    });

    it('should return true when the current time is within timeframe.', async () => {
      const eventCode = '111111';
      const survey = new Survey({
        eventCode,
        questions: [],
        startTime: Date.now() - 1000000,
        endTime: Date.now() + 1000000
      });

      await survey.save();

      const isRunning = await Survey.isRunning(eventCode);
      expect(isRunning).toBeTruthy();
    });

    it('should return true when the current time is later than the end time.', async () => {
      const eventCode = '111111';
      const survey = new Survey({
        eventCode,
        questions: [],
        startTime: Date.now() - 1000000,
        endTime: Date.now() + 1000000
      });

      await survey.save();

      const isRunning = await Survey.isRunning(eventCode);
      expect(isRunning).toBeTruthy();
    });
  });
});
