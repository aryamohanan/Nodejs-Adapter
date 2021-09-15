import { HealthCheckItem } from "./HealthCheckItem";

describe('When a health check object created', () => {
  describe('and parameters are valid', () => {
    const testCases = ['{"name":"Kafka connection","status":"green","details":"Successfully connected to Kafka","properties":{}}'];
    it.each(testCases)('parses it correctly', (testCase) => {
      const result = new HealthCheckItem(testCase);
      expect(result.isValid).toBeTruthy();
    })
  });
  describe('and data are invalid', () => {
    const testCases = ["test", undefined, "", null, "1"];
    it.each(testCases)('fails gracefully', (testCase) => {
      let result = new HealthCheckItem(testCase);
      expect(result.isValid).toBeFalsy();
    })
  })
})
