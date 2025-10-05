interface Config {
  development: ConfigEnvironment;
  production: ConfigEnvironment;
}

interface ConfigEnvironment {
  version: string;
  firebaseApp: FirebaseApp;
  buckets: Buckets;
  apiUrl: string;
}

interface FirebaseApp {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

interface Buckets {
  photos: string;
  publicUrl: string;
}

export const config: Config = {
  development: {
    version: "0.0.1",
    firebaseApp: {
      apiKey: "AIzaSyA_PHHDRf8X0ahhews1ivVf6eYKYAeI6mA",
      authDomain: "astro-impact.firebaseapp.com",
      projectId: "astro-impact",
      storageBucket: "astro-impact.firebasestorage.app",
      messagingSenderId: "536461787391",
      appId: "1:536461787391:web:da0c8a5e533c84bec38cca",
      measurementId: "G-BLMYY8H73W",
    },
    buckets: {
      photos: "_",
      publicUrl: "-",
    },
    apiUrl: "https://api-astro-impact.web.app",
  },
  production: {
    version: "0.0.1",
    firebaseApp: {
      apiKey: "AIzaSyA_PHHDRf8X0ahhews1ivVf6eYKYAeI6mA",
      authDomain: "astro-impact.firebaseapp.com",
      projectId: "astro-impact",
      storageBucket: "astro-impact.firebasestorage.app",
      messagingSenderId: "536461787391",
      appId: "1:536461787391:web:da0c8a5e533c84bec38cca",
      measurementId: "G-BLMYY8H73W",
    },
    buckets: {
      photos: "_",
      publicUrl: "-",
    },
    apiUrl: "https://api-astro-impact.web.app",
  },
};
