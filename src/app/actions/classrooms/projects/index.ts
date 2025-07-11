import {
  createClassroomProject,
  getAllProjectsByClassroomId,
  getAllProjectsWithDeliveriesAndCorrectionsByClassroomId,
  getClassroomProjectById,
  updateClassroomProjectById,
  deleteProjectById,
} from "./projects";

import {
  createClassroomProjectDelivery,
  getAllDeliveriesByProjectId,
  getClassroomProjectDeliveryById,
  updateClassroomProjectDeliveryById,
  deleteDeliveryById,
} from "./deliveries";

import {
  createClassroomProjectCorrection,
  getAllCorrectionsByProjectId,
  getAllCorrectionsByDeliveryId,
  getClassroomProjectCorrectionById,
  updateClassroomProjectCorrectionById,
  deleteCorrectionById,
} from "./corrections";

export {
  createClassroomProject,
  getAllProjectsByClassroomId,
  getAllProjectsWithDeliveriesAndCorrectionsByClassroomId,
  getClassroomProjectById,
  updateClassroomProjectById,
  deleteProjectById,
  createClassroomProjectDelivery,
  getAllDeliveriesByProjectId,
  getClassroomProjectDeliveryById,
  updateClassroomProjectDeliveryById,
  deleteDeliveryById,
  createClassroomProjectCorrection,
  getAllCorrectionsByProjectId,
  getAllCorrectionsByDeliveryId,
  getClassroomProjectCorrectionById,
  updateClassroomProjectCorrectionById,
  deleteCorrectionById,
};
