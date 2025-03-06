declare module 'openrouteservice-js' {
  export default class Openrouteservice {
    static Directions: new (options: { api_key: string }) => {
      calculate: (options: {
        coordinates: [number, number][];
        profile: string;
        format: string;
      }) => Promise<any>;
    };
  }
}
