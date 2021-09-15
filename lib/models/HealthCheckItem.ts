import { Status } from "./enums/Status";

export class HealthCheckItem {

  name: string;
  status: string;
  details: string;
  properties: JSON;
  descriptionHref: string;

  constructor(jsonstring: string) {
    try {
      const jsonValue = JSON.parse(jsonstring);
      this.name = jsonValue.name;
      this.status = jsonValue.status;
      this.details = jsonValue.details;
      this.properties = jsonValue.properties;
      this.descriptionHref = jsonValue.descriptionHref;
    } catch (error) {
      console.warn(`Failed to parse Health Check Item. ${error.stack}`)
    }
  }
  get isValid(): boolean {
    return !!(this.name && this.status);
  };

  public setHealthStatus = (status: Status, details) => {
    this.status = Status[status];
    this.details = details;
  }

}
