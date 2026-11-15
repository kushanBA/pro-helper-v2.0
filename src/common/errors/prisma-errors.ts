function hasPrismaCode(err: unknown, code: string): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === code
  );
}

// Unique constraint violated (e.g. email already used, profile already exists).
export function isUniqueConstraintError(err: unknown): boolean {
  return hasPrismaCode(err, "P2002");
}

// Foreign key constraint violated (e.g. referenced row was deleted meanwhile).
export function isForeignKeyError(err: unknown): boolean {
  return hasPrismaCode(err, "P2003");
}
