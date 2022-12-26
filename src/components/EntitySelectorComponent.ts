import { ISource, IUserDefineComponent } from "basiscore";
import HttpUtil from "../HttpUtil";
import { DefaultSource, MenuOwnerType  } from "../type-alias";
import IProfileInfo from "./profile/IProfileInfo";
import BasisPanelChildComponent from "./BasisPanelChildComponent";
import { IMenuLoaderParam } from "./menu/IMenuInfo";
import IPageLoaderParam from "./menu/IPageLoaderParam";
import { DependencyContainer } from "tsyringe";
import LocalStorageUtil from "../LocalStorageUtil";

declare const $bc: any;
export default abstract class EntitySelectorComponent extends BasisPanelChildComponent {
  private profile: IProfileInfo;
  private element: Element;
  private ownerType: MenuOwnerType;
  private entityList: Array<IEntityInfo>;
  private _isFirst = true;
  protected mustReload = true;
  private currentOwnerid:number = 0
  private currentDomianid:number = 0
  
  public businessComponentFlag: boolean = false;
  constructor(
    owner: IUserDefineComponent,
    desktopLayout: string,
    mobileLayout: string,
    entityType: MenuOwnerType
  ) {
    super(owner, desktopLayout, mobileLayout, `data-bc-bp-${entityType}-container`);
    this.ownerType = entityType;
    this.owner.dc
      .resolve<DependencyContainer>("parent.dc")
      .registerInstance(entityType, this);
  }

  protected abstract getListUrl(): string;

  protected abstract getOwnerUrl(): string;

  protected abstract getSourceId(): string;
  public selectService(el:HTMLElement){
    const msgElId = el.getAttribute("data-id");
    const id = parseInt(msgElId);
    if (id != 0) {
      LocalStorageUtil.setEntitySelectorCurrentValue(this.ownerType, id);
      this.owner.setSource(
        DefaultSource.SHOW_MENU,
        this.createMenuLoaderParam(id)
      );
      this.signalToDisplayPage(id);
      this.setActive();
    }
  }
  public async initializeAsync(): Promise<void> {
    const checkkrkeyInfo  =await this.getCurrentService()
    this.currentOwnerid = checkkrkeyInfo["currentOwnerid"]
    this.currentDomianid = checkkrkeyInfo["currentDmnid"]
    this.element = this.container.querySelector<Element>("[data-bc-main-list]");
    // const elClick = this.element.closest("[data-bc-main-list-container]").querySelector("[data-bc-main-list-click]");
    const elClick = this.element
      .closest("[data-bc-main-list-container]")
      .querySelector("[data-bc-drop-down-click]");
    elClick.addEventListener("click", async (e) => {
      if (this.mustReload) {
        this.mustReload = false;
        await this.fillComboAsync();
      }
      const elStatus = this.element.closest("[data-bc-drop-down-container]");
      const status = elStatus.getAttribute("data-status");
      if (status == "close") {
        elStatus.setAttribute("data-status", "open");
      } else {
        elStatus.setAttribute("data-status", "close");
      }
    });

    const msgElClick = this.element
      .closest("[data-bc-main-list-container]")
      .querySelector("[data-bc-main-list-msg-selective]") as HTMLElement;
    msgElClick?.addEventListener("click", async (e) => {
      this.selectService(msgElClick)
    });

    this.owner.addTrigger([DefaultSource.USER_INFO_SOURCE]);
    return Promise.resolve();
  }


  protected async trySelectFromLocalStorageAsync(): Promise<void> {
    if (this._isFirst) {
      this._isFirst = false;
      if (this.mustReload) {
        this.mustReload = false;
        await this.fillComboAsync();
      }
      const id = LocalStorageUtil.getEntitySelectorLastValue(this.ownerType);
      if (id) {
        const relatedElement = this.element.querySelector<HTMLElement>(
          `[data-id='${id}']`
        );
        if (relatedElement) {
          relatedElement.click();
        }
      }
    }
  }

