import { ApiImplementation } from "../../dist/types";
import { NotificationServiceImpl } from "./notifications";
import { NotificationsApi } from "../../dist/api/notifications/types";

export class ServiceImplementation implements ApiImplementation {
    notifications: NotificationsApi = NotificationServiceImpl
}