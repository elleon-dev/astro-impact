import { auth, firestore } from "../../firebase";
import { fetchCollection, fetchDocument } from "../../firebase/firestore";
import { defaultFirestoreProps } from "../../utils";
import { NextFunction, Request, Response } from "express";
import { isEmpty } from "lodash";

interface Params {
  userId: string;
}

export const postUser = async (
  req: Request<Params, unknown, User, unknown>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const {
    params: { userId },
    body: user,
  } = req;

  console.log(userId, "「Add user」Initialize", {
    params: req.params,
    body: req.body,
  });

  try {
    const p0 = isEmailExists(user.email);
    const p1 = isUserExists(user.id);

    const [_isEmailExists, _isUserExists] = await Promise.all([p0, p1]);

    if (_isEmailExists || _isUserExists)
      res.status(412).send("email_already_exists").end();

    const p2 = addUser(user);
    const p3 = addUserAuth(user);

    await Promise.all([p2, p3]);

    res.sendStatus(200).end();
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const addUser = async (user: User): Promise<void> => {
  const { assignCreateProps } = defaultFirestoreProps();

  await firestore.collection("users").doc(user.id).set(assignCreateProps(user));
};

const addUserAuth = async (user: User): Promise<void> => {
  await auth.createUser({
    uid: user.id,
    email: user.email,
    password: user.password,
  });
};

const isEmailExists = async (email: string): Promise<boolean> => {
  const users = await fetchCollection<User>(
    firestore
      .collection("users")
      .where("isDeleted", "==", false)
      .where("email", "==", email),
  );

  return !isEmpty(users);
};

const isUserExists = async (userId: string): Promise<boolean> => {
  const user = await fetchDocument<User>(
    firestore.collection("users").doc(userId),
  );

  return !isEmpty(user);
};