  public async runAsync(source?: ISource) {
    switch (source?.id) {
      case DefaultSource.USER_INFO_SOURCE: {
        this.profile = source.rows[0];
        if (this.ownerType == "corporate") {
          const corporateList = await this.getEntitiesAsync();

          if (corporateList.length > 0) {
            const corporateElement = this.element
              .closest("[data-bc-bp-main-header]")
              .querySelector("[data-bc-corporate-list]") as HTMLElement;
            corporateElement.style.transform = "scaleY(1)";
          } else {
            const parentElement = this.element.closest(
              "[data-bc-bp-corporate-container]"
            );
            const buyService = document.createElement("div");
            buyService.innerHTML = `<div data-bc-corporate-buy="">
              <span>${this.labels.corporateBuy}</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z" fill="#004B85"/>
              </svg>
            </div>`;
            parentElement.prepend(buyService);
            const buyServiceElement = buyService.querySelector(
              "[data-bc-corporate-buy]"
            ) as HTMLElement;
            setTimeout(function () {
              buyServiceElement.style.transform = "scaleY(1)";
            }, 100);
          }
        }
        break;
      }
    }
    return true;
  }

  protected getEntitiesAsync(): Promise<Array<IEntityInfo>> {
    const url = HttpUtil.formatString(this.getListUrl(), {
      rKey: this.options.rKey,
    });
    return HttpUtil.checkRkeyFetchDataAsync<Array<IEntityInfo>>(
      url,
      "GET",
      this.options.checkRkey
    );
  }

  filterItems(input, list) {
    let filterList = list.filter(function (e) {
      return e.title.toLowerCase().includes(input.toLowerCase());
    });
    return filterList;
  }

  protected async fillComboAsync() {
    const businessMsgElement = this.element
      .closest("[data-bc-bp-main-header]")
      .querySelector("[data-bc-business-list]") as HTMLElement;
    this.entityList = await this.getEntitiesAsync();
   
    if (this.businessComponentFlag == true && this.entityList.length > 0) {
      businessMsgElement.style.transform = "scaleY(1)";
    } else if (
      this.businessComponentFlag == true &&
      this.entityList.length == 0
    ) {
      businessMsgElement.style.transform = "scaleY(0)";
    }

    this.clearCombo();
    const searchWrapper = document.createElement("div");
    const searchInput = document.createElement("input");
    searchInput.setAttribute("type", "text");
    if (this.entityList?.length > 5) {
      if (this.ownerType == "corporate") {
        searchWrapper.setAttribute("data-bc-corporate-search", "");
        searchInput.setAttribute("data-bc-corporate-search-input", "");
        searchInput.setAttribute("data-sys-input-text", "");
        searchInput.setAttribute("placeHolder", this.labels.corporateSearchPlaceholder);
        searchWrapper.appendChild(searchInput);
      } else if (this.ownerType == "business") {
        searchWrapper.setAttribute("data-bc-business-search", "");
        searchInput.setAttribute("data-bc-business-search-input", "");
        searchInput.setAttribute("data-sys-input-text", "");
        searchInput.setAttribute("placeHolder", this.labels.businessSearchPlaceholder);
        searchWrapper.appendChild(searchInput);
      }
    }
    let listFilter = this.entityList;
    
    searchInput.addEventListener("keyup", (e) => {
      listFilter = [];
      if (e.target["value"] == "") {
        listFilter = this.entityList;
      }
      listFilter = this.filterItems(e.target["value"], this.entityList);
      this.entryListMaker(listFilter);
    });

    this.entryListMaker(listFilter);
    this.element.previousSibling.remove();
    this.element.parentNode.insertBefore(searchWrapper, this.element);
  }

  protected async onItemSelectAsync(id: number) {
    await this.setActiveAsync(id);
    this.owner.setSource(
      DefaultSource.SHOW_MENU,
      this.createMenuLoaderParam(id)
    );
    this.signalToDisplayPage(id);
  }

