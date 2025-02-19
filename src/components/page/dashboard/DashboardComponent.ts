import PageComponent from "../PageComponent";
import desktopLayout from "./assets/layout-desktop.html";
import mobileLayout from "./assets/layout-mobile.html";
import "./assets/style.css";
import "./assets/style-desktop.css";
import "./assets/style-mobile.css";
import { IUserDefineComponent, ISource } from "basiscore";
import HttpUtil from "../../../HttpUtil";
import IPageInfo from "../IPageInfo";
import { PageType } from "../PageType";
import WorkspaceComponent from "../../workspace/WorkspaceComponent";

export default class DashboardComponent extends PageComponent {
  public _groupsAdded: boolean = false;
  constructor(owner: IUserDefineComponent) {
    super(owner, desktopLayout, mobileLayout, "data-bc-bp-page-container");
  }
  public get type(): PageType {
    return PageType.Dashboard;
  }

  public async initializeAsync(): Promise<void> {
    super.initializeAsync()

    const body = this.container.querySelector("[data-bc-page-body]");
    const nodes = Array.from(this.container.childNodes);
    this.owner.processNodesAsync(nodes);

    // const wrapper = this.container;
    // this.container.querySelector("[data-bc-page-widgets-list]")?.addEventListener("click", function (e) {
    //   wrapper.querySelector("[data-bc-page-widgets-list-toggle]").classList.toggle('active');
    // });
  }

  public async runAsync(source?: ISource) {
    if (!this._groupsAdded) {
      await this.addingPageGroupsAsync(this.info);
      this._groupsAdded = true;
    }
    return true;
  }
}
