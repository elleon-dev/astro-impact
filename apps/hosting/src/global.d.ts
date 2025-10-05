type OmitDefaultFirestoreProps<T> = Omit<T, keyof DefaultFirestoreProps>;
type Timestamp = FirebaseFirestore.Timestamp;

interface DefaultFirestoreProps {
  createAt: Timestamp;
  updateAt: Timestamp;
  updateBy: string;
  isDeleted: boolean;
}

interface SettingDefault {
  version: string;
}

type LanguageCode = "en" | "es";

interface Setting {
  version: string;
}

interface User extends DefaultFirestoreProps {
  readonly id: string;
  clientsIds: string[];
  email: string;
  firstName: string;
  updateBy: string;
  lastName: string;
  password: string;
  roleCode: RoleCode;
}

interface Spam extends DefaultFirestoreProps {
  id: string;
  type: "email" | "phone";
  value: string;
}