   entryListMaker(list) {
    this.element.innerHTML = "";
   
    if (list?.length > 0) {
     
      list.forEach(async item => {
        const li = document.createElement("li");
        // const div = document.createElement("div");
        li.setAttribute("data-id", item.id.toString());
        li.addEventListener("click", async (e) => {
          e.preventDefault();
          const id = parseInt(li.getAttribute("data-id"));
          const entity = this.entityList.find((x) => x.id == id);
          LocalStorageUtil.setEntitySelectorCurrentValue(this.ownerType, id);
          if (this.profile) {
            if (entity) {
              await this.onItemSelectAsync(id);
            }
          }
          this.owner.setSource(this.getSourceId(), entity ?? {});
          if (this.ownerType == "corporate") {
            // choose corporate
            this.resetBusinessEntity();
          } else if (this.ownerType == "business") {
            $bc.setSource("basispanelcomponent_entityselectorcomponent.businessid", id);
          }
       
          this.setActive();
          this.selectItem(li);
        });
        li.innerHTML = `<div data-bc-main-title="">${item.title}</div>`;
        const id = parseInt(li.getAttribute("data-id"));
        if (this.ownerType == "business") {
          const lockIcon = document.createElement("span");
          lockIcon.setAttribute("data-bc-business-freeze-btn", "");
          lockIcon.innerHTML = `<svg width="12" height="15" viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.1403 7.58398C4.49863 7.58398 3.97363 8.10898 3.97363 8.75065C3.97363 9.39232 4.49863 9.91732 5.1403 9.91732C5.78197 9.91732 6.30697 9.39232 6.30697 8.75065C6.30697 8.10898 5.78197 7.58398 5.1403 7.58398ZM8.6403 4.66732H8.05697V3.50065C8.05697 1.89065 6.7503 0.583984 5.1403 0.583984C3.8103 0.583984 2.64947 1.48232 2.31697 2.77148C2.2353 3.08648 2.42197 3.40148 2.73697 3.48315C3.04613 3.56482 3.36697 3.37815 3.44863 3.06315C3.64697 2.29315 4.34113 1.75065 5.1403 1.75065C6.1028 1.75065 6.8903 2.53815 6.8903 3.50065V4.66732H1.6403C0.998633 4.66732 0.473633 5.19232 0.473633 5.83398V11.6673C0.473633 12.309 0.998633 12.834 1.6403 12.834H8.6403C9.28197 12.834 9.80697 12.309 9.80697 11.6673V5.83398C9.80697 5.19232 9.28197 4.66732 8.6403 4.66732ZM8.6403 11.084C8.6403 11.4048 8.3778 11.6673 8.05697 11.6673H2.22363C1.9028 11.6673 1.6403 11.4048 1.6403 11.084V6.41732C1.6403 6.09648 1.9028 5.83398 2.22363 5.83398H8.05697C8.3778 5.83398 8.6403 6.09648 8.6403 6.41732V11.084Z" fill="#767676"/></svg>`;
          lockIcon.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            this.setActiveAsync(id);
            $bc.setSource("basispanelcomponent_entityselectorcomponent.businessid", id);
            // // refresh page
            // const newParam: IPageLoaderParam = {
            //   pageId: LocalStorageUtil.getCurrentPage().pageId,
            //   owner: LocalStorageUtil.getCurrentPage().owner,
            //   ownerId: LocalStorageUtil.getCurrentPage().ownerId,
            //   ownerUrl: LocalStorageUtil.getCurrentPage().ownerUrl,
            //   rKey: this.options.rKey,
            //   pageMethod: LocalStorageUtil.getCurrentPage().pageMethod,
            // };
            // this.owner.setSource(DefaultSource.DISPLAY_PAGE, newParam);
      
            this.selectItem(li, true);
          });
          li.appendChild(lockIcon);
        }
       
        if(id == this.currentOwnerid && this._isFirst){
          const entity = this.entityList.find((x) => x.id == id);
          await this.setActiveAsync(id);
          LocalStorageUtil.setEntitySelectorCurrentValue("corporate", id);
           this.owner.setSource(this.getSourceId(), entity ?? {});
           this.setActive();
           this.selectItem(li);
           const businessActive = this.container.querySelector(".active-business")
           const serviceActive = this.container.querySelector(".active-corporate")
           if(businessActive){
            businessActive.classList.remove("active-business")
           }
           if(serviceActive){
            serviceActive.classList.remove("active-corporate")
           }



        }
   
        if(id == this.currentDomianid && this._isFirst){
          const entity = this.entityList.find((x) => x.id == id);
          await this.setActiveAsync(id);
          // LocalStorageUtil.setEntitySelectorCurrentValue("business", id);
           this.owner.setSource(this.getSourceId(), entity ?? {});
          //  this.setActive();
           this.selectItem(li);
           const businessActive = this.container.querySelector(".active-business")
           const serviceActive = this.container.querySelector(".active-corporate")
           if(businessActive){
            businessActive.classList.remove("active-business")
           }
           if(serviceActive){
            serviceActive.classList.remove("active-corporate")
           }


       }
        this.element.appendChild(li);
        //ver 2
        if(list?.length == 1){
          await this.setActiveAsync(list[0].id);
          // LocalStorageUtil.setEntitySelectorCurrentValue(this.ownerType, list[0].id);
           this.owner.setSource(this.getSourceId(), list[0] ?? {});
          //  this.setActive();
           this.selectItem(li);
           const businessActive = this.container.querySelector(".active-business")
           const serviceActive = this.container.querySelector(".active-corporate")
           if(businessActive){
            businessActive.classList.remove("active-business")
           }
           if(serviceActive){
            serviceActive.classList.remove("active-corporate")
           }
        }
      });
     
    }
  }

  protected async setActiveAsync(id: number) {
    const url = HttpUtil.formatString(this.options.baseUrl.active, {
      rKey: this.options.rKey,
    });
    await HttpUtil.checkRkeyFetchDataAsync(
      url,
      "POST",
      this.options.checkRkey,
      {
        type: this.ownerType,
        id: id
      }
    );
  }

  setActive() {
    if (this.ownerType == "corporate") {
      // choose corporate
      this.element
        .closest("[data-bc-bp-main-header]")
        .querySelector(".active-business")
        ?.classList.remove("active-business");
      this.element
        .closest("[data-bc-main-list-container]")
        .classList.add("active-corporate");
    } else if (this.ownerType == "business") {
      // choose business
      this.element
        .closest("[data-bc-bp-main-header]")
        .querySelector(".active-corporate")
        ?.classList.remove("active-corporate");
      this.element
        .closest("[data-bc-main-list-container]")
        .classList.add("active-business");
    }
  }

  InitializeSetActive() {
    if (this.ownerType == "corporate") {
      // choose corporate
      this.element
        .closest("[data-bc-bp-main-header]")
        .querySelector(".active-business")
        ?.classList.remove("active-business");
      this.element
        .closest("[data-bc-main-list-container]")
        .classList.add("active-corporate");
    } else if (this.ownerType == "business") {
      // choose business
      this.element
        .closest("[data-bc-bp-main-header]")
        .querySelector(".active-corporate")
        ?.classList.remove("active-corporate");
      this.element
        .closest("[data-bc-main-list-container]")
        .classList.add("active-business");
    }
  }

  protected resetBusinessEntity() {
    $bc.setSource("basispanelcomponent_entityselectorcomponent.businessid", 0);

    const header = this.element.closest("[data-bc-bp-main-header]");
    const businessMsgElement = header.querySelector(
      "[data-bc-business-msg]"
    );
    businessMsgElement.textContent = this.labels.businessTitle;
    businessMsgElement.setAttribute("data-id", "0");
    businessMsgElement.removeAttribute("data-bc-main-list-msg-select");
    header
      .querySelector(
        "[data-bc-bp-business-container] [data-bc-main-name]"
      )
      ?.remove();
  }
  private async getCurrentService(){
    const url = HttpUtil.formatString(this.options.checkRkey.url, { rKey: this.options.rKey });
    const result = await HttpUtil.fetchDataAsync(url, "GET");
    return result
  }
  protected selectItem(li: HTMLElement, freeze: boolean = false) {
    const entityElement = this.element
      .closest("[data-bc-main-list-container]")
      .querySelector("[data-bc-main-name]");
    if (entityElement) {
      entityElement.remove();
    }

    const containerMsgElement = this.element
      .closest("[data-bc-main-list-container]")
      .querySelector("[data-bc-main-list-msg]");

    const entityName = document.createElement("div");
    entityName.setAttribute("data-bc-main-name", "");

    if (!freeze) {
      entityName.textContent = li.textContent;
    } else {
      const switchInput = document.createElement("input");
      switchInput.setAttribute("type", "checkbox");
      switchInput.setAttribute("id", "switch");
      switchInput.setAttribute("data-bc-business-freeze-input", "");
      switchInput.setAttribute("checked", "checked");
      switchInput.addEventListener("change", async (e) => {
        const checked = switchInput.checked;
        if (!checked) {
          this.resetBusinessEntity();
        }
      });
      entityName.appendChild(switchInput);
      const switchLabel = document.createElement("label");
      switchLabel.setAttribute("for", "switch");
      switchLabel.setAttribute("data-bc-business-freeze-label", "");
      switchLabel.innerHTML = `<span data-bc-business-freeze-switch=""><svg width="6" height="8" viewBox="0 0 6 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.18581 2.63636H4.8449V1.95455C4.8449 1.01364 4.08127 0.25 3.14036 0.25C2.19945 0.25 1.43581 1.01364 1.43581 1.95455V2.63636H1.0949C0.719904 2.63636 0.413086 2.94318 0.413086 3.31818V6.72727C0.413086 7.10227 0.719904 7.40909 1.0949 7.40909H5.18581C5.56081 7.40909 5.86763 7.10227 5.86763 6.72727V3.31818C5.86763 2.94318 5.56081 2.63636 5.18581 2.63636ZM3.14036 5.70455C2.76536 5.70455 2.45854 5.39773 2.45854 5.02273C2.45854 4.64773 2.76536 4.34091 3.14036 4.34091C3.51536 4.34091 3.82218 4.64773 3.82218 5.02273C3.82218 5.39773 3.51536 5.70455 3.14036 5.70455ZM2.11763 2.63636V1.95455C2.11763 1.38864 2.57445 0.931818 3.14036 0.931818C3.70627 0.931818 4.16309 1.38864 4.16309 1.95455V2.63636H2.11763Z" fill="#004B85"/></svg></span>`;
      entityName.appendChild(switchLabel);
      const title = document.createTextNode(li.textContent);
      entityName.appendChild(title);
    }

    containerMsgElement.parentNode.insertBefore(
      entityName,
      containerMsgElement.nextSibling
    );


    const selectiveList = entityName.closest("[data-bc-d1-main-list-info]") as HTMLElement
    containerMsgElement.setAttribute("data-bc-main-list-msg-select", "");
    selectiveList.setAttribute("data-bc-main-list-msg-selective", "");
    selectiveList.setAttribute(
      "data-id",
      li.getAttribute("data-id")
    );
    selectiveList.addEventListener("click" , (e) => {
      this.selectService(selectiveList)
    })
    this.element
      .closest("[data-bc-drop-down-container]")
      .setAttribute("data-status", "close");
  }

  protected clearCombo() {
    this.element.innerHTML = "";
  }

  protected createMenuLoaderParam(id: Number): IMenuLoaderParam {
    const menuParam: IMenuLoaderParam = {
      owner: this.ownerType,
      // ownerId: this.element.value,
      ownerId: id.toString(),
      ownerUrl: this.getOwnerUrl(),
      rKey: this.options.rKey,
      menuMethod: this.options.method.menu,
    };
    return menuParam;
  }

  private async signalToDisplayPage(id: Number) {
    const activeMenus = document.querySelectorAll("[data-bc-menu-active]");
    activeMenus.forEach((e) => {
      e.removeAttribute("data-bc-menu-active");
    });

    const newParam: IPageLoaderParam = {
      pageId: "default",
      owner: this.ownerType,
      ownerId: id.toString(),
      ownerUrl: this.getOwnerUrl(),
      rKey: this.options.rKey,
      pageMethod: this.options.method.page,
    };
    this.owner.setSource(DefaultSource.DISPLAY_PAGE, newParam);
  }
}

export interface IEntityInfo {
  id: number;
  title: string;
}
