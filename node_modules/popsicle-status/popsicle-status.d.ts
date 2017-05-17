declare function popsicleStatus (): (response: any) => any;
declare function popsicleStatus (statusCode: number): (response: any) => any;
declare function popsicleStatus (lowerStatusCode: number, upperStatusCode: number): (response: any) => any;

export = popsicleStatus;
