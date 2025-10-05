import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";
import { currentConfig } from "@/config";

firebase.initializeApp(currentConfig.firebaseApp);

const firestore = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();
const version = currentConfig.version;

firestore.settings({ ignoreUndefinedProperties: true });

export { firebase, firestore, storage, auth, version };
