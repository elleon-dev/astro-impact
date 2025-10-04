import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";
import configs from "./configs.json";

// const hostName = window.location.hostname;

// const hostsProduction = ["astro-impact.vercel.app"];

// const currentEnvironment = includes(hostsProduction, hostName)
//   ? "production"
//   : "development";

const currentConfig = configs["development"];

firebase.initializeApp(currentConfig.firebaseApp);

const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();

firestore.settings({ ignoreUndefinedProperties: true, merge: true });
firestore.enablePersistence().then(() => console.log("Persistence enabled"));

const buckets = {
  default: storage,
};

Object.keys(currentConfig.buckets).forEach((bucketKey) => {
  buckets[bucketKey] = firebase.app().storage(currentConfig.buckets[bucketKey]);
});

const common = configs.common;

const { version, apiUrl, ipInfoApi } = currentConfig;

console.log("development", ":", version);

const imageResizes = ["300x90"];

export {
  currentConfig,
  firebase,
  version,
  common,
  auth,
  apiUrl,
  ipInfoApi,
  firestore,
  imageResizes,
  buckets,
};
