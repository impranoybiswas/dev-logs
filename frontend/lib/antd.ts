import type { MessageInstance } from "antd/es/message/interface";
import type { ModalStaticFunctions } from "antd/es/modal/confirm";
import type { NotificationInstance } from "antd/es/notification/interface";

let message: MessageInstance;
let notification: NotificationInstance;
let modal: ModalStaticFunctions;

export const setStaticFunctions = (functions: {
  message: MessageInstance;
  notification: NotificationInstance;
  modal: ModalStaticFunctions;
}) => {
  message = functions.message;
  notification = functions.notification;
  modal = functions.modal;
};

export { message, notification, modal };
