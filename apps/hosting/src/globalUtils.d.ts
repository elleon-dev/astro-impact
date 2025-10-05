// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ObjectType = { [field: string]: any };

type OmitDefaultFirestoreProps<T> = Omit<T, keyof DefaultFirestoreProps>;

type OmitDefaultApiProps<T> = Omit<
  T,
  keyof Omit<DefaultFirestoreProps, "updateBy">
>;

interface DefaultFirestoreProps {
  createAt: firebase.firestore.Timestamp;
  updateAt: firebase.firestore.Timestamp;
  updateBy: string;
  isDeleted: boolean;
}

type MergeDocument<T extends ObjectType> = PartialExcept<T, "id"> | T;

type Translate = (
  key: string,
  params?: string[],
  defaultTranslation?: string
) => string;

type FormOnChange = (...event: unknown[]) => void;

type OnNavigateTo = (pathname: string, options?: OnNavigateToOptions) => void;

interface OnNavigateToOptions {
  replace?: boolean;
  state?: ObjectType;
  preventScrollReset?: boolean;
  relative?: "route" | "path";
}

type OnGoBack = () => void;

type PartialExcept<T extends ObjectType, K extends keyof T> = Partial<T> &
  Pick<T, K>;

type NestedKeyOf<Record extends ObjectType> = {
  [Key in keyof Record & (string | number)]: Record[Key] extends ObjectType
    ? `${Key}` | `${Key}.${NestedKeyOf<Record[Key]>}`
    : `${Key}`;
}[keyof Record & (string | number)];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cons<H, T> = T extends readonly any[]
  ? ((h: H, ...t: T) => void) extends (...r: infer R) => void
    ? R
    : never
  : never;

type Prev = [
  never,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  ...0[]
];

type Paths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends ObjectType
  ? {
      [K in keyof T]-?:
        | [K]
        | (Paths<T[K], Prev[D]> extends infer P
            ? P extends []
              ? never
              : Cons<K, P>
            : never);
    }[keyof T]
  : [];
