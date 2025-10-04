import { auth, firestore } from "../../firebase";
import { NextFunction, Request, Response } from "express";
import { isEmpty } from "lodash";
import assert from "assert";
import { defaultFirestoreProps } from "../../utils";
import { fetchCollection, fetchDocument } from "../../firebase/firestore";

interface Params {
  userId: string;
}

export const putUser = async (
  req: Request<Params, unknown, User, unknown>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const {
    params: { userId },
    body: user,
  } = req;

  console.log(userId, "「Update user」Initialize", {
    params: req.params,
    body: req.body,
  });

  try {
    const userFirestore = await fetchUser(user.id);
    const changeEmail = userFirestore.email !== user.email;

    if (changeEmail) {
      const emailExists = await isEmailExists(user.email);

      if (emailExists) res.status(412).send("email_already_exists").end();
    }

    const p0 = updateUser(user);
    const p1 = updateUserAuth(user, changeEmail);

    await Promise.all([p0, p1]);

    res.sendStatus(200).end();
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const updateUser = async (user: User): Promise<void> => {
  const { assignUpdateProps } = defaultFirestoreProps();

  await firestore
    .collection("users")
    .doc(user.id)
    .set(assignUpdateProps(user), { merge: true });
};

const updateUserAuth = async (
  user: User,
  changeEmail: boolean,
): Promise<void> => {
  await auth.updateUser(user.id, {
    ...(changeEmail && { email: user.email }),
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

const fetchUser = async (userId: string): Promise<User> => {
  const user = await fetchDocument<User>(
    firestore.collection("users").doc(userId),
  );

  assert(user, `User doesn't exist: ${userId}`);

  return user;
};
