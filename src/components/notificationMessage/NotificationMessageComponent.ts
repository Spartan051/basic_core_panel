import { IDependencyContainer, ISource, IUserDefineComponent } from "basiscore";
import BasisPanelChildComponent from "../BasisPanelChildComponent";
import desktopLayout from "./assets/layout.html";
import "./assets/style.css";
import INotifiationMessage from "./INotificationMessage";

export default class NotificationMessageComponent
  extends BasisPanelChildComponent
  implements INotifiationMessage
{
  constructor(owner: IUserDefineComponent) {
    super(owner, desktopLayout, desktopLayout, "data-bc-bp-message-container");
    this.owner.dc
      .resolve<IDependencyContainer>("parent.dc")
      .registerInstance("message", this);
  }

  public initializeAsync(): Promise<void> {
    return Promise.resolve();
  }
  public showMessage(type: string, message: "error" | "success") {
    const container = this.container.querySelector(".NotificationMessage");
    if (!container.hasAttribute("data-sys-message-fade-in")) {
      if (type === "success") {
        container.innerHTML = `<div class="NotificationMessage-content" >
        <svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M18.5 36.8332C9.85754 36.8332 5.53633 36.8332 2.85148 34.1483C0.166626 31.4635 0.166626 27.1423 0.166626 18.4998C0.166626 9.85742 0.166626 5.53621 2.85148 2.85136C5.53633 0.166504 9.85754 0.166504 18.5 0.166504C27.1424 0.166504 31.4636 0.166504 34.1484 2.85136C36.8333 5.53621 36.8333 9.85742 36.8333 18.4998C36.8333 27.1423 36.8333 31.4635 34.1484 34.1483C31.4636 36.8332 27.1424 36.8332 18.5 36.8332ZM25.8889 12.9442C26.4259 13.4812 26.4259 14.3518 25.8889 14.8888L16.7222 24.0554C16.1853 24.5924 15.3147 24.5924 14.7777 24.0554L11.111 20.3888C10.574 19.8518 10.574 18.9812 11.111 18.4442C11.648 17.9073 12.5186 17.9073 13.0556 18.4442L15.75 21.1386L23.9444 12.9442C24.4813 12.4073 25.3519 12.4073 25.8889 12.9442Z" fill="#006A5E"/>
        </svg>
        <div class="message">
            <span id="messageText" class="text text-2"> ${message} </span>
        </div>
    </div><div class="progress success-progress"></div>`;
        const progress = document.querySelector(".progress");
        progress.classList.add("activeNotification");

        container.setAttribute("data-bc-message-success", "");
        container.setAttribute("data-sys-message-fade-in", "");

        setTimeout(function () {
          container.removeAttribute("data-sys-message-fade-in");
          container.setAttribute("data-sys-message-fade-out", "");
          container.removeAttribute("data-bc-message-success");
          progress.classList.remove("activeNotification");
        }, 3000);
      } else if (type === "error") {
        container.setAttribute("data-sys-message-fade-in", "");

        container.innerHTML = `<div class="NotificationMessage-content" >
        <svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M18.5 36.8332C9.85754 36.8332 5.53634 36.8332 2.85148 34.1483C0.166626 31.4635 0.166626 27.1423 0.166626 18.4998C0.166626 9.85742 0.166626 5.53621 2.85148 2.85136C5.53634 0.166504 9.85754 0.166504 18.5 0.166504C27.1424 0.166504 31.4636 0.166504 34.1484 2.85136C36.8333 5.53621 36.8333 9.85742 36.8333 18.4998C36.8333 27.1423 36.8333 31.4635 34.1484 34.1483C31.4636 36.8332 27.1424 36.8332 18.5 36.8332ZM12.9443 12.9442C13.4813 12.4073 14.3519 12.4073 14.8889 12.9442L18.4999 16.5553L22.111 12.9443C22.648 12.4073 23.5186 12.4073 24.0555 12.9443C24.5925 13.4812 24.5925 14.3518 24.0555 14.8888L20.4445 18.4999L24.0555 22.1109C24.5925 22.6478 24.5925 23.5184 24.0555 24.0554C23.5185 24.5924 22.6479 24.5924 22.1109 24.0554L18.4999 20.4444L14.8889 24.0554C14.3519 24.5924 13.4813 24.5924 12.9444 24.0554C12.4074 23.5185 12.4074 22.6479 12.9444 22.1109L16.5554 18.4999L12.9443 14.8888C12.4073 14.3518 12.4073 13.4812 12.9443 12.9442Z" fill="#B40020"/>
        </svg>
        <div class="message">
            <span id="messageText" class="text text-2"> ${message} </span>
        </div>
    </div><div class="progress error-progress"></div>
        `;
        const progress = document.querySelector(".progress");
        progress.classList.add("activeNotification");
        container.setAttribute("data-bc-message-error", "");
        setTimeout(function () {
          container.removeAttribute("data-sys-message-fade-in");
          container.setAttribute("data-sys-message-fade-out", "");
          container.removeAttribute("data-bc-message-error");

          progress.classList.remove("activeNotification");
        }, 3000);
      }
    }
  }
  public runAsync(source?: ISource) {
    return true;
  }
}
