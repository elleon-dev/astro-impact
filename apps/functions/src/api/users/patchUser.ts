import { auth, firestore } from "../../firebase";
import { defaultFirestoreProps } from "../../utils";
import { NextFunction, Request, Response } from "express";

interface Params {
  userId: string;
}

interface Body {
  updateBy: string;
}

export const patchUser = async (
  req: Request<Params, unknown, Body, unknown>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const {
    params: { userId },
    body: { updateBy },
  } = req;

  console.log("「Delete user」Initialize", userId, {
    params: req.params,
    body: req.body,
  });

  try {
    const p0 = deleteUserFirestore(userId, { updateBy });
    const p1 = deleteUserAuth(userId);

    await Promise.all([p0, p1]);

    res.sendStatus(200).end();
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const deleteUserFirestore = async (
  userId: string,
  user: Partial<User>,
): Promise<void> => {
  const { assignDeleteProps } = defaultFirestoreProps();

  await firestore
    .collection("users")
    .doc(userId)
    .set(assignDeleteProps(user), { merge: true });
};

const deleteUserAuth = async (userId: string): Promise<void> =>
  await auth.deleteUser(userId);
