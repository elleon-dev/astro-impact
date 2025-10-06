import { firestore } from "@/firebase";
import { fetchCollectionOnce, fetchDocumentOnce } from "../utils.ts";
import { updateDocument } from "../firestore.ts";

export const simulationsRef = firestore.collection("simulations");

export const addSimulation = (simulation) =>
  simulationsRef.doc(simulation.id).set(simulation);

export const getSimulationId = () => simulationsRef.doc().id;

export const fetchSimulation = async (id) =>
  fetchDocumentOnce(simulationsRef.doc(id));

export const fetchSimulations = async () =>
  fetchCollectionOnce(simulationsRef.where("isDeleted", "==", false));

export const updateSimulation = async (simulationId, simulation) =>
  updateDocument(simulationsRef.doc(simulationId), simulation);
