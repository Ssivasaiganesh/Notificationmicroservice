import * as t from "../../../dist/api/notifications/types";
import { NotificationService } from "./impl"
const service = new NotificationService();

export const NotificationServiceImpl: t.NotificationsApi = {
    postNotificationsCreate: service.create,
    getNotificationsGet: service.get,
    getNotificatonsGetAll: service.getAll,
    putNotificationsUpdate: service.update,
    deleteNotificationsDelete: service.delete,
}