// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ObjectType = { [field: string]: any };

type FirestoreFieldValue<T> = {
  [P in keyof T]: T[P] | FirebaseFirestore.FieldValue;
};

type PromiseResolve<T> = (value: T | PromiseLike<T>) => void;

type PromiseReject = (reason?: unknown) => void;

/* eslint-disable */

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

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
  ...0[],
];

type Paths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
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
