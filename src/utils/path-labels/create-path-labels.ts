import { ClassroomT } from "@/types/classrooms";
import basePathLabels from "./base";

const createPathLabels = (classrooms: ClassroomT[]) => ({
  ...basePathLabels,
  ...Object.fromEntries(classrooms.map((c) => [c.id, c.name])),
});

export default createPathLabels;
