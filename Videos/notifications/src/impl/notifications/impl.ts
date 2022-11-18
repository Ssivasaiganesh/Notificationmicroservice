import * as t from "../../../dist/api/notifications/types";
import * as v from "../../../dist/validation";
import { db } from "../../db";
import { Api } from "../../../dist/models";
import notifications from "../../../dist/api/notifications";


export class NotificationService {
	private readonly collectionName: string;

	constructor() {
		this.collectionName = "NEW-NOTIFICATIONS";
		this.create = this.create.bind(this);
		this.get = this.get.bind(this);
		this.getAll = this.getAll.bind(this);
		this.update = this.update.bind(this);
		this.delete = this.delete.bind(this);
	}

	async create(request: Api.NotificationsDto | undefined): Promise<t.PostNotificationsCreateResponse> {
		try {
			if (!request) {
				throw new Error("invalid-inputs");
			}

			if (!request.Id) {
				throw new Error("no-Id-found");
			}

			const notificationsRef = db.collection(`${this.collectionName}`).doc(request.Id);
			try {
				await this._checkUserExists(request.Id);
			} catch (error: any) {
				if (error.toString().match("no-notifications-found")) {
					await notificationsRef.set({
						...request,
						isExist: true,
						id: notificationsRef.id,
						createdAt: new Date().toISOString(),
					});
					return {
						status: 201,
						body: request,
					};
				}
			}
			throw new Error("notifications-already-exists");
		} catch (error: any) {
			console.error(error);
			if (error.toString().match("invalid-inputs")) {
				return {
					status: 422,
					body: {
						message: "Invalid request",
					},
				};
			}

			if (error.toString().match("invalid-inputs")) {
				return {
					status: 422,
					body: {
						message: "No Id found in request",
					},
				};
			}

			if (error.toString().match("notifications-already-exists")) {
				return {
					status: 422,
					body: {
						message: "notifications already exists with given Id",
					},
				};
			}
			throw error;
		}
	}
	async get(id: string): Promise<t.GetNotificationsGetResponse> {
		try {
			const notificationsDocSnap = await db.doc(`${this.collectionName}/${id}`).get();
			if (!notificationsDocSnap.exists) {
				throw new Error("no-notifications-found");
			}
			const notifications = v.modelApiNotificationsDtoFromJson("notifications", notificationsDocSnap.data());
			return {
				status: 200,
				body: notifications,
			};
		} catch (error: any) {
			console.error(error);
			if (error.toString().match("no-notifications-found")) {
				return {
					status: 404,
					body: {
						message: "No notifications found with given id",
					},
				};
			}
			throw error;
		}
	}
	async getAll(limit: number | null | undefined, direction: Api.DirectionParamEnum | undefined, sortByField: string | null | undefined): Promise<t.GetNotificatonsGetAllResponse> {
		try {
			const notificationsQuerySnap = await db.collection(`${this.collectionName}`).get();
			const notifications: Api.NotificationsDto[] = notificationsQuerySnap.docs
				.map((doc) => doc.data())
				.map((json) => v.modelApiNotificationsDtoFromJson("notifications", json));
			return {
				status: 200,
				body: {
					items: notifications,
					totalCount: notifications.length,
				},
			};
		} catch (error) {
			console.error(error);
			throw error;
		}
	}
	async update(request: Api.NotificationsDto | undefined): Promise<t.PutNotificationsUpdateResponse> {
		try {
			if (!request) {
				throw new Error("invalid-inputs");
			}

			if (!request.Id) {
				throw new Error("no-uId-found");
			}

			const notificationsRef = db.collection(`${this.collectionName}`).doc(request.Id);
			const notificationsRes = await this._checkUserExists(request.Id);
			await notificationsRef.update({
				...request,
				updatedAt: new Date().toISOString(),
			});
			return {
				status: 200,
				body: {
					...notificationsRes,
					...request,
				},
			};
		} catch (error: any) {
			console.error(error);
			if (error.toString().match("invalid-inputs")) {
				return {
					status: 422,
					body: {
						message: "Invalid request",
					},
				};
			}

			if (error.toString().match("invalid-inputs")) {
				return {
					status: 422,
					body: {
						message: "No id found in request",
					},
				};
			}

			throw error;
		}
	}
	async delete(id: string): Promise<t.DeleteNotificationsDeleteResponse> {
		try {
			await this._checkUserExists(id);
			const notificationsRef = db.collection(`${this.collectionName}`).doc(id);
			await notificationsRef.delete({
				// isExist: false,
				// deletedAt: new Date().toISOString(),
			});
			return {
				status: 200,
				body: {
					message: "notifications deleted successfully",
				},
			};
		} catch (error: any) {
			console.error(error);
			if (error?.response?.status === 404) {
				return {
					status: 404,
					body: {
						message: "notifications already deleted or no notifications found",
					},
				};
			}
			throw error;
		}
	}
	private async _checkUserExists(id: string) {
		const response = await this.get(id);
		if (response.status === 404) {
			throw new Error("no-notifications-found");
		}
		return response.body;
	}

}